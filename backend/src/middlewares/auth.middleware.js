import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Event } from '../models/event.model.js';

/**
 * Middleware optional auth:
 * - Không có token -> guest -> next()
 * - Có token hợp lệ -> set req.user -> next()
 * - Có token nhưng invalid/expired -> 401
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // guest
      return next();
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles || ["VOLUNTEER"],
    };

    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "INVALID_TOKEN", message: "Token không hợp lệ" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "TOKEN_EXPIRED", message: "Token đã hết hạn" });
    }
    return res.status(401).json({ error: "UNAUTHORIZED", message: "Xác thực thất bại" });
  }
};

/**
 * Middleware xác thực user đã đăng nhập
 */
export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token không tồn tại' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles || ['VOLUNTEER']
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Token không hợp lệ' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'TOKEN_EXPIRED', message: 'Token đã hết hạn' });
    }
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Xác thực thất bại' });
  }
};

/**
 * Middleware kiểm tra user có role yêu cầu
 * @param {...string} roles - Các role được phép (VOLUNTEER, MANAGER, ADMIN)
 * @example hasRole('MANAGER', 'ADMIN')
 */
export const hasRole = (...roles) => {
  return (req, res, next) => {
    // Check if user exists (should be set by isAuthenticated)
    if (!req.user) {
      return res.status(401).json({ 
        error: 'UNAUTHORIZED', 
        message: 'Vui lòng đăng nhập' 
      });
    }
    
    const userRoles = req.user.roles || [];
    
    // Check if user has any of the required roles
    const hasPermission = roles.some(role => userRoles.includes(role));
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'FORBIDDEN', 
        message: `Bạn không có quyền thực hiện thao tác này. Yêu cầu: ${roles.join(' hoặc ')}` 
      });
    }
    
    next();
  };
};

/**
 * Middleware kiểm tra user có quyền sửa/xóa event
 * - Owner của event (managerId === userId)
 * - ADMIN (có quyền với mọi event)
 */
export const canModifyEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    const userRoles = req.user.roles || [];
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ 
        error: 'INVALID_EVENT_ID', 
        message: 'ID sự kiện không hợp lệ' 
      });
    }
    
    // Find event
    const event = await Event.findById(eventId).lean();
    
    if (!event) {
      return res.status(404).json({ 
        error: 'EVENT_NOT_FOUND', 
        message: 'Không tìm thấy sự kiện' 
      });
    }
    
    // Check permission
    const isOwner = event.organizerId.toString() === userId;
    const isAdmin = userRoles.includes('ADMIN');
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        error: 'FORBIDDEN', 
        message: 'Bạn không có quyền thao tác với sự kiện này' 
      });
    }
    
    // Check if event can be modified (not CLOSED or CANCELLED)
    if (event.status === 'CLOSED' || event.status === 'CANCELLED') {
      return res.status(400).json({
        error: 'EVENT_NOT_EDITABLE',
        message: `Không thể sửa sự kiện đã ${event.status === 'CLOSED' ? 'đóng' : 'hủy'}`
      });
    }
    
    // Attach event to request for reuse in controller
    req.event = event;
    
    next();
  } catch (error) {
    console.error('canModifyEvent error:', error);
    return res.status(500).json({ 
      error: 'INTERNAL', 
      message: 'Lỗi kiểm tra quyền truy cập' 
    });
  }
};
/**
 * Middleware kiểm tra user có quyền quản lý registrations của event
 * - Owner của event (organizerId === userId)
 * - ADMIN (có quyền với mọi event)
 * Dùng cho: GET/PATCH registrations của 1 event
 */
export const canManageRegistrations = async (req, res, next) => {
  try {
    // eventId có thể từ params.eventId (GET) hoặc từ registration lookup (PATCH)
    let eventId = req.params.eventId;
    
    // Nếu không có eventId trong params, có thể là route PATCH với regId
    // Sẽ cần lookup registration để lấy eventId
    if (!eventId && req.params.regId) {
      const { Registration } = await import('../models/registration.model.js');
      
      if (!mongoose.Types.ObjectId.isValid(req.params.regId)) {
        return res.status(400).json({ 
          error: 'INVALID_REGISTRATION_ID', 
          message: 'ID đăng ký không hợp lệ' 
        });
      }
      
      const registration = await Registration.findById(req.params.regId).lean();
      
      if (!registration) {
        return res.status(404).json({ 
          error: 'REGISTRATION_NOT_FOUND', 
          message: 'Không tìm thấy đăng ký' 
        });
      }
      
      eventId = registration.eventId.toString();
      req.registration = registration; // Attach for reuse
    }
    
    const userId = req.user.id;
    const userRoles = req.user.roles || [];
    
    // Validate eventId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ 
        error: 'INVALID_EVENT_ID', 
        message: 'ID sự kiện không hợp lệ' 
      });
    }
    
    // Find event
    const event = await Event.findById(eventId).lean();
    
    if (!event) {
      return res.status(404).json({ 
        error: 'EVENT_NOT_FOUND', 
        message: 'Không tìm thấy sự kiện' 
      });
    }
    
    // Check permission: owner hoặc admin
    const isOwner = event.organizerId.toString() === userId;
    const isAdmin = userRoles.includes('ADMIN');
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        error: 'FORBIDDEN', 
        message: 'Bạn không có quyền quản lý đăng ký của sự kiện này' 
      });
    }
    
    // Attach event to request for reuse in controller
    req.event = event;
    
    next();
  } catch (error) {
    console.error('canManageRegistrations error:', error);
    return res.status(500).json({ 
      error: 'INTERNAL', 
      message: 'Lỗi kiểm tra quyền truy cập' 
    });
  }
};
