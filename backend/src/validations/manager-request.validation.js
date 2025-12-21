import Joi from 'joi';

export const createManagerRequestSchema = Joi.object({
  reason: Joi.string().required().trim().max(500).messages({
    'string.max': 'Lý do không được vượt quá 500 ký tự',
    'string.empty': 'Lý do không được để trống',
    'any.required': 'Lý do là bắt buộc'
  })
});