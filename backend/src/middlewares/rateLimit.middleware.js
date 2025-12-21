import rateLimit from 'express-rate-limit';

// Key generator: userId nếu đã login, IP nếu chưa
const keyGenerator = (req) => req.user?.id || req.ip;

// Global limiter: 500 req/min per IP
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  keyGenerator: (req) => req.ip,
  standardHeaders: true,  // Retry-After header
  message: { error: 'TOO_MANY_REQUESTS', message: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' }
});

// Auth limiter: 5 req/min per IP (login/register)
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.ip,
  standardHeaders: true,
  message: { error: 'TOO_MANY_REQUESTS', message: 'Quá nhiều yêu cầu đăng nhập/đăng ký, vui lòng thử lại sau.' }
});

// Action limiter: 30 req/min per user (like, comment)
export const actionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator,
  standardHeaders: true,
  message: { error: 'TOO_MANY_REQUESTS', message: 'Quá nhiều thao tác, vui lòng thử lại sau.' }
});
