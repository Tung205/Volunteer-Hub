import api from './axios';

export const getAllUsers = async () => {
    try {
        // Assuming there is an endpoint /api/users accessible to admins
        const response = await api.get('/api/users');
        return response.data.users;
    } catch (error) {
        console.error("Error fetching all users:", error);
        return [];
    }
};

export const getUserById = async (id) => {
    try {
        const response = await api.get(`/api/users/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching user ${id}:`, error);
        return null;
    }
};
