import { ManagerRequestService } from '../services/manager-request.service.js';

export const ManagerRequestController = {
  /**
   * Volunteer gửi yêu cầu trở thành Manager
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async submitManagerRequest(req, res) {
    try {
      console.log('submitManagerRequest - User:', req.user);
      console.log('submitManagerRequest - Body:', req.body);

      const volunteerId = req.user.id;
      const { reason } = req.body;

      if (!volunteerId) {
        throw new Error("User ID is missing from request");
      }

      const request = await ManagerRequestService.createManagerRequest(volunteerId, reason);

      return res.status(201).json({
        message: 'Request submitted successfully.',
      });
    } catch (error) {
      console.error('[ManagerRequestController] Error submitting manager request:', error);

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          details: Object.values(error.errors).map(e => e.message),
        });
      }

      if (error.status) {
        return res.status(error.status).json({
          error: error.message,
          details: error.details,
        });
      }

      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: error.message,
        stack: error.stack // Debugging
      });
    }
  },

  /**
   * Admin duyệt hoặc từ chối yêu cầu trở thành Manager
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async approveManagerRequest(req, res) {
    try {
      const adminId = req.user.id;
      const { id: requestId } = req.params;
      const { status, rejectionReason } = req.body;

      const updatedRequest = await ManagerRequestService.updateRequestStatus(
        requestId,
        status,
        adminId,
        rejectionReason
      );

      return res.status(200).json({
        message: 'Request updated successfully.',
        data: updatedRequest,
      });
    } catch (error) {
      console.error('[ManagerRequestController] Error approving manager request:', error);

      if (error.status) {
        return res.status(error.status).json({
          error: error.message,
          details: error.details,
        });
      }

      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred.',
      });
    }
  },

  /**
   * Admin từ chối yêu cầu trở thành Manager
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async rejectManagerRequest(req, res) {
    try {
      const adminId = req.user.id;
      const { id: requestId } = req.params;
      const { rejectionReason } = req.body;

      const rejectedRequest = await ManagerRequestService.rejectManagerRequest(
        requestId,
        adminId,
        rejectionReason
      );

      return res.status(200).json({
        message: 'Request rejected successfully.',
        data: rejectedRequest,
      });
    } catch (error) {
      console.error('[ManagerRequestController] Error rejecting manager request:', error);

      if (error.status) {
        return res.status(error.status).json({
          error: error.message,
          details: error.details,
        });
      }

      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred.',
      });
    }
  },
  /**
   * Admin lấy danh sách yêu cầu chờ duyệt
   */
  async getPendingRequests(req, res) {
    try {
      const requests = await ManagerRequestService.getAllPendingRequests();
      return res.status(200).json({
        data: requests
      });
    } catch (error) {
      console.error('[ManagerRequestController] Error fetching pending requests:', error);
      return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  },

  /**
   * User lấy lịch sử yêu cầu của mình
   */
  async getMyRequests(req, res) {
    try {
      const volunteerId = req.user.id;
      const requests = await ManagerRequestService.getRequestHistory(volunteerId);
      return res.status(200).json({
        data: requests
      });
    } catch (error) {
      console.error('[ManagerRequestController] Error fetching my requests:', error);
      return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  }
};