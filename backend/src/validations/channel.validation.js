import Joi from 'joi';

// ==================== PARAM SCHEMAS ====================

// Param validation cho channel routes
export const channelIdParamSchema = Joi.object({
  cid: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).messages({
    'string.empty': 'Channel ID không được để trống',
    'any.required': 'Channel ID là bắt buộc',
    'string.pattern.base': 'Channel ID không hợp lệ'
  })
});

// Param validation cho post ID trong comments route
export const postIdParamSchema = Joi.object({
  cid: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).messages({
    'string.empty': 'Channel ID không được để trống',
    'any.required': 'Channel ID là bắt buộc',
    'string.pattern.base': 'Channel ID không hợp lệ'
  }),
  pid: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).messages({
    'string.empty': 'Post ID không được để trống',
    'any.required': 'Post ID là bắt buộc',
    'string.pattern.base': 'Post ID không hợp lệ'
  })
});

// ==================== QUERY SCHEMAS ====================

// Query validation cho GET /channels/:cid/posts
export const getPostsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10)
});

// ==================== BODY SCHEMAS ====================

// Attachment schema
const attachmentSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    'string.uri': 'URL attachment không hợp lệ',
    'any.required': 'URL attachment là bắt buộc'
  }),
  type: Joi.string().valid('image', 'file', 'video').required().messages({
    'any.only': 'Type phải là image, file hoặc video',
    'any.required': 'Type attachment là bắt buộc'
  })
});

// Body validation cho POST /channels/:cid/posts
export const createPostBodySchema = Joi.object({
  content: Joi.string().trim().min(1).max(5000).required().messages({
    'string.empty': 'Nội dung bài viết không được để trống',
    'string.min': 'Nội dung bài viết không được để trống',
    'string.max': 'Nội dung bài viết không quá 5000 ký tự',
    'any.required': 'Nội dung bài viết là bắt buộc'
  }),
  attachments: Joi.array().items(attachmentSchema).max(10).default([]).messages({
    'array.max': 'Tối đa 10 attachments'
  })
});

// Body validation cho POST /channels/:cid/posts/:pid/comments
export const createCommentBodySchema = Joi.object({
  content: Joi.string().trim().min(1).max(500).required().messages({
    'string.empty': 'Nội dung bình luận không được để trống',
    'string.min': 'Nội dung bình luận không được để trống',
    'string.max': 'Nội dung bình luận không quá 500 ký tự',
    'any.required': 'Nội dung bình luận là bắt buộc'
  })
});
