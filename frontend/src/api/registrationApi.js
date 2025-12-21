import api from './axios';

// Get registrations for the current user (Volunteer)
export const getMyRegistrations = async () => {
    try {
        const response = await api.get('api/registrations/my-registrations');
        return response.data.data;
    } catch (error) {
        console.error("Error fetching my registrations:", error);
        return [];
    }
};

// Manager: Get all pending registrations for my events
export const getPendingRegistrations = async () => {
    try {
        const response = await api.get('api/registrations/pending');
        return response.data.data;
    } catch (error) {
        console.error("Error fetching pending registrations:", error);
        throw error;
    }
};

// Manager: Get registrations for a specific event
export const getEventRegistrations = async (eventId) => {
    try {
        const response = await api.get(`api/registrations/events/${eventId}`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching event registrations:", error);
        throw error;
    }
};

// Manager: Approve registration
export const approveRegistration = async (regId) => {
    try {
        const response = await api.patch(`api/registrations/${regId}/approve`);
        return response.data;
    } catch (error) {
        console.error("Error approving registration:", error);
        throw error;
    }
};

// Manager: Reject registration
export const rejectRegistration = async (regId) => {
    try {
        const response = await api.patch(`api/registrations/${regId}/reject`);
        return response.data;
    } catch (error) {
        console.error("Error rejecting registration:", error);
        throw error;
    }
};
