import { Router } from 'express';
import { PostController } from '../controllers/post.controller.js';
import { isAuthenticated, isPostMember } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  postIdParamSchema,
  createCommentBodySchema
} from '../validations/post.validation.js';

const router = Router();

/**
 * POST /posts/:pid/comments
 * Tạo bình luận cho bài viết
 * Auth: isAuthenticated + isPostMember
 */
router.post(
  '/:pid/comments',
  isAuthenticated,
  validate(postIdParamSchema, 'params'),
  validate(createCommentBodySchema, 'body'),
  isPostMember,
  PostController.createComment
);

export default router;
