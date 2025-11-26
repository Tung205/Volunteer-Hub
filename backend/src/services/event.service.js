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
  }
};
