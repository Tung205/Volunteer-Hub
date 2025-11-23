import { Router } from 'express';
import { AuthController } from '../controllers/auth.js';
import { isAuthenticated } from '../middlewares/index.js';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Route test middleware
router.get('/test', isAuthenticated, (req, res) => {
  res.json({ message: 'Middleware hoạt động!', user: req.user });
});

export default router;

