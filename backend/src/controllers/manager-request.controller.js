import { ManagerRequestService } from '../services/manager-request.service.js';

export const ManagerRequestController = {
  /**
   * Volunteer gửi yêu cầu trở thành Manager
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async submitManagerRequest(req, res) {
    try {
      const volunteerId = req.user.id;
      const { reason } = req.body;

      const request = await ManagerRequestService.createManagerRequest(volunteerId, reason);

      return res.status(201).json({
        message: 'Request submitted successfully.',
      });
    } catch (error) {
      console.error('[ManagerRequestController] Error submitting manager request:', error);

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
};