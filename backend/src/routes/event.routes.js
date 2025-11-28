import express from 'express';
import { EventController } from '../controllers/event.controller.js';
import { isAuthenticated, hasRole, canModifyEvent } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { 
  getEventsQuerySchema,
  suggestionsQuerySchema,
  eventIdParamSchema,
  createEventSchema,
  updateEventSchema
} from '../validations/event.validation.js';

const router = express.Router();

// API CRUD sự kiện (MANAGER)
router.post('/', 
  isAuthenticated, 
  hasRole('MANAGER', 'ADMIN'), 
  validate(createEventSchema),
  EventController.createEvent
);

router.put('/:id',
  isAuthenticated,
  hasRole('MANAGER', 'ADMIN'),
  canModifyEvent,
  validate(eventIdParamSchema, 'params'),
  validate(updateEventSchema),
  EventController.updateEvent
);

// API tìm kiếm/ hiển thị sự kiện (PUBLIC)
router.get('/suggestions', 
  validate(suggestionsQuerySchema, 'query'), 
  EventController.getSuggestions
);
router.get('/highlighted', EventController.getHighlightedEvents);
router.get('/:id', 
  validate(eventIdParamSchema, 'params'), 
  EventController.getEventById
);
router.get('/', 
  validate(getEventsQuerySchema, 'query'), 
  EventController.getEvents
);

export default router;
