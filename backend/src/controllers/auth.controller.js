import { AuthService } from '../services/auth.service.js';
import axios from 'axios';

export const AuthController = {
  async register(req, res) {
    try {
      const user = await AuthService.register(req.body);
      return res.status(201).json({ user });
    } catch (e) {
      if (e.status) return res.status(e.status).json({ error: e.message });
      console.error(e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  async login(req, res) {
    const { recaptcha } = req.body;
    try {
      console.log("reCAPTCHA token:", recaptcha);

      // Bypass reCAPTCHA if in development mode
      if (process.env.NODE_ENV === "development") {
        console.log("Development mode: Skipping reCAPTCHA verification");
      } else {
        const response = await axios.post(
          `https://www.google.com/recaptcha/api/siteverify`,
          null,
          {
            params: {
              secret: process.env.RECAPTCHA_SECRET_KEY,
              response: recaptcha,
            },
          }
        );
        console.log("reCAPTCHA verify result:", response.data);

        if (!response.data.success) {
          return res.status(400).json({ error: "INVALID_RECAPTCHA" });
        }
      }
    } catch (err) {
      console.error("reCAPTCHA error:", err);
      return res.status(500).json({ error: "RECAPTCHA_VERIFICATION_FAILED" });
    }
    try {
      const result = await AuthService.login(req.body);
      return res.status(200).json(result);
    } catch (e) {
      if (e.status) return res.status(e.status).json({ error: "Sai mật khẩu, email hoặc email không tồn tại" });
      console.error(e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  async forgotPassword(req, res) {
    try {
      console.log("forgotPassword called. User:", req.user, "Body:", req.body);
      const { email } = req.body;
      // Pass req.user (from optionalAuth) to service
      const result = await AuthService.forgotPassword(email, req.user);
      return res.status(200).json(result);
    } catch (e) {
      if (e.status) return res.status(e.status).json({ error: e.message });
      console.error(e);
      // For security, don't always reveal if user exists, but here we kind of do for UX
      // If user not found, 404 is returned from service.
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  async resetPassword(req, res) {
    try {
      // Pass req.user to service
      const result = await AuthService.resetPassword(req.body, req.user);
      return res.status(200).json(result);
    } catch (e) {
      if (e.status) return res.status(e.status).json({ error: e.message });
      console.error(e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  }
};
