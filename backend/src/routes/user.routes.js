import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * GET /users/me
 * Lấy profile của user đang đăng nhập
 * Auth: isAuthenticated
 */
router.get('/me', isAuthenticated, UserController.getProfile);

export default router;
