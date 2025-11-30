import express from 'express';
import { RegistrationController } from '../controllers/registration.controller.js';
import { isAuthenticated, hasRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { eventIdParamSchema } from '../validations/registration.validation.js';

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

export default router;
