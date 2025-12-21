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
};