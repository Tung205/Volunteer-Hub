import express from 'express';
import { ManagerRequestController } from '../controllers/manager-request.controller.js';
import { createManagerRequestSchema, updateManagerRequestSchema } from '../validations/manager-request.validation.js';
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

// PATCH /api/manager-requests/:id/approve - Admin duyệt hoặc từ chối yêu cầu
router.patch(
  '/:id/approve',
  isAuthenticated,
  hasRole('ADMIN'),
  validate(updateManagerRequestSchema),
  ManagerRequestController.approveManagerRequest
);

export default router;