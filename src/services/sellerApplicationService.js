import api from '../lib/axios';

export const submitSellerApplication = async (applicationData) => {
    return await api.post('/seller-applications', applicationData);
};

export const getMyApplication = async () => {
    return await api.get('/seller-applications/me');
};

export const getAllApplications = async (status = null) => {
    const query = status ? `?status=${status}` : '';
    return await api.get(`/seller-applications/admin/all${query}`);
};

export const approveApplication = async (id) => {
    return await api.put(`/seller-applications/admin/${id}/approve`);
};

export const rejectApplication = async (id, admin_note) => {
    return await api.put(`/seller-applications/admin/${id}/reject`, { admin_note });
};
