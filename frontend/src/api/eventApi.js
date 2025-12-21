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

export const getEventById = async (id) => {
    try {
        const response = await api.get(`api/events/${id}`);
        return response.data.event;
    } catch (error) {
        console.error("Error fetching event details:", error);
        throw error;
    }
};
