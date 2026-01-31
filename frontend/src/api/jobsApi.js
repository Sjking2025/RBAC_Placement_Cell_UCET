import api from './axios';

export const jobsApi = {
    // Get all jobs
    getAll: async (params = {}) => {
        const response = await api.get('/jobs', { params });
        return response.data;
    },

    // Get single job
    getById: async (id) => {
        const response = await api.get(`/jobs/${id}`);
        return response.data;
    },

    // Create job
    create: async (jobData) => {
        const response = await api.post('/jobs', jobData);
        return response.data;
    },

    // Update job
    update: async (id, jobData) => {
        const response = await api.put(`/jobs/${id}`, jobData);
        return response.data;
    },

    // Delete job
    delete: async (id) => {
        const response = await api.delete(`/jobs/${id}`);
        return response.data;
    },

    // Update job status
    updateStatus: async (id, status) => {
        const response = await api.patch(`/jobs/${id}/status`, { status });
        return response.data;
    },

    // Apply to job
    apply: async (id, applicationData = {}) => {
        const response = await api.post(`/jobs/${id}/apply`, applicationData);
        return response.data;
    },

    // Get job applications
    getApplications: async (id, params = {}) => {
        const response = await api.get(`/jobs/${id}/applications`, { params });
        return response.data;
    }
};

export default jobsApi;
