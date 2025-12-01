import express from 'express';
import { RegistrationController } from '../controllers/registration.controller.js';
import { isAuthenticated, hasRole, canManageRegistrations } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { 
  eventIdParamSchema, 
  regIdParamSchema, 
  rejectRegistrationSchema 
} from '../validations/registration.validation.js';

const router = express.Router();

// ==================== REGISTRATION API (VOLUNTEER) ====================

// POST /api/registrations/:eventId/register - TNV đăng ký tham gia sự kiện
router.post('/:eventId/register',
  isAuthenticated,
  hasRole('VOLUNTEER'),
  validate(eventIdParamSchema, 'params'),
  RegistrationController.register
);

// GET /api/registrations/my-registrations - TNV xem danh sách sự kiện đã đăng ký
router.get('/my-registrations',
  isAuthenticated,
  hasRole('VOLUNTEER'),
  RegistrationController.getMyRegistrations
);

// DELETE /api/registrations/:eventId/register - TNV hủy đăng ký sự kiện
router.delete('/:eventId/register',
  isAuthenticated,
  hasRole('VOLUNTEER'),
  validate(eventIdParamSchema, 'params'),
  RegistrationController.cancelRegistration
);

// ==================== MANAGER APIS ====================

// GET /api/registrations/event/:eventId - MANAGER xem danh sách TNV đã đăng ký
router.get('/event/:eventId',
  isAuthenticated,
  hasRole('MANAGER', 'ADMIN'),
  canManageRegistrations,
  RegistrationController.getEventRegistrations
);

// PATCH /api/registrations/:regId/approve - MANAGER duyệt đăng ký TNV
router.patch('/:regId/approve',
  isAuthenticated,
  hasRole('MANAGER', 'ADMIN'),
  validate(regIdParamSchema, 'params'),
  canManageRegistrations,
  RegistrationController.approveRegistration
);

// PATCH /api/registrations/:regId/reject - MANAGER từ chối đăng ký TNV
router.patch('/:regId/reject',
  isAuthenticated,
  hasRole('MANAGER', 'ADMIN'),
  validate(regIdParamSchema, 'params'),
  validate(rejectRegistrationSchema),
  canManageRegistrations,
  RegistrationController.rejectRegistration
);

export default router;
