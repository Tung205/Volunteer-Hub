import { EventService } from '../services/event.service.js';

export const EventController = {
  
  // GET /api/events - Lấy danh sách events với filter + pagination
  async getEvents(req, res) {
    try {
      const { page, limit, sort, ...filters } = req.query;
      
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
    try {
      const events = await EventService.searchEventSuggestions(req.query.q, 10);
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
    try {
      const event = await EventService.findEventById(req.params.id);
      return res.json({ event });
    } catch (e) {
      if (e.status) return res.status(e.status).json({ error: e.message });
      console.error(e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  // POST /api/events - Tạo sự kiện mới (MANAGER only)
  async createEvent(req, res) {
    try {
      // Get user info from authenticated user
      const userId = req.user.id;
      const userName = req.user.name || req.user.email;
      
      // Create event
      const event = await EventService.createEvent(req.body, userId, userName);
      
      return res.status(201).json({
        message: 'Tạo sự kiện thành công',
        event
      });
    } catch (e) {
      if (e.status) return res.status(e.status).json({ error: e.message, details: e.details });
      console.error(e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  // PUT /api/events/:id - Cập nhật sự kiện (MANAGER/ADMIN only, must be owner or admin)
  async updateEvent(req, res) {
    try {
      const eventId = req.params.id;
      const updateData = req.body; // Đã validated bởi middleware
      const currentEvent = req.event; // Từ canModifyEvent middleware
      
      const updatedEvent = await EventService.updateEvent(
        eventId, 
        updateData, 
        currentEvent
      );
      
      return res.status(200).json({
        message: 'Cập nhật sự kiện thành công',
        event: updatedEvent
      });
      
    } catch (e) {
      if (e.status) {
        return res.status(e.status).json({ 
          error: e.message,
          details: e.details 
        });
      }
      console.error('updateEvent error:', e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  }
};
