import api from './axios';

export const studentsApi = {
    // Get all students
    getAll: async (params = {}) => {
        const response = await api.get('/students', { params });
        return response.data;
    },

    // Get single student
    getById: async (id) => {
        const response = await api.get(`/students/${id}`);
        return response.data;
    },

    // Update student profile
    update: async (id, profileData) => {
        const response = await api.put(`/students/${id}`, profileData);
        return response.data;
    },

    // Skills
    addSkill: async (id, skillData) => {
        const response = await api.post(`/students/${id}/skills`, skillData);
        return response.data;
    },

    deleteSkill: async (id, skillId) => {
        const response = await api.delete(`/students/${id}/skills/${skillId}`);
        return response.data;
    },

    // Projects
    addProject: async (id, projectData) => {
        const response = await api.post(`/students/${id}/projects`, projectData);
        return response.data;
    },

    // Certifications
    addCertification: async (id, certData) => {
        const response = await api.post(`/students/${id}/certifications`, certData);
        return response.data;
    },

    // Internships
    addInternship: async (id, internshipData) => {
        const response = await api.post(`/students/${id}/internships`, internshipData);
        return response.data;
    },

    // Resume upload
    uploadResume: async (id, file) => {
        const formData = new FormData();
        formData.append('resume', file);
        const response = await api.post(`/students/${id}/resume`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

export default studentsApi;
