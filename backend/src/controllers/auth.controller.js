import Joi from 'joi';
import { AuthService } from '../services/auth.service.js';

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().allow('').default('')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const AuthController = {
  async register(req, res) {
    // validate đơn giản
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ error: 'VALIDATION', details: error.details.map(d => d.message) });

    try {
      const user = await AuthService.register(value);
      return res.status(201).json({ message: 'registered', user });
    } catch (e) {
      if (e.status) return res.status(e.status).json({ error: e.message });
      console.error(e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  async login(req, res) {
    // validate
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ error: 'VALIDATION', details: error.details.map(d => d.message) });

    try {
      const user = await AuthService.login(value);
      return res.status(200).json({ message: 'logged_in', user });
    } catch (e) {
      if (e.status) return res.status(e.status).json({ error: "Sai mật khẩu, email hoặc email không tồn tại" });
      console.error(e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  }
};

