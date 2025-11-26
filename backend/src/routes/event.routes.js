import express from 'express';
import { EventController } from '../controllers/event.controller.js';
import { isAuthenticated, hasRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// API CRUD sự kiện (MANAGER)
router.post('/', isAuthenticated, hasRole('MANAGER', 'ADMIN'), EventController.createEvent);

// API tìm kiếm/ hiển thị sự kiện (PUBLIC)
router.get('/suggestions', EventController.getSuggestions);
router.get('/highlighted', EventController.getHighlightedEvents);
router.get('/:id', EventController.getEventById);
router.get('/', EventController.getEvents);

export default router;
