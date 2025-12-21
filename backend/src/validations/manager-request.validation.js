import Joi from 'joi';

export const createManagerRequestSchema = Joi.object({
  reason: Joi.string().required().trim().max(500).messages({
    'string.max': 'Lý do không được vượt quá 500 ký tự',
    'string.empty': 'Lý do không được để trống',
    'any.required': 'Lý do là bắt buộc'
  })
});

export const updateManagerRequestSchema = Joi.object({
  status: Joi.string().valid('APPROVED', 'REJECTED').required().messages({
    'any.only': 'Trạng thái phải là APPROVED hoặc REJECTED',
    'any.required': 'Trạng thái là bắt buộc'
  }),
  rejectionReason: Joi.string().max(500).optional().messages({
    'string.max': 'Lý do từ chối không được vượt quá 500 ký tự'
  })
});