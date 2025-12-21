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
};