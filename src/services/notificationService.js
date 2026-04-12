import api from '../lib/axios';

export const getMyNotifications = async (page = 1, limit = 10) => {
    return await api.get(`/notifications?page=${page}&limit=${limit}`);
};

export const markNotificationRead = async (id) => {
    return await api.patch(`/notifications/${id}/read`);
};
