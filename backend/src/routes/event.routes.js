import express from 'express';
import { EventController } from '../controllers/event.controller.js';
import { isAuthenticated, hasRole, canModifyEvent } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { 
  getEventsQuerySchema,
  suggestionsQuerySchema,
  eventIdParamSchema,
  createEventSchema,
  updateEventSchema,
  rejectEventSchema
} from '../validations/event.validation.js';

const router = express.Router();

// ==================== CRUD SỰ KIỆN (MANAGER) ====================

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

// ==================== APPROVAL WORKFLOW ====================

// MANAGER: Resubmit event bị từ chối (REJECTED → PENDING)
router.patch('/:id/submit',
  isAuthenticated,
  hasRole('MANAGER', 'ADMIN'),
  canModifyEvent,
  validate(eventIdParamSchema, 'params'),
  EventController.submitForReview
);

// MANAGER: Publish event đã được duyệt (APPROVED → OPEN)
router.patch('/:id/publish',
  isAuthenticated,
  hasRole('MANAGER', 'ADMIN'),
  canModifyEvent,
  validate(eventIdParamSchema, 'params'),
  EventController.publishEvent
);

// ADMIN: Lấy danh sách events chờ duyệt (phải đặt trước /:id)
router.get('/pending',
  isAuthenticated,
  hasRole('ADMIN'),
  EventController.getPendingEvents
);

// ADMIN: Duyệt event (PENDING → APPROVED)
router.patch('/:id/approve',
  isAuthenticated,
  hasRole('ADMIN'),
  validate(eventIdParamSchema, 'params'),
  EventController.approveEvent
);

// ADMIN: Từ chối event (PENDING → REJECTED)
router.patch('/:id/reject',
  isAuthenticated,
  hasRole('ADMIN'),
  validate(eventIdParamSchema, 'params'),
  validate(rejectEventSchema),
  EventController.rejectEvent
);

// ==================== PUBLIC ROUTES ====================
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
