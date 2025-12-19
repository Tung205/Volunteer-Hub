import { Router } from 'express';
import { PostController } from '../controllers/post.controller.js';
import { isAuthenticated, isPostMember } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  postIdParamSchema,
  createCommentBodySchema,
  getCommentsQuerySchema
} from '../validations/post.validation.js';

const router = Router();

/**
 * GET /posts/:pid/comments
 * Lấy danh sách comments của post với phân trang
 * Auth: isAuthenticated + isPostMember
 */
router.get(
  '/:pid/comments',
  isAuthenticated,
  validate(postIdParamSchema, 'params'),
  validate(getCommentsQuerySchema, 'query'),
  isPostMember,
  PostController.getComments
);

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

/**
 * POST /posts/:pid/like
 * Like một bài viết
 * Auth: isAuthenticated + isPostMember
 */
router.post(
  '/:pid/like',
  isAuthenticated,
  validate(postIdParamSchema, 'params'),
  isPostMember,
  PostController.likePost
);

export default router;
