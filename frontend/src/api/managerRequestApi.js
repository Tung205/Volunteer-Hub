import api from './axios';

// Gửi yêu cầu trở thành Manager
export const createManagerRequest = async (reason) => {
    try {
        const response = await api.post('api/manager-requests', { reason });
        return response.data;
    } catch (error) {
        console.error("Error creating manager request:", error);
        console.error("API Error Details:", error.response?.data);
        throw error;
    }
};

// Admin: Lấy danh sách yêu cầu đang chờ
export const getPendingManagerRequests = async () => {
    try {
        const response = await api.get('api/manager-requests/pending');
        return response.data.data;
    } catch (error) {
        console.error("Error fetching pending requests:", error);
        return [];
    }
};

// Admin: Duyệt yêu cầu
export const approveManagerRequest = async (requestId, status = 'APPROVED') => {
    try {
        const response = await api.patch(`api/manager-requests/${requestId}/approve`, { status });
        return response.data.data;
    } catch (error) {
        console.error("Error approving request:", error);
        throw error;
    }
};

// Admin: Từ chối yêu cầu
export const rejectManagerRequest = async (requestId, reason) => {
    try {
        const response = await api.patch(`api/manager-requests/${requestId}/reject`, { rejectionReason: reason });
        return response.data.data;
    } catch (error) {
        console.error("Error rejecting request:", error);
        throw error;
    }
};

// Volunteer: Lấy lịch sử yêu cầu của chính mình
export const getMyManagerRequest = async () => {
    try {
        const response = await api.get('api/manager-requests/my-requests');
        // Trả về yêu cầu mới nhất (đầu tiên trong list)
        return response.data.data.length > 0 ? response.data.data[0] : null;
    } catch (error) {
        console.error("Error fetching my request:", error);
        console.error("API Error Details:", error.response?.data);
        return null;
    }
};
