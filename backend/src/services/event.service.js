import mongoose from 'mongoose';
import { Event } from '../models/event.model.js';

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
    if (filters.search) {
      query.$text = { $search: filters.search };
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
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
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
    
    // Execute query and count in parallel for better performance
    const [events, total] = await Promise.all([
      queryBuilder.exec(),
      Event.countDocuments(query)
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
    
    // Find OPEN events that haven't started yet
    const events = await Event.find({
      status: 'OPEN',
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

  async searchEventSuggestions(searchQuery, limit = 10) {
    // Return empty array for empty query
    if (!searchQuery || searchQuery.trim().length === 0) {
      return [];
    }
    
    // Sanitize search query
    const sanitizedQuery = this.sanitizeSearchQuery(searchQuery);
    
    // Full-text search with relevance score
    const events = await Event.find(
      {
        $text: { $search: sanitizedQuery },
        status: 'OPEN'
      },
      {
        score: { $meta: 'textScore' } // Add relevance score
      }
    )
    .sort({ score: { $meta: 'textScore' } }) // Sort by relevance
    .limit(limit)
    .select('_id title coverImageUrl location startTime') // Only return needed fields
    .lean();
    
    return events;
  },

  // CRUD OPERATIONS
  async createEvent(eventData, organizerId, organizerName) {
    try {
      // Set organizer info from authenticated user
      const newEvent = {
        ...eventData,
        organizerId,
        organizerName,
        currentParticipants: 0
      };

      // Create event
      const event = await Event.create(newEvent);

      // Return created event as plain object
      return event.toObject();
    } catch (error) {
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
      
      // Rule 4: Nếu đổi status từ OPEN → CLOSED, check đã có người đăng ký
      if (updateData.status === 'CLOSED' && currentEvent.status === 'OPEN') {
        if (currentEvent.currentParticipants === 0) {
          const err = new Error('CANNOT_CLOSE_EMPTY_EVENT');
          err.status = 400;
          err.details = 'Không thể đóng sự kiện chưa có người đăng ký';
          throw err;
        }
      }
      
      // 3. Update trong database
      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { 
          $set: updateData
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
   * PENDING → APPROVED
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
          status: 'APPROVED',
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
   * MANAGER publish event đã được duyệt
   * APPROVED → OPEN
   */
  async publishEvent(eventId, currentEvent) {
    // Validate: chỉ APPROVED mới được publish
    if (currentEvent.status !== 'APPROVED') {
      const err = new Error('INVALID_STATUS_TRANSITION');
      err.status = 400;
      if (currentEvent.status === 'PENDING') {
        err.details = 'Sự kiện đang chờ duyệt. Vui lòng đợi ADMIN phê duyệt.';
      } else if (currentEvent.status === 'REJECTED') {
        err.details = `Sự kiện đã bị từ chối: ${currentEvent.rejectionReason || 'Không có lý do'}. Vui lòng chỉnh sửa và submit lại.`;
      } else {
        err.details = `Không thể publish sự kiện đang ở trạng thái ${currentEvent.status}`;
      }
      throw err;
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: { status: 'OPEN' } },
      { new: true }
    )
    .populate('organizerId', 'name email')
    .populate('approvedBy', 'name email')
    .lean();
    
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
  }
};
