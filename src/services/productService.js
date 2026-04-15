import api from '../lib/axios';

export const getProducts = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/products?${query}`);
};

export const getProductDetail = async (id) => {
    return await api.get(`/products/${id}`);
};

export const getCategories = async () => {
    return await api.get('/categories');
};

export const createProduct = async (productData) => {
    return await api.post('/products', productData);
};

export const reportProduct = async (productId, reason) => {
    return await api.post(`/products/${productId}/report`, { reason });
};

export const getMyProducts = async () => {
    return await api.get('/products/seller/my');
};

export const updateMyProduct = async (id, productData) => {
    return await api.put(`/products/${id}`, productData);
};

export const deleteMyProduct = async (id) => {
    return await api.delete(`/products/${id}`);
};

export const confirmPayment = async (id, paymentData) => {
    return await api.post(`/products/${id}/checkout`, paymentData);
};
