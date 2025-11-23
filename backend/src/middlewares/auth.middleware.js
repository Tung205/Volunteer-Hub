import jwt from 'jsonwebtoken';

/**
 * Middleware xác thực user đã đăng nhập
 */
export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token không tồn tại' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn' });
    }
    return res.status(401).json({ message: 'Xác thực thất bại' });
  }
};
