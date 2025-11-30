import Joi from 'joi';

// Query validation cho GET /api/events
export const getEventsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(6),
  status: Joi.string().valid('PENDING', 'OPENED', 'REJECTED', 'CLOSED', 'CANCELLED'),
  location: Joi.string(),
  search: Joi.string().max(100),
  startDate: Joi.date(),
  endDate: Joi.date(),
  sort: Joi.string().valid('upcoming', 'newest').default('upcoming')
});

// Query validation cho GET /api/events/suggestions
export const suggestionsQuerySchema = Joi.object({
  q: Joi.string().required().max(100).messages({
    'string.empty': 'Từ khóa tìm kiếm không được để trống',
    'any.required': 'Từ khóa tìm kiếm là bắt buộc'
  })
});

// Param validation cho GET /api/events/:id
export const eventIdParamSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'Event ID không được để trống',
    'any.required': 'Event ID là bắt buộc'
  })
});

// Body validation cho POST /api/events
export const createEventSchema = Joi.object({
  title: Joi.string().required().min(3).max(200).messages({
    'string.empty': 'Tiêu đề không được để trống',
    'string.min': 'Tiêu đề phải có ít nhất 3 ký tự',
    'string.max': 'Tiêu đề không quá 200 ký tự',
    'any.required': 'Tiêu đề là bắt buộc'
  }),
  description: Joi.string().required().max(5000).messages({
    'string.empty': 'Mô tả không được để trống',
    'any.required': 'Mô tả là bắt buộc'
  }),
  location: Joi.string().required().messages({
    'string.empty': 'Địa điểm không được để trống',
    'any.required': 'Địa điểm là bắt buộc'
  }),
  address: Joi.string().allow('').default(''),
  startTime: Joi.date().required().greater('now').messages({
    'date.greater': 'Thời gian bắt đầu phải sau thời điểm hiện tại',
    'any.required': 'Thời gian bắt đầu là bắt buộc'
  }),
  endTime: Joi.date().greater(Joi.ref('startTime')).messages({
    'date.greater': 'Thời gian kết thúc phải sau thời gian bắt đầu'
  }),
  maxParticipants: Joi.number().integer().min(0).default(0),
  coverImageUrl: Joi.string().uri().allow('').default('')
});

// Body validation cho PUT /api/events/:id
export const updateEventSchema = Joi.object({
  title: Joi.string().min(3).max(200).messages({
    'string.min': 'Tiêu đề phải có ít nhất 3 ký tự',
    'string.max': 'Tiêu đề không quá 200 ký tự'
  }),
  description: Joi.string().max(5000),
  location: Joi.string(),
  address: Joi.string().allow(''),
  startTime: Joi.date().greater('now').messages({
    'date.greater': 'Thời gian bắt đầu phải sau thời điểm hiện tại'
  }),
  endTime: Joi.date().greater(Joi.ref('startTime')).messages({
    'date.greater': 'Thời gian kết thúc phải sau thời gian bắt đầu'
  }),
  maxParticipants: Joi.number().integer().min(0),
  status: Joi.string().valid('PENDING', 'OPENED', 'CLOSED', 'CANCELLED'),  // Không cho set OPENED/REJECTED qua update
  coverImageUrl: Joi.string().uri().allow('')
}).min(1).messages({
  'object.min': 'Phải có ít nhất một trường để cập nhật'
});

// Body validation cho PATCH /api/events/:id/reject (ADMIN)
export const rejectEventSchema = Joi.object({
  reason: Joi.string().max(500).messages({
    'string.max': 'Lý do từ chối không quá 500 ký tự'
  })
});
