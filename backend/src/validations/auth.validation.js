import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'string.empty': 'Email không được để trống',
    'any.required': 'Email là bắt buộc'
  }),
  password: Joi.string()
  .min(6)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/)
  .required()
  .messages({
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    'string.pattern.base': 'Mật khẩu phải gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
    'string.empty': 'Mật khẩu không được để trống',
    'any.required': 'Mật khẩu là bắt buộc'
  }),

  name: Joi.string().allow('').default(''),
  dateOfBirth: Joi.date().less('now').messages({
    'date.less': 'Ngày sinh phải trước ngày hiện tại'
  }),
  gender: Joi.string().valid('Nam', 'Nữ', 'Khác').default('Khác')
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'string.empty': 'Email không được để trống',
    'any.required': 'Email là bắt buộc'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Mật khẩu không được để trống',
    'any.required': 'Mật khẩu là bắt buộc'
  }),
  recaptcha: Joi.string().optional().messages({
    'string.empty': 'reCAPTCHA không được để trống'
  })
});
