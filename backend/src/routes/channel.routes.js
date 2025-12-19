import { Router } from 'express';
import { ChannelController } from '../controllers/channel.controller.js';
import { isAuthenticated, isEventMember } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  channelIdParamSchema,
  getPostsQuerySchema,
  createPostBodySchema
} from '../validations/channel.validation.js';

const router = Router();

/**
 * GET /channels/:cid/posts
 * Lấy danh sách posts của channel (có phân trang)
 * Auth: isAuthenticated + isEventMember
 */
router.get(
  '/:cid/posts',
  isAuthenticated,
  validate(channelIdParamSchema, 'params'),
  validate(getPostsQuerySchema, 'query'),
  isEventMember,
  ChannelController.getPosts
);

/**
 * POST /channels/:cid/posts
 * Tạo bài viết mới trong channel
 * Auth: isAuthenticated + isEventMember
 */
router.post(
  '/:cid/posts',
  isAuthenticated,
  validate(channelIdParamSchema, 'params'),
  validate(createPostBodySchema, 'body'),
  isEventMember,
  ChannelController.createPost
);

export default router;
