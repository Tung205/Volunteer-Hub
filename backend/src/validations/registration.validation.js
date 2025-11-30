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
