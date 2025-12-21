import express from 'express';
import { ManagerRequestController } from '../controllers/manager-request.controller.js';
import { createManagerRequestSchema } from '../validations/manager-request.validation.js';
import { validate } from '../middlewares/validate.middleware.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { hasRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// POST /api/manager-requests - Volunteer gửi yêu cầu trở thành Manager
router.post(
  '/',
  isAuthenticated,
  hasRole('VOLUNTEER'),
  validate(createManagerRequestSchema),
  ManagerRequestController.submitManagerRequest
);

export default router;