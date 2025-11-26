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
    
    // Filter by category
    if (filters.category) {
      query.category = filters.category;
    }
    
    // Filter by city
    if (filters.city) {
      query['location.city'] = filters.city;
    }
    
    // Text search
    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    
    // Date range filter
    if (filters.startDate || filters.endDate) {
      query['time.start'] = {};
      if (filters.startDate) {
        query['time.start'].$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query['time.start'].$lte = new Date(filters.endDate);
      }
    }
    
    return query;
  },

  buildSortOptions(sortType = 'upcoming') {
    switch (sortType) {
      case 'popular':
        return { 'stats.likes': -1, 'stats.registrations': -1 };
      case 'newest':
        return { createdAt: -1 };
      case 'upcoming':
      default:
        return { 'time.start': 1 };
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
      queryBuilder = queryBuilder.populate('managerId', 'name email');
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
      query = query.populate('managerId', 'name email');
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
    
    // Find published events that haven't started yet
    // Sort by popularity (likes, registrations) and upcoming date
    const events = await Event.find({
      status: 'PUBLISHED',
      'time.start': { $gte: now }
    })
    .sort({
      'stats.likes': -1,           // Most liked first
      'stats.registrations': -1,   // Most registered first
      'time.start': 1               // Soonest first
    })
    .limit(limit)
    .populate('managerId', 'name email')
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
        status: 'PUBLISHED'
      },
      {
        score: { $meta: 'textScore' } // Add relevance score
      }
    )
    .sort({ score: { $meta: 'textScore' } }) // Sort by relevance
    .limit(limit)
    .select('_id title coverUrl location.city time.start') // Only return needed fields
    .lean();
    
    return events;
  },

  // CRUD OPERATIONS
  async createEvent(eventData, managerId) {
    try {
      // Set managerId from authenticated user
      const newEvent = {
        ...eventData,
        managerId,
        status: eventData.status || 'DRAFT',
        stats: {
          registrations: 0,
          approved: 0,
          posts: 0,
          likes: 0
        }
      };

      // Create event
      const event = await Event.create(newEvent);

      // Return created event
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
