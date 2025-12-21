import express from 'express';
import { ManagerRequestController } from '../controllers/manager-request.controller.js';
import { createManagerRequestSchema, updateManagerRequestSchema, rejectManagerRequestSchema } from '../validations/manager-request.validation.js';
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

// PATCH /api/manager-requests/:id/reject - Admin từ chối yêu cầu trở thành Manager
router.patch(
  '/:id/reject',
  isAuthenticated,
  hasRole('ADMIN'),
  validate(rejectManagerRequestSchema),
  ManagerRequestController.rejectManagerRequest
);

// GET /api/manager-requests/pending - Admin lấy danh sách chờ duyệt
router.get(
  '/pending',
  isAuthenticated,
  hasRole('ADMIN'),
  ManagerRequestController.getPendingRequests
);

// GET /api/manager-requests/my-requests - Volunteer xem lịch sử yêu cầu
router.get(
  '/my-requests',
  isAuthenticated,
  ManagerRequestController.getMyRequests
);

export default router;