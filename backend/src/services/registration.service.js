import mongoose from 'mongoose';
import { Event } from '../models/event.model.js';
import { Registration } from '../models/registration.model.js';
import { UserService } from './user.service.js';
import { sendNotificationToUser } from './notification.service.js';

export const RegistrationService = {

  /**
   * TNV đăng ký tham gia sự kiện
   * - Kiểm tra event tồn tại và status = OPENED
   * - Kiểm tra đăng ký trước 24h
   * - Kiểm tra chưa đăng ký (hoặc đã CANCELLED để re-register)
   * - Kiểm tra còn chỗ (maxParticipants)
   * - Tạo/cập nhật registration với status = PENDING
   * - Không tăng currentParticipants (chỉ tính APPROVED)
   */
  async registerEvent(eventId, userId, userInfo) {
    try {
      // 1. Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        const err = new Error('INVALID_EVENT_ID');
        err.status = 400;
        err.details = 'ID sự kiện không hợp lệ';
        throw err;
      }

      // 2. Kiểm tra event tồn tại
      const event = await Event.findById(eventId);
      if (!event) {
        const err = new Error('EVENT_NOT_FOUND');
        err.status = 404;
        err.details = 'Không tìm thấy sự kiện';
        throw err;
      }

      // 3. Kiểm tra event status = OPENED
      if (event.status !== 'OPENED') {
        const err = new Error('EVENT_NOT_OPENED');
        err.status = 400;
        err.details = `Sự kiện chưa mở đăng ký. Trạng thái hiện tại: ${event.status}`;
        throw err;
      }

      // 4. Kiểm tra đăng ký trước 24h (startTime - now >= 24h)
      const now = new Date();
      const timeDiff = event.startTime - now;
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        const err = new Error('REGISTRATION_TOO_LATE');
        err.status = 400;
        err.details = 'Chỉ có thể đăng ký trước 24 giờ sự kiện bắt đầu';
        throw err;
      }

      // 5. Kiểm tra đã đăng ký chưa
      const existingRegistration = await Registration.findOne({
        eventId,
        volunteerId: userId
      });

      // Nếu đã đăng ký và không phải CANCELLED → không cho đăng ký lại
      if (existingRegistration && existingRegistration.status !== 'CANCELLED') {
        const err = new Error('ALREADY_REGISTERED');
        err.status = 409;
        err.details = `Bạn đã đăng ký sự kiện này với trạng thái: ${existingRegistration.status}`;
        throw err;
      }

      // 6. Kiểm tra còn chỗ trống (chỉ tính APPROVED)
      if (event.maxParticipants > 0) {
        const approvedCount = await Registration.countDocuments({
          eventId,
          status: 'APPROVED'
        });

        if (approvedCount >= event.maxParticipants) {
          const err = new Error('EVENT_FULL');
          err.status = 400;
          err.details = `Sự kiện đã đủ số lượng tham gia (${event.maxParticipants} người)`;
          throw err;
        }
      }

      let registration;

      // 7. Nếu đã CANCELLED → cập nhật lại thành PENDING (re-register)
      if (existingRegistration && existingRegistration.status === 'CANCELLED') {
        registration = await Registration.findByIdAndUpdate(
          existingRegistration._id,
          {
            $set: {
              status: 'PENDING',
              volunteerName: userInfo.name || '',
              volunteerEmail: userInfo.email || '',
              registeredAt: new Date()
            },
            $unset: { approvedBy: 1 } // Clear approvedBy nếu có
          },
          { new: true }
        ).lean();
      } else {
        // 8. Tạo registration mới
        const newRegistration = await Registration.create({
          eventId,
          volunteerId: userId,
          volunteerName: userInfo.name || '',
          volunteerEmail: userInfo.email || '',
          status: 'PENDING',
          registeredAt: new Date()
        });

        registration = newRegistration.toObject();
      }
      // Ghi lịch sử cho volunteer
      const eventTitle = event?.title || '';
      await UserService.pushHistory(
        userId,
        `Bạn đã gửi yêu cầu tham gia sự kiện "${eventTitle}"`,
      );
      return registration;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy danh sách đăng ký đang chờ duyệt cho các sự kiện do managerId tổ chức
   */
  async getManagerPendingRegistrations(managerId) {
    // 1. Find all events organized by this manager
    const Event = mongoose.model('Event');
    const events = await Event.find({ organizerId: managerId }).select('_id title').lean();

    if (!events.length) return [];

    const eventIds = events.map(e => e._id);

    // 2. Find PENDING registrations for these events
    const registrations = await Registration.find({
      eventId: { $in: eventIds },
      status: 'PENDING'
    })
      .sort({ registeredAt: -1 })
      .populate('volunteerId', 'name email avatar') // Populate user info
      .lean();

    // Map event title to registration for easier display
    const eventMap = events.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.title;
      return acc;
    }, {});

    return registrations.map(reg => ({
      ...reg,
      eventTitle: eventMap[reg.eventId.toString()]
    }));
  },

  /**
   * TNV xem danh sách sự kiện mình đã đăng ký
   */
  async getMyRegistrations(userId) {
    const registrations = await Registration.find({
      volunteerId: userId
    })
      .populate('eventId', 'title description location address startTime endTime status coverImageUrl maxParticipants currentParticipants')
      .sort({ registeredAt: -1 }) // Mới nhất trước
      .lean();

    return registrations;
  },

  /**
   * TNV hủy đăng ký sự kiện
   * - Chỉ đổi status thành CANCELLED (không xóa)
   * - Phải trước 24h sự kiện bắt đầu
   * - Chỉ hủy được khi status = PENDING hoặc APPROVED
   * - Nếu đang APPROVED thì giảm currentParticipants
   */
  async cancelRegistration(eventId, userId) {
    try {
      // 1. Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        const err = new Error('INVALID_EVENT_ID');
        err.status = 400;
        err.details = 'ID sự kiện không hợp lệ';
        throw err;
      }

      // 2. Tìm registration
      const registration = await Registration.findOne({
        eventId,
        volunteerId: userId
      });

      if (!registration) {
        const err = new Error('REGISTRATION_NOT_FOUND');
        err.status = 404;
        err.details = 'Không tìm thấy đăng ký của bạn cho sự kiện này';
        throw err;
      }

      // 3. Kiểm tra status (chỉ hủy được PENDING hoặc APPROVED)
      if (!['PENDING', 'APPROVED'].includes(registration.status)) {
        const err = new Error('CANNOT_CANCEL');
        err.status = 400;
        err.details = `Không thể hủy đăng ký ở trạng thái: ${registration.status}`;
        throw err;
      }

      // 4. Kiểm tra event
      const event = await Event.findById(eventId);
      if (!event) {
        const err = new Error('EVENT_NOT_FOUND');
        err.status = 404;
        err.details = 'Không tìm thấy sự kiện';
        throw err;
      }

      // 5. Kiểm tra hủy trước 24h (Chỉ áp dụng với đã duyệt)
      const now = new Date();
      const timeDiff = event.startTime - now;
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (registration.status === 'APPROVED' && hoursDiff < 24) {
        const err = new Error('CANCELLATION_TOO_LATE');
        err.status = 400;
        err.details = 'Đối với sự kiện đã được duyệt, chỉ có thể hủy đăng ký trước 24 giờ sự kiện bắt đầu';
        throw err;
      }

      // 6. Đổi status thành CANCELLED
      const wasApproved = registration.status === 'APPROVED';

      registration.status = 'CANCELLED';
      await registration.save();

      // 7. Nếu đang APPROVED → giảm currentParticipants
      if (wasApproved) {
        await Event.findByIdAndUpdate(
          eventId,
          { $inc: { currentParticipants: -1 } }
        );
      }

      // Ghi lịch sử cho volunteer
      const eventTitle = event?.title || '';
      await UserService.pushHistory(
        userId,
        `Bạn đã hủy đăng ký sự kiện "${eventTitle}"`,
      );
      return registration.toObject();

    } catch (error) {
      throw error;
    }
  },

  /**
   * MANAGER xem danh sách tình nguyện viên đã đăng ký sự kiện
   * Populate volunteer info (name, email)
   */
  async getEventRegistrations(eventId) {
    const registrations = await Registration.find({
      eventId
    })
      .populate('volunteerId', 'name email dateOfBirth gender')
      .populate('approvedBy', 'name email')
      .sort({ registeredAt: -1 }) // Mới nhất trước
      .lean();

    return registrations;
  },

  /**
   * MANAGER duyệt đăng ký tình nguyện viên
   * - Chỉ duyệt khi status = PENDING
   * - Kiểm tra maxParticipants
   * - Đổi status = APPROVED
   * - Tăng currentParticipants
   * - Lưu approvedBy
   */
  async approveRegistration(regId, managerId) {
    try {
      // 1. Tìm registration
      const registration = await Registration.findById(regId);

      if (!registration) {
        const err = new Error('REGISTRATION_NOT_FOUND');
        err.status = 404;
        err.details = 'Không tìm thấy đăng ký';
        throw err;
      }

      // 2. Kiểm tra status = PENDING
      if (registration.status !== 'PENDING') {
        const err = new Error('INVALID_STATUS');
        err.status = 400;
        err.details = `Chỉ có thể duyệt đăng ký đang chờ (PENDING). Hiện tại: ${registration.status}`;
        throw err;
      }

      // 3. Kiểm tra event
      const event = await Event.findById(registration.eventId);

      if (!event) {
        const err = new Error('EVENT_NOT_FOUND');
        err.status = 404;
        err.details = 'Không tìm thấy sự kiện';
        throw err;
      }

      // 4. Kiểm tra maxParticipants (chỉ tính APPROVED)
      if (event.maxParticipants > 0) {
        const approvedCount = await Registration.countDocuments({
          eventId: event._id,
          status: 'APPROVED'
        });

        if (approvedCount >= event.maxParticipants) {
          const err = new Error('EVENT_FULL');
          err.status = 400;
          err.details = `Sự kiện đã đủ số lượng tham gia (${event.maxParticipants} người)`;
          throw err;
        }
      }

      // 5. Cập nhật registration
      registration.status = 'APPROVED';
      registration.approvedBy = managerId;
      await registration.save();

      // 6. Tăng currentParticipants
      await Event.findByIdAndUpdate(
        event._id,
        { $inc: { currentParticipants: 1 } }
      );

      // Populate để trả về đầy đủ info
      const result = await Registration.findById(regId)
        .populate('volunteerId', 'name email')
        .populate('approvedBy', 'name email')
        .lean();

      // Ghi lịch sử cho volunteer
      const volunteerId = result?.volunteerId?._id || result?.volunteerId;
      const eventTitle = event?.title || '';
      if (volunteerId) {
        await UserService.pushHistory(
          volunteerId,
          `Bạn đã được duyệt tham gia sự kiện "${eventTitle}"`,
        );
      }
      // Ghi lịch sử cho manager
      const manager = await UserService.getUserById(managerId);
      if (manager) {
        await UserService.pushHistory(
          managerId,
          `Bạn đã duyệt đăng ký cho TNV "${result?.volunteerId?.name || ''}" trong sự kiện "${eventTitle}"`,
        );
      }
      return result;

    } catch (error) {
      throw error;
    }
  },

  /**
   * MANAGER từ chối đăng ký tình nguyện viên
   * - Chỉ từ chối khi status = PENDING
   * - Đổi status = REJECTED
   * - Lưu approvedBy và rejectionReason
   * - KHÔNG thay đổi currentParticipants
   */
  async rejectRegistration(regId, managerId, reason) {
    try {
      // 1. Tìm registration
      const registration = await Registration.findById(regId);

      if (!registration) {
        const err = new Error('REGISTRATION_NOT_FOUND');
        err.status = 404;
        err.details = 'Không tìm thấy đăng ký';
        throw err;
      }

      // 2. Kiểm tra status = PENDING
      if (registration.status !== 'PENDING') {
        const err = new Error('INVALID_STATUS');
        err.status = 400;
        err.details = `Chỉ có thể từ chối đăng ký đang chờ (PENDING). Hiện tại: ${registration.status}`;
        throw err;
      }

      // 3. Cập nhật registration
      registration.status = 'REJECTED';
      registration.approvedBy = managerId;

      // Lưu rejection reason vào schema nếu có field
      // Note: Cần thêm field rejectionReason vào registration model nếu chưa có
      if (reason) {
        registration.rejectionReason = reason;
      }

      await registration.save();

      // Populate để trả về đầy đủ info
      const result = await Registration.findById(regId)
        .populate('volunteerId', 'name email')
        .populate('approvedBy', 'name email')
        .lean();


      // Ghi lịch sử cho volunteer
      const volunteerId = result?.volunteerId?._id || result?.volunteerId;
      const eventTitle = result?.eventId?.title || '';
      if (volunteerId) {
        await UserService.pushHistory(
          volunteerId,
          `Yêu cầu tham gia sự kiện "${eventTitle}" của bạn đã bị từ chối`,
        );
      }
      // Ghi lịch sử cho manager
      const manager = await UserService.getUserById(managerId);
      if (manager) {
        await UserService.pushHistory(
          managerId,
          `Bạn đã từ chối đăng ký của TNV "${result?.volunteerId?.name || ''}" trong sự kiện "${eventTitle}"`,
        );
      }
      return result;

    } catch (error) {
      throw error;
    }
  }
};

export const getMyRegistrationStatus = async (eventId, volunteerId) => {
  // nếu guest thì caller sẽ không truyền volunteerId
  if (!volunteerId) return { status: "NONE" };

  // validate ObjectId cho chắc (optional)
  if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(volunteerId)) {
    return { status: "NONE" };
  }

  const reg = await Registration.findOne({
    eventId,
    volunteerId,
  })
    .select("status")
    .lean();

  if (!reg) return { status: "NONE" };

  return { status: reg.status }; // 'PENDING' | 'APPROVED' | ...
};