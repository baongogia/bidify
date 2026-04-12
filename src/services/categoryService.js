import axios from '../lib/axios';

export const getCategories = async () => {
    const response = await axios.get('/categories');
    return response.data;
};

export const createCategory = async (name, parent_id = null) => {
    return await axios.post('/categories', { name, parent_id });
};

export const updateCategory = async (id, name, parent_id = null) => {
    return await axios.put(`/categories/${id}`, { name, parent_id });
};

export const deleteCategory = async (id) => {
    return await axios.delete(`/categories/${id}`);
};
