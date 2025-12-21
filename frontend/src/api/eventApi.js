import api from './axios';

export const getFeaturedEvents = async (filterType = 'newest', limit = 6) => {
    try {
        let response;
        if (filterType === 'newest') {
            response = await api.get('api/events', { params: { sort: 'newest', limit } });
            return response.data.events;
        } else if (filterType === 'members') {
            response = await api.get('api/events/highlighted', { params: { limit } });
            return response.data.events;
        } else if (filterType === 'posts') {
            response = await api.get('api/events/most-discussed', { params: { limit } });
            return response.data.events;
        } else {
            // Fallback
            response = await api.get('api/events', { params: { limit } });
            return response.data.events;
        }
    } catch (error) {
        console.error("Error fetching featured events:", error);
        return [];
    }
};

export const getManagedEvents = async (managerId, limit = 50) => {
    try {
        const response = await api.get('api/events', { params: { organizerId: managerId, limit } });
        return response.data; // { events, pagination }
    } catch (error) {
        console.error("Error fetching managed events:", error);
        throw error;
    }
};

export const getPendingManagedEvents = async (managerId) => {
    try {
        const response = await api.get('api/events', {
            params: {
                organizerId: managerId,
                status: 'PENDING',
                limit: 50
            }
        });
        return response.data.events;
    } catch (error) {
        console.error("Error fetching pending managed events:", error);
        return [];
    }
};

export const createEvent = async (eventData) => {
    try {
        const response = await api.post('api/events', eventData);
        return response.data.event;
    } catch (error) {
        console.error("Error creating event:", error);
        throw error;
    }
};

export const getEventById = async (id) => {
    try {
        const response = await api.get(`api/events/${id}`);
        return response.data.event;
    } catch (error) {
        console.error("Error fetching event details:", error);
        throw error;
    }
};

export const getAllEventsForExport = async () => {
    try {
        // Fetch ALL events from admin-specific endpoint
        const response = await api.get('api/events/export-all');
        return response.data.events;
    } catch (error) {
        console.error("Error fetching all events for export:", error);
        return [];
    }
};

export const getPendingEvents = async (page = 1, limit = 10) => {
    try {
        const response = await api.get('/api/events/pending', { params: { page, limit } });
        return response.data; // { events, pagination }
    } catch (error) {
        console.error("Error fetching pending events:", error);
        return { events: [], pagination: {} };
    }
};

export const approveEvent = async (eventId) => {
    try {
        const response = await api.patch(`/api/events/${eventId}/approve`);
        return response.data;
    } catch (error) {
        console.error("Error approving event:", error);
        throw error;
    }
};

export const rejectEvent = async (eventId, reason) => {
    try {
        const response = await api.patch(`/api/events/${eventId}/reject`, { reason });
        return response.data;
    } catch (error) {
        console.error("Error rejecting event:", error);
        throw error;
    }
};
