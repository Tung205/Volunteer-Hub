import { RegistrationService, getMyRegistrationStatus } from '../services/registration.service.js';

export const RegistrationController = {
  
  // POST /api/registrations/:eventId/register - TNV đăng ký tham gia sự kiện
  async register(req, res) {
    try {
      const eventId = req.params.eventId;
      const userId = req.user.id;
      const userInfo = {
        name: req.user.name || '',
        email: req.user.email || ''
      };
      
      const registration = await RegistrationService.registerEvent(eventId, userId, userInfo);
      
      return res.status(201).json({
        success: true,
        message: 'Đăng ký sự kiện thành công. Vui lòng chờ MANAGER phê duyệt.',
        data: registration
      });
    } catch (error) {
      // Handle specific errors
      if (error.status) {
        return res.status(error.status).json({
          error: error.message,
          details: error.details
        });
      }
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          details: Object.values(error.errors).map(e => e.message)
        });
      }
      
      // Handle duplicate key error (unique constraint)
      if (error.code === 11000) {
        return res.status(409).json({
          error: 'ALREADY_REGISTERED',
          details: 'Bạn đã đăng ký sự kiện này rồi'
        });
      }
      
      console.error('Register error:', error);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  // GET /api/registrations/my-registrations - TNV xem danh sách sự kiện đã đăng ký
  async getMyRegistrations(req, res) {
    try {
      const userId = req.user.id;
      
      const registrations = await RegistrationService.getMyRegistrations(userId);
      
      return res.status(200).json({
        success: true,
        data: registrations,
        total: registrations.length
      });
    } catch (error) {
      console.error('GetMyRegistrations error:', error);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  // DELETE /api/registrations/:eventId/register - TNV hủy đăng ký sự kiện
  async cancelRegistration(req, res) {
    try {
      const eventId = req.params.eventId;
      const userId = req.user.id;
      
      const registration = await RegistrationService.cancelRegistration(eventId, userId);
      
      return res.status(200).json({
        success: true,
        message: 'Đã hủy đăng ký sự kiện thành công',
        data: registration
      });
    } catch (error) {
      // Handle specific errors
      if (error.status) {
        return res.status(error.status).json({
          error: error.message,
          details: error.details
        });
      }
      
      console.error('CancelRegistration error:', error);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  // ==================== MANAGER APIS ====================

  // GET /api/registrations/event/:eventId - MANAGER xem danh sách TNV đã đăng ký
  async getEventRegistrations(req, res) {
    try {
      const eventId = req.params.eventId;
      
      const registrations = await RegistrationService.getEventRegistrations(eventId);
      
      return res.status(200).json({
        success: true,
        data: registrations,
        total: registrations.length,
        event: req.event // Từ canManageRegistrations middleware
      });
    } catch (error) {
      console.error('GetEventRegistrations error:', error);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  // PATCH /api/registrations/:regId/approve - MANAGER duyệt đăng ký TNV
  async approveRegistration(req, res) {
    try {
      const regId = req.params.regId;
      const managerId = req.user.id;
      
      const registration = await RegistrationService.approveRegistration(regId, managerId);
      
      return res.status(200).json({
        success: true,
        message: 'Đã duyệt đăng ký thành công',
        data: registration
      });
    } catch (error) {
      // Handle specific errors
      if (error.status) {
        return res.status(error.status).json({
          error: error.message,
          details: error.details
        });
      }
      
      console.error('ApproveRegistration error:', error);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  // PATCH /api/registrations/:regId/reject - MANAGER từ chối đăng ký TNV
  async rejectRegistration(req, res) {
    try {
      const regId = req.params.regId;
      const managerId = req.user.id;
      const { reason } = req.body;
      
      const registration = await RegistrationService.rejectRegistration(regId, managerId, reason);
      
      return res.status(200).json({
        success: true,
        message: 'Đã từ chối đăng ký',
        data: registration
      });
    } catch (error) {
      // Handle specific errors
      if (error.status) {
        return res.status(error.status).json({
          error: error.message,
          details: error.details
        });
      }
      
      console.error('RejectRegistration error:', error);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  }
};

export const getRegistrationStatus = async (req, res) => {
  try {
    const { eventId } = req.params;

    // guest -> NONE
    if (!req.user?.id) {
      return res.status(200).json({ status: "NONE" });
    }

    const result = await getMyRegistrationStatus(eventId, req.user.id);
    return res.status(200).json(result);
  } catch (err) {
    console.error("getRegistrationStatus error:", err);
    return res.status(500).json({ error: "INTERNAL", message: "Lỗi server" });
  }
};
