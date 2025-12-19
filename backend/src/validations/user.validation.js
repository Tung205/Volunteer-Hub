import Joi from 'joi';

/**
 * Schema cho cập nhật profile
 * Fields cho phép: name, dateOfBirth, gender
 */
export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().max(100).messages({
    'string.max': 'Tên không được vượt quá 100 ký tự'
  }),
  dateOfBirth: Joi.date().max('now').messages({
    'date.max': 'Ngày sinh không được là ngày tương lai'
  }),
  gender: Joi.string().valid('Nam', 'Nữ', 'Khác').messages({
    'any.only': 'Giới tính phải là Nam, Nữ hoặc Khác'
  })
}).min(1).messages({
  'object.min': 'Cần ít nhất một trường để cập nhật'
});
