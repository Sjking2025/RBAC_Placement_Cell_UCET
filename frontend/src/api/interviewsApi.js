import api from './axios';

export const interviewsApi = {
    getAll: (params) => api.get('/interviews', { params }),
    getById: (id) => api.get(`/interviews/${id}`),
    schedule: (data) => api.post('/interviews', data),
    update: (id, data) => api.put(`/interviews/${id}`, data),
    updateStatus: (id, data) => api.patch(`/interviews/${id}/status`, data),
    delete: (id) => api.delete(`/interviews/${id}`)
};

export default interviewsApi;
