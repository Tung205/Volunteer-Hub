import Joi from 'joi';

// ==================== PARAM SCHEMAS ====================

// Param validation cho post routes
export const postIdParamSchema = Joi.object({
  pid: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).messages({
    'string.empty': 'Post ID không được để trống',
    'any.required': 'Post ID là bắt buộc',
    'string.pattern.base': 'Post ID không hợp lệ'
  })
});

// ==================== BODY SCHEMAS ====================

// Body validation cho POST /posts/:pid/comments
export const createCommentBodySchema = Joi.object({
  content: Joi.string().trim().min(1).max(500).required().messages({
    'string.empty': 'Nội dung bình luận không được để trống',
    'string.min': 'Nội dung bình luận không được để trống',
    'string.max': 'Nội dung bình luận không quá 500 ký tự',
    'any.required': 'Nội dung bình luận là bắt buộc'
  })
});

// ==================== QUERY SCHEMAS ====================

// Query validation cho GET /posts/:pid/comments
export const getCommentsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10)
});
