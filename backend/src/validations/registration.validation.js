import Joi from 'joi';

// POST/DELETE /api/registrations/:eventId/register
export const eventIdParamSchema = Joi.object({
  eventId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.empty': 'Event ID không được để trống',
      'string.pattern.base': 'Event ID không hợp lệ',
      'any.required': 'Event ID là bắt buộc'
    })
});

// PATCH /api/registrations/:regId/approve or reject
export const regIdParamSchema = Joi.object({
  regId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.empty': 'Registration ID không được để trống',
      'string.pattern.base': 'Registration ID không hợp lệ',
      'any.required': 'Registration ID là bắt buộc'
    })
});

// PATCH /api/registrations/:regId/reject - body validation
export const rejectRegistrationSchema = Joi.object({
  reason: Joi.string()
    .required()
    .min(5)
    .max(500)
    .messages({
      'string.empty': 'Lý do từ chối không được để trống',
      'string.min': 'Lý do từ chối phải có ít nhất 5 ký tự',
      'string.max': 'Lý do từ chối không quá 500 ký tự',
      'any.required': 'Lý do từ chối là bắt buộc'
    })
});
