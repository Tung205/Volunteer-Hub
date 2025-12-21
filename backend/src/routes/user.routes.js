import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { isAuthenticated, hasRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { updateProfileSchema, userIdParamSchema } from '../validations/user.validation.js';

const router = Router();

/**
 * GET /users/me
 * Lấy profile của user đang đăng nhập
 * Auth: isAuthenticated
 */
router.get('/me', isAuthenticated, UserController.getProfile);

/**
 * PATCH /users/me
 * Cập nhật profile của user đang đăng nhập
 * Auth: isAuthenticated
 */
router.patch(
  '/me',
  isAuthenticated,
  validate(updateProfileSchema),
  UserController.updateProfile
);

/**
 * GET /users/:id
 * Lấy profile rút gọn của user khác
 * Auth: isAuthenticated + MANAGER|ADMIN
 */
router.get(
  '/:id',
  isAuthenticated,
  hasRole('MANAGER', 'ADMIN'),
  validate(userIdParamSchema, 'params'),
  UserController.getPublicProfile
);

export default router;
