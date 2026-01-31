import api from './axios';

export const authApi = {
    // Register a new user
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // Login user
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    // Get current user
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Logout
    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    // Forgot password
    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    // Reset password
    resetPassword: async (token, password, confirmPassword) => {
        const response = await api.post(`/auth/reset-password/${token}`, {
            password,
            confirmPassword
        });
        return response.data;
    },

    // Update password
    updatePassword: async (currentPassword, newPassword) => {
        const response = await api.put('/auth/update-password', {
            currentPassword,
            newPassword
        });
        return response.data;
    }
};

export default authApi;
