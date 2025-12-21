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
 * GET /channels/event/:eventId
 * Lấy channel info theo eventId
 * Auth: isAuthenticated
 */
router.get(
  '/event/:eventId',
  isAuthenticated,
  ChannelController.getChannelByEvent
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

/**
 * GET /channels/posts/:pid/likes
 * Use ChannelController for convenience or PostController?
 * ChannelController handles channel related. 
 * Let's put it here for now as I added method to ChannelController.
 * Actually route should probably be /api/posts/:pid/likes if in PostController, 
 * but I added method to ChannelController.
 * Let's map: /channels/posts/:pid/likes
 */
router.get(
  '/posts/:pid/likes',
  isAuthenticated,
  ChannelController.getLikers
);

export default router;
