import api from './axios';

export const announcementsApi = {
    // Get all announcements
    getAll: async (params = {}) => {
        const response = await api.get('/announcements', { params });
        return response.data;
    },

    // Get single announcement
    getById: async (id) => {
        const response = await api.get(`/announcements/${id}`);
        return response.data;
    },

    // Create announcement
    create: async (data) => {
        const response = await api.post('/announcements', data);
        return response.data;
    },

    // Update announcement
    update: async (id, data) => {
        const response = await api.put(`/announcements/${id}`, data);
        return response.data;
    },

    // Delete announcement
    delete: async (id) => {
        const response = await api.delete(`/announcements/${id}`);
        return response.data;
    },

    // Upload attachment
    uploadAttachment: async (id, file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/announcements/${id}/attachment`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};

export default announcementsApi;
