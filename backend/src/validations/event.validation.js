import Joi from 'joi';

// ==================== CONSTANTS ====================
const PUBLIC_STATUS = ['OPENED', 'CLOSED', 'CANCELLED'];
const ALL_STATUS = ['PENDING', 'OPENED', 'REJECTED', 'CLOSED', 'CANCELLED'];

// Location pattern: Unicode letters, numbers, spaces, common punctuation
// Ngăn chặn ReDoS và regex injection bằng cách chỉ cho phép ký tự an toàn
const LOCATION_PATTERN = /^[\p{L}\p{N}\s,.\/\-()]+$/u;
const LOCATION_MAX_LENGTH = 10;

// ==================== QUERY SCHEMAS ====================

// Query validation cho PUBLIC GET /api/events
export const getEventsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(6),
  status: Joi.string().valid(...PUBLIC_STATUS),
  location: Joi.string().trim().max(LOCATION_MAX_LENGTH).pattern(LOCATION_PATTERN).messages({
    'string.max': `Địa điểm không quá ${LOCATION_MAX_LENGTH} ký tự`,
    'string.pattern.base': 'Địa điểm chứa ký tự không hợp lệ'
  }),
  search: Joi.string().max(100),
  startDate: Joi.date(),
  endDate: Joi.date(),
  sort: Joi.string().valid('upcoming', 'newest').default('upcoming')
});

// Query validation cho ADMIN GET /api/events (nếu cần full access)
export const getEventsQuerySchemaAdmin = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(6),
  status: Joi.string().valid(...ALL_STATUS),
  location: Joi.string().trim().max(LOCATION_MAX_LENGTH).pattern(LOCATION_PATTERN).messages({
    'string.max': `Địa điểm không quá ${LOCATION_MAX_LENGTH} ký tự`,
    'string.pattern.base': 'Địa điểm chứa ký tự không hợp lệ'
  }),
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
  location: Joi.string().required().trim().max(LOCATION_MAX_LENGTH).pattern(LOCATION_PATTERN).messages({
    'string.empty': 'Địa điểm không được để trống',
    'string.max': `Địa điểm không quá ${LOCATION_MAX_LENGTH} ký tự`,
    'string.pattern.base': 'Địa điểm chứa ký tự không hợp lệ',
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
  location: Joi.string().trim().max(LOCATION_MAX_LENGTH).pattern(LOCATION_PATTERN).messages({
    'string.max': `Địa điểm không quá ${LOCATION_MAX_LENGTH} ký tự`,
    'string.pattern.base': 'Địa điểm chứa ký tự không hợp lệ'
  }),
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
