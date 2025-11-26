import Joi from 'joi';
import { EventService } from '../services/event.service.js';

const getEventsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(6),
  status: Joi.string().valid('DRAFT', 'OPEN', 'CLOSED', 'CANCELLED'),
  location: Joi.string(),
  search: Joi.string().max(100),
  startDate: Joi.date(),
  endDate: Joi.date(),
  sort: Joi.string().valid('upcoming', 'newest').default('upcoming')
});

const suggestionsQuerySchema = Joi.object({
  q: Joi.string().required().max(100)
});

const eventIdParamSchema = Joi.object({
  id: Joi.string().required()
});

const createEventSchema = Joi.object({
  title: Joi.string().required().min(3).max(200).messages({
    'string.empty': 'Tiêu đề không được để trống',
    'string.min': 'Tiêu đề phải có ít nhất 3 ký tự',
    'string.max': 'Tiêu đề không quá 200 ký tự'
  }),
  description: Joi.string().required().max(5000).messages({
    'string.empty': 'Mô tả không được để trống'
  }),
  location: Joi.string().required().messages({
    'string.empty': 'Địa điểm không được để trống'
  }),
  address: Joi.string().allow('').default(''),
  startTime: Joi.date().required().greater('now').messages({
    'date.greater': 'Thời gian bắt đầu phải sau thời điểm hiện tại'
  }),
  endTime: Joi.date().greater(Joi.ref('startTime')).messages({
    'date.greater': 'Thời gian kết thúc phải sau thời gian bắt đầu'
  }),
  maxParticipants: Joi.number().integer().min(0).default(0),
  status: Joi.string().valid('DRAFT', 'OPEN').default('OPEN'),
  coverImageUrl: Joi.string().uri().allow('').default('')
});

export const EventController = {
  
  // GET /api/events - Lấy danh sách events với filter + pagination
  async getEvents(req, res) {
    // Validate query params
    const { error, value } = getEventsQuerySchema.validate(req.query, { 
      abortEarly: false, 
      stripUnknown: true 
    });
    
    if (error) {
      return res.status(400).json({ 
        error: 'VALIDATION', 
        details: error.details.map(d => d.message) 
      });
    }

    try {
      const { page, limit, sort, ...filters } = value;
      
      const result = await EventService.findEventsWithPagination(
        filters,
        { page, limit, sort }
      );
      
      return res.json(result);
    } catch (e) {
      if (e.status) return res.status(e.status).json({ error: e.message });
      console.error(e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  // GET /api/events/suggestions?q= - Autocomplete search
  async getSuggestions(req, res) {
    // Validate query
    const { error, value } = suggestionsQuerySchema.validate(req.query, { 
      abortEarly: false, 
      stripUnknown: true 
    });
    
    if (error) {
      return res.status(400).json({ 
        error: 'VALIDATION', 
        details: error.details.map(d => d.message) 
      });
    }

    try {
      const events = await EventService.searchEventSuggestions(value.q, 10);
      return res.json({ suggestions: events });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  // GET /api/events/highlighted - Lấy events nổi bật
  async getHighlightedEvents(req, res) {
    try {
      const events = await EventService.findHighlightedEvents(6);
      return res.json({ events });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  // GET /api/events/:id - Lấy chi tiết 1 event
  async getEventById(req, res) {
    // Validate param
    const { error, value } = eventIdParamSchema.validate(req.params, { 
      abortEarly: false, 
      stripUnknown: true 
    });
    
    if (error) {
      return res.status(400).json({ 
        error: 'VALIDATION', 
        details: error.details.map(d => d.message) 
      });
    }

    try {
      const event = await EventService.findEventById(value.id);
      return res.json({ event });
    } catch (e) {
      if (e.status) return res.status(e.status).json({ error: e.message });
      console.error(e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  // POST /api/events - Tạo sự kiện mới (MANAGER only)
  async createEvent(req, res) {
    // Validate request body
    const { error, value } = createEventSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION',
        details: error.details.map(d => d.message)
      });
    }

    try {
      // Get user info from authenticated user
      const userId = req.user.id;
      const userName = req.user.name || req.user.email;
      
      // Create event
      const event = await EventService.createEvent(value, userId, userName);
      
      return res.status(201).json({
        message: 'Tạo sự kiện thành công',
        event
      });
    } catch (e) {
      if (e.status) return res.status(e.status).json({ error: e.message, details: e.details });
      console.error(e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  }
};
