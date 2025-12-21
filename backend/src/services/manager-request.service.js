import { ManagerRequest } from '../models/manager-request.model.js';

export const ManagerRequestService = {
  /**
   * Tạo yêu cầu trở thành Manager
   * @param {string} volunteerId - ID của Volunteer gửi yêu cầu
   * @param {string} reason - Lý do gửi yêu cầu
   * @returns {Promise<Object>} - Yêu cầu vừa được tạo
   */
  async createManagerRequest(volunteerId, reason) {
    try {
      const request = new ManagerRequest({
        volunteerId,
        reason,
        status: 'PENDING',
      });
      await request.save();
      return request;
    } catch (error) {
      console.error('[ManagerRequestService] Error creating manager request:', error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử yêu cầu của Volunteer
   * @param {string} volunteerId - ID của Volunteer
   * @returns {Promise<Array>} - Danh sách yêu cầu
   */
  async getRequestHistory(volunteerId) {
    try {
      return await ManagerRequest.find({ volunteerId }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('[ManagerRequestService] Error fetching request history:', error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái yêu cầu trở thành Manager
   * @param {string} requestId - ID của yêu cầu
   * @param {string} status - Trạng thái mới (APPROVED hoặc REJECTED)
   * @param {string} adminId - ID của Admin thực hiện duyệt
   * @param {string} [rejectionReason] - Lý do từ chối (nếu có)
   * @returns {Promise<Object>} - Yêu cầu đã được cập nhật
   */
  async updateRequestStatus(requestId, status, adminId, rejectionReason = null) {
    try {
      const request = await ManagerRequest.findById(requestId);

      if (!request) {
        const err = new Error('REQUEST_NOT_FOUND');
        err.status = 404;
        throw err;
      }

      if (request.status !== 'PENDING') {
        const err = new Error('INVALID_REQUEST_STATUS');
        err.status = 400;
        err.details = 'Chỉ có thể duyệt yêu cầu ở trạng thái PENDING';
        throw err;
      }

      request.status = status;
      request.rejectionReason = status === 'REJECTED' ? rejectionReason : null;
      request.adminId = adminId;
      await request.save();

      return request;
    } catch (error) {
      console.error('[ManagerRequestService] Error updating request status:', error);
      throw error;
    }
  },
};