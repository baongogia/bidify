import api from '../lib/axios';

export const placeBid = async (productId, amount) => {
    return await api.post(`/products/${productId}/bids`, { amount });
};

export const getBidHistory = async (productId, page = 1, limit = 10) => {
    return await api.get(`/products/${productId}/bids?page=${page}&limit=${limit}`);
};
