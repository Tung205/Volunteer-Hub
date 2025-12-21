import mongoose from 'mongoose';
import { Event } from '../models/event.model.js';
import { Registration } from '../models/registration.model.js';
export const EventService = {

  // QUERY BUILDERS  
  buildFilterQuery(filters = {}) {
    const query = {};

    // Filter by status
    if (filters.status) {
      query.status = filters.status;
    }

    // Filter by location
    if (filters.location) {
      query.location = new RegExp(filters.location, 'i'); // Case-insensitive search
    }

    // Text search
    // if (filters.search) {
    //   query.$text = { $search: filters.search };
    // }
    if (filters.search) {
      const sanitized = this.sanitizeSearchQuery(filters.search);
      const q = this.escapeRegex(sanitized);

      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }


    // Date range filter
    if (filters.startDate || filters.endDate) {
      query.startTime = {};
      if (filters.startDate) {
        query.startTime.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.startTime.$lte = new Date(filters.endDate);
      }
    }

    // Filter by organizerId (exact match)
    if (filters.organizerId) {
      query.organizerId = filters.organizerId;
    }

    return query;
  },

  buildSortOptions(sortType = 'upcoming') {
    switch (sortType) {
      case 'newest':
        return { createdAt: -1 };
      case 'upcoming':
      default:
        return { startTime: 1 };
    }
  },

  // VALIDATION & HELPERS  
  validatePaginationParams({ page, limit }) {
    const validPage = Math.max(1, parseInt(page) || 1);
    const validLimit = Math.min(50, Math.max(1, parseInt(limit) || 6));
    return { page: validPage, limit: validLimit };
  },

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  },

  sanitizeSearchQuery(query) {
    if (!query) return '';
    // Remove special MongoDB operators to prevent injection
    return query.replace(/[${}]/g, '').trim().substring(0, 100);
  },

  // MAIN BUSINESS LOGIC METHODS
  async findEventsWithPagination(filters = {}, options = {}) {
    const { page = 1, limit = 6, sort = 'upcoming', populate = true } = options;

    // Build query and sort
    const query = this.buildFilterQuery(filters);
    const sortOptions = this.buildSortOptions(sort);

    // Count total first to validate page
    const total = await Event.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Auto-redirect: If page exceeds totalPages, redirect to last valid page
    const requestedPage = page;
    const actualPage = totalPages > 0 ? Math.min(page, totalPages) : 1;
    const wasRedirected = requestedPage !== actualPage;

    // Calculate pagination with actual page
    const skip = (actualPage - 1) * limit;

    // Build query
    let queryBuilder = Event.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(); // Faster performance, returns plain JS objects

    // Populate manager info if needed
    if (populate) {
      queryBuilder = queryBuilder.populate('organizerId', 'name email');
    }

    // Execute query
    const events = await queryBuilder.exec();

    return {
      events,
      pagination: {
        page: actualPage,
        limit,
        total,
        totalPages,
        hasNext: actualPage < totalPages,
        hasPrev: actualPage > 1,
        // Thông tin redirect để frontend biết
        ...(wasRedirected && {
          requestedPage,
          redirected: true
        })
      }
    };
  },

  async findEventById(id, options = {}) {
    const { populate = true } = options;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('INVALID_EVENT_ID');
      err.status = 400;
      throw err;
    }

    // Build query
    let query = Event.findById(id);

    if (populate) {
      query = query.populate('organizerId', 'name email');
    }

    const event = await query.lean();

    // Check if event exists
    if (!event) {
      const err = new Error('EVENT_NOT_FOUND');
      err.status = 404;
      throw err;
    }

    return event;
  },

  async findHighlightedEvents(limit = 6) {
    const now = new Date();

    // Find OPENED events that haven't started yet
    const events = await Event.find({
      status: 'OPENED',
      startTime: { $gte: now }
    })
      .sort({
        currentParticipants: -1,   // Most participants first
        startTime: 1                // Soonest first
      })
      .limit(limit)
      .populate('organizerId', 'name email')
      .lean();

    return events;
  },

  // async searchEventSuggestions(searchQuery, limit = 10) {
  //   // Return empty array for empty query
  //   if (!searchQuery || searchQuery.trim().length === 0) {
  //     return [];
  //   }

  //   // Sanitize search query
  //   const sanitizedQuery = this.sanitizeSearchQuery(searchQuery);

  //   // Full-text search with relevance score
  //   const events = await Event.find(
  //     {
  //       $text: { $search: sanitizedQuery },
  //       status: 'OPENED'
  //     },
  //     {
  //       score: { $meta: 'textScore' } // Add relevance score
  //     }
  //   )
  //   .sort({ score: { $meta: 'textScore' } }) // Sort by relevance
  //   .limit(limit)
  //   .select('_id title coverImageUrl location startTime') // Only return needed fields
  //   .lean();

  //   return events;
  // },

  // Sanitize search query
  async searchEventSuggestions(searchQuery, limit = 10) {
    if (!searchQuery || searchQuery.trim().length === 0) return [];

    const sanitized = this.sanitizeSearchQuery(searchQuery);
    const q = this.escapeRegex(sanitized);

    const events = await Event.find({
      status: "OPENED",
      $or: [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    })
      .sort({ startTime: 1 })              // event gần nhất lên trước
      .limit(limit)
      .select("_id title coverImageUrl location startTime")
      .lean();

    return events;
  },

  // CRUD OPERATIONS
  async createEvent(eventData, organizerId, organizerName, organizerEmail) {
    let session;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      // Set organizer info from authenticated user
      const newEvent = {
        ...eventData,
        organizerId,
        organizerName,
        currentParticipants: 1 // Start with 1 (the organizer)
      };

      // Create event
      const event = await Event.create([newEvent], { session });
      const createdEvent = event[0];

      // Auto-register organizer as APPROVED
      // Need to import Registration model. Since we are in EventService, we can use mongoose.model to avoid circular dependency if needed, 
      // but importing at top is better if possible. 
      // Assuming Registration model is available.
      const Registration = mongoose.model('Registration');

      await Registration.create([{
        eventId: createdEvent._id,
        volunteerId: organizerId,
        volunteerName: organizerName || 'Organizer',
        volunteerEmail: organizerEmail || 'organizer@volunteerhub.com', // Use passed email
        status: 'APPROVED',
        approvedBy: organizerId, // Self-approved
        registeredAt: new Date()
      }], { session });

      await session.commitTransaction();
      session.endSession();

      // Return created event as plain object
      return createdEvent.toObject();
    } catch (error) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }

      if (error.name === 'ValidationError') {
        const err = new Error('VALIDATION_ERROR');
        err.status = 400;
        err.details = Object.values(error.errors).map(e => e.message);
        throw err;
      }
      throw error;
    }
  },

  // UPDATE EVENT
  async updateEvent(eventId, updateData, currentEvent) {
    try {
      // 1. Lọc bỏ các fields không được phép update
      const protectedFields = [
        'organizerId',
        'organizerName',
        'currentParticipants',
        'createdAt',
        'updatedAt',
        '_id'
      ];

      protectedFields.forEach(field => {
        delete updateData[field];
      });

      // 2. Validate business rules

      // Rule 1: Nếu update maxParticipants, phải >= currentParticipants
      if (updateData.maxParticipants !== undefined) {
        if (updateData.maxParticipants < currentEvent.currentParticipants) {
          const err = new Error('INVALID_CAPACITY');
          err.status = 400;
          err.details = `Số lượng tối đa (${updateData.maxParticipants}) không thể nhỏ hơn số người đã đăng ký (${currentEvent.currentParticipants})`;
          throw err;
        }
      }

      // Rule 2: Nếu update startTime, phải check với endTime
      if (updateData.startTime && currentEvent.endTime) {
        if (new Date(updateData.startTime) >= new Date(currentEvent.endTime)) {
          const err = new Error('INVALID_TIME');
          err.status = 400;
          err.details = 'Thời gian bắt đầu phải trước thời gian kết thúc';
          throw err;
        }
      }

      // Rule 3: Nếu update endTime, phải check với startTime
      if (updateData.endTime) {
        const startTime = updateData.startTime || currentEvent.startTime;
        if (new Date(updateData.endTime) <= new Date(startTime)) {
          const err = new Error('INVALID_TIME');
          err.status = 400;
          err.details = 'Thời gian kết thúc phải sau thời gian bắt đầu';
          throw err;
        }
      }

      // Rule 4: Nếu đổi status từ OPENED → CLOSED, check đã có người đăng ký
      if (updateData.status === 'CLOSED' && currentEvent.status === 'OPENED') {
        if (currentEvent.currentParticipants === 0) {
          const err = new Error('CANNOT_CLOSE_EMPTY_EVENT');
          err.status = 400;
          err.details = 'Không thể đóng sự kiện chưa có người đăng ký';
          throw err;
        }
      }

      // Rule 5: MANAGER chỉ được sửa 1 lần sau khi event được duyệt
      if (currentEvent.status === 'OPENED' && currentEvent.editCount >= 1) {
        const err = new Error('EDIT_LIMIT_EXCEEDED');
        err.status = 400;
        err.details = 'Sự kiện đã được sửa 1 lần. Không thể sửa thêm.';
        throw err;
      }

      // Rule 6: Nếu MANAGER sửa event đã OPENED → chuyển về PENDING để admin duyệt lại
      if (currentEvent.status === 'OPENED' && !updateData.status) {
        updateData.status = 'PENDING';
        // Clear approval info khi cần duyệt lại
        updateData.approvedBy = null;
        updateData.approvedAt = null;
      }

      // 3. Update trong database
      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        {
          $set: updateData,
          $inc: { editCount: 1 }  // Tăng số lần sửa
        },
        {
          new: true,  // Return document sau khi update
          runValidators: true  // Chạy mongoose validators
        }
      )
        .populate('organizerId', 'name email')
        .lean();

      if (!updatedEvent) {
        const err = new Error('EVENT_NOT_FOUND');
        err.status = 404;
        throw err;
      }

      return updatedEvent;

    } catch (error) {
      // Re-throw custom errors
      if (error.status) {
        throw error;
      }

      // Handle mongoose validation errors
      if (error.name === 'ValidationError') {
        const err = new Error('VALIDATION_ERROR');
        err.status = 400;
        err.details = Object.values(error.errors).map(e => e.message);
        throw err;
      }

      throw error;
    }
  },

  // ==================== APPROVAL WORKFLOW ====================

  /**
   * MANAGER submit lại event sau khi bị từ chối
   * REJECTED → PENDING
   */
  async submitForReview(eventId, currentEvent) {
    // Validate: chỉ REJECTED mới được resubmit (vì tạo mới đã tự động PENDING)
    if (currentEvent.status !== 'REJECTED') {
      const err = new Error('INVALID_STATUS_TRANSITION');
      err.status = 400;
      err.details = `Chỉ có thể submit lại sự kiện đã bị từ chối (REJECTED). Hiện tại: ${currentEvent.status}`;
      throw err;
    }

    // Validate: event phải có đủ thông tin
    const requiredFields = ['title', 'description', 'location', 'startTime'];
    const missingFields = requiredFields.filter(f => !currentEvent[f]);
    if (missingFields.length > 0) {
      const err = new Error('INCOMPLETE_EVENT');
      err.status = 400;
      err.details = `Thiếu thông tin bắt buộc: ${missingFields.join(', ')}`;
      throw err;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        $set: { status: 'PENDING' },
        $unset: { rejectionReason: 1 } // Clear rejection reason if resubmitting
      },
      { new: true }
    ).populate('organizerId', 'name email').lean();

    return updatedEvent;
  },

  /**
   * ADMIN duyệt event
   * PENDING → OPENED
   */
  async approveEvent(eventId, adminId) {
    const event = await Event.findById(eventId).lean();

    if (!event) {
      const err = new Error('EVENT_NOT_FOUND');
      err.status = 404;
      throw err;
    }

    // Validate: chỉ PENDING mới được approve
    if (event.status !== 'PENDING') {
      const err = new Error('INVALID_STATUS_TRANSITION');
      err.status = 400;
      err.details = `Chỉ có thể duyệt sự kiện đang chờ duyệt (PENDING). Hiện tại: ${event.status}`;
      throw err;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        $set: {
          status: 'OPENED',
          approvedBy: adminId,
          approvedAt: new Date()
        }
      },
      { new: true }
    )
      .populate('organizerId', 'name email')
      .populate('approvedBy', 'name email')
      .lean();

    // TODO: Gửi notification cho MANAGER

    return updatedEvent;
  },

  /**
   * ADMIN từ chối event
   * PENDING → REJECTED
   */
  async rejectEvent(eventId, adminId, reason = '') {
    const event = await Event.findById(eventId).lean();

    if (!event) {
      const err = new Error('EVENT_NOT_FOUND');
      err.status = 404;
      throw err;
    }

    // Validate: chỉ PENDING mới được reject
    if (event.status !== 'PENDING') {
      const err = new Error('INVALID_STATUS_TRANSITION');
      err.status = 400;
      err.details = `Chỉ có thể từ chối sự kiện đang chờ duyệt (PENDING). Hiện tại: ${event.status}`;
      throw err;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        $set: {
          status: 'REJECTED',
          approvedBy: adminId,
          approvedAt: new Date(),
          rejectionReason: reason || 'Không có lý do cụ thể'
        }
      },
      { new: true }
    )
      .populate('organizerId', 'name email')
      .populate('approvedBy', 'name email')
      .lean();

    // TODO: Gửi notification cho MANAGER với lý do từ chối

    return updatedEvent;
  },



  /**
   * Lấy danh sách events chờ duyệt (ADMIN)
   */
  async findPendingEvents(options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find({ status: 'PENDING' })
        .sort({ createdAt: 1 }) // Oldest first (FIFO)
        .skip(skip)
        .limit(limit)
        .populate('organizerId', 'name email')
        .lean(),
      Event.countDocuments({ status: 'PENDING' })
    ]);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  },

  /**
   * Lấy danh sách events có nhiều bài đăng nhất (Most Discussed)
   * Logic: Post -> Group by Channel -> Lookup Channel -> Lookup Event -> Filter OPENED
   */
  async findEventsByMostPosts(limit = 6) {
    // Import Post model dynamically or make sure it's available. 
    // Since we are in EventService, we might need to import Post at the top or use mongoose.model('Post') to avoid circular deps if any.
    // Assuming 'Post' model is registered.
    const Post = mongoose.model('Post');

    const pipeline = [
      // 1. Group posts by channel and count
      {
        $group: {
          _id: "$channelId",
          postCount: { $sum: 1 }
        }
      },
      // 2. Sort decending
      { $sort: { postCount: -1 } },
      // 3. Take a buffer (e.g. top 50) to allow for filtering non-opened events
      { $limit: 50 },
      // 4. Join with Channel to get eventId
      {
        $lookup: {
          from: "channels",
          localField: "_id",
          foreignField: "_id",
          as: "channel"
        }
      },
      { $unwind: "$channel" },
      // 5. Join with Event to get details
      {
        $lookup: {
          from: "events",
          localField: "channel.eventId",
          foreignField: "_id",
          as: "event"
        }
      },
      { $unwind: "$event" },
      // 6. Filter only OPENED events and future events (optional)
      {
        $match: {
          "event.status": "OPENED"
        }
      },
      // 7. Limit to requested number
      { $limit: limit },
      // 8. Replace root to return event structure
      {
        $replaceRoot: { newRoot: "$event" }
      },
      // 9. Lookup organizer (populate simulation)
      {
        $lookup: {
          from: "users",
          localField: "organizerId",
          foreignField: "_id",
          as: "organizer"
        }
      },
      {
        $addFields: {
          organizerId: { $arrayElemAt: ["$organizer", 0] } // Transform array to object
        }
      },
      { $project: { organizer: 0 } } // Cleanup
    ];

    const events = await Post.aggregate(pipeline);
    return events;
  }
};
