import Joi from 'joi';
import { AuthService } from '../services/auth.service.js';

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().allow('').default('')
});

export const AuthController = {
  async register(req, res) {
    // validate đơn giản
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ error: 'VALIDATION', details: error.details.map(d => d.message) });

    try {
      const user = await AuthService.register(value);
      return res.status(201).json({ message: 'registered', user });
    } catch (e) {
      if (e.status) return res.status(e.status).json({ error: e.message });
      console.error(e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  }
};

