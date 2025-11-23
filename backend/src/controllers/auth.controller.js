import Joi from 'joi';
import { AuthService } from '../services/auth.service.js';
import axios from 'axios';
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().allow('').default(''),
  dateOfBirth: Joi.date().less('now'),
  gender: Joi.string().valid('Nam', 'Nữ', 'Khác').default('Khác')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  recaptcha: Joi.string().required()
});
const RECAPTCHA_SECRET_KEY= "6LePIAosAAAAAFowdKKnS0aIkyozKqjRZdmizDvU";
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
    const {recaptcha} = value;
    try {
      console.log("reCAPTCHA token:", recaptcha);
      const response = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify`,
        null,
        {
          params: {
            // secret: process.env.RECAPTCHA_SECRET_KEY,
            secret: RECAPTCHA_SECRET_KEY,
            response: recaptcha,
          },
        }
      );
      console.log("reCAPTCHA verify result:", response.data);

      if (!response.data.success) {
        return res.status(400).json({ error: "INVALID_RECAPTCHA" });
      }
    } catch (err) {
      console.error("reCAPTCHA error:", err);
      return res.status(500).json({ error: "RECAPTCHA_VERIFICATION_FAILED" });
    }
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

