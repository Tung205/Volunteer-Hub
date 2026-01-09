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

// Cancel registration
export const cancelRegistration = async (eventId) => {
    try {
        const response = await api.delete(`api/registrations/${eventId}/register`);
        return response.data;
    } catch (error) {
        console.error("Error cancelling registration:", error);
        throw error;
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
export const rejectRegistration = async (regId, reason) => {
    try {
        const response = await api.patch(`api/registrations/${regId}/reject`, { reason });
        return response.data;
    } catch (error) {
        console.error("Error rejecting registration:", error);
        throw error;
    }
};
// Register for specific event
export const registerForEvent = async (eventId) => {
    try {
        const response = await api.post(`api/registrations/${eventId}/register`);
        return response.data.registration;
    } catch (error) {
        console.error("Error registering for event:", error);
        throw error;
    }
};

// Check registration status for an event (for current user)
export const getRegistrationStatus = async (eventId) => {
    try {
        const response = await api.get(`api/registrations/${eventId}/status`);
        return response.data.status; // 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'
    } catch (error) {
        // If 404/401 just return NONE usually, but let's log
        return 'NONE';
    }
};

// Get approved attendees
export const getEventAttendees = async (eventId) => {
    try {
        const response = await api.get(`api/registrations/${eventId}/attendees`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching attendees:", error);
        return [];
    }
};
