import api from '../lib/axios';

export const getAdminUsers = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/admin/users${query ? `?${query}` : ''}`);
};

export const lockAdminUser = async (id, reason) => {
    return await api.put(`/admin/users/${id}/lock`, { reason });
};

export const unlockAdminUser = async (id) => {
    return await api.put(`/admin/users/${id}/unlock`);
};

export const deleteAdminUser = async (id) => {
    return await api.delete(`/admin/users/${id}`);
};

export const getAdminUserActivity = async (id, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/admin/users/${id}/activity${query ? `?${query}` : ''}`);
};

export const getModerationProducts = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/admin/moderation/products${query ? `?${query}` : ''}`);
};

export const approveModerationProduct = async (id) => {
    return await api.put(`/admin/moderation/products/${id}/approve`);
};

export const rejectModerationProduct = async (id, reason) => {
    return await api.put(`/admin/moderation/products/${id}/reject`, { reason });
};

export const requestEditModerationProduct = async (id, reason) => {
    return await api.put(`/admin/moderation/products/${id}/request-edit`, { reason });
};

export const deleteModerationProduct = async (id) => {
    return await api.delete(`/admin/moderation/products/${id}`);
};

export const getAdminLogs = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/admin/logs${query ? `?${query}` : ''}`);
};

export const getAdminSettings = async () => {
    return await api.get('/admin/settings');
};

export const updateAdminSetting = async (key, value, description = '') => {
    return await api.put(`/admin/settings/${encodeURIComponent(key)}`, { value, description });
};
