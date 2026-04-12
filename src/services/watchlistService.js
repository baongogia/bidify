import api from '../lib/axios';

export const toggleWatchlist = async (productId) => {
    return await api.post(`/watchlist/${productId}`);
};

export const getMyWatchlist = async (page = 1, limit = 10) => {
    return await api.get(`/watchlist?page=${page}&limit=${limit}`);
};
