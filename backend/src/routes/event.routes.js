import express from 'express';
import { EventController } from '../controllers/event.controller.js';

const router = express.Router();

router.get('/suggestions', EventController.getSuggestions);
router.get('/highlighted', EventController.getHighlightedEvents);
router.get('/:id', EventController.getEventById);
router.get('/', EventController.getEvents);

export default router;
