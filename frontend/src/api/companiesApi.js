import api from './axios';

export const companiesApi = {
    // Get all companies
    getAll: async (params = {}) => {
        const response = await api.get('/companies', { params });
        return response.data;
    },

    // Get single company
    getById: async (id) => {
        const response = await api.get(`/companies/${id}`);
        return response.data;
    },

    // Create company
    create: async (companyData) => {
        const response = await api.post('/companies', companyData);
        return response.data;
    },

    // Update company
    update: async (id, companyData) => {
        const response = await api.put(`/companies/${id}`, companyData);
        return response.data;
    },

    // Delete company
    delete: async (id) => {
        const response = await api.delete(`/companies/${id}`);
        return response.data;
    },

    // Update status
    updateStatus: async (id, status) => {
        const response = await api.patch(`/companies/${id}/status`, { status });
        return response.data;
    },

    // Contacts
    addContact: async (id, contactData) => {
        const response = await api.post(`/companies/${id}/contacts`, contactData);
        return response.data;
    },

    deleteContact: async (id, contactId) => {
        const response = await api.delete(`/companies/${id}/contacts/${contactId}`);
        return response.data;
    },

    // Logo upload
    uploadLogo: async (id, file) => {
        const formData = new FormData();
        formData.append('logo', file);
        const response = await api.post(`/companies/${id}/logo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

export default companiesApi;
