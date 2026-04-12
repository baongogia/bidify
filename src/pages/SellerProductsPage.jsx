import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../services/categoryService';
import { deleteMyProduct, getMyProducts, updateMyProduct } from '../services/productService';

const SellerProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        title: '',
        category_id: '',
        condition_status: 'USED',
        starting_price: '',
        duration_hours: 24,
        description: '',
        images: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productRes, categoryRes] = await Promise.all([getMyProducts(), getCategories()]);
            if (productRes.success) {
                setProducts(productRes.data);
            }
            if (categoryRes.success) {
                setCategories(categoryRes.data);
            }
        } catch (err) {
            console.error('Failed to fetch seller products', err);
        } finally {
            setLoading(false);
        }
    };

    const isEditable = (p) => ['DRAFT', 'ACTIVE'].includes(p.status) && Number(p.total_bids) === 0;

    const startEdit = (product) => {
        setEditingId(product.id);
        setForm({
            title: product.title || '',
            category_id: product.category_id || '',
            condition_status: product.condition_status || 'USED',
            starting_price: product.starting_price || '',
            duration_hours: 24,
            description: product.description || '',
            images: Array.isArray(product.images) ? product.images.join('\n') : ''
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm({
            title: '',
            category_id: '',
            condition_status: 'USED',
            starting_price: '',
            duration_hours: 24,
            description: '',
            images: ''
        });
    };

    const submitEdit = async (id) => {
        try {
            const payload = {
                title: form.title,
                category_id: Number(form.category_id),
                condition_status: form.condition_status,
                starting_price: Number(form.starting_price),
                duration_hours: Number(form.duration_hours),
                description: form.description,
                images: form.images
                    .split(/[\n,]+/)
                    .map((item) => item.trim())
                    .filter(Boolean)
            };

            const res = await updateMyProduct(id, payload);
            if (res.success) {
                await fetchData();
                cancelEdit();
                alert('Cập nhật sản phẩm thành công');
            }
        } catch (err) {
            alert(err.message || 'Không thể cập nhật sản phẩm');
        }
    };

    const removeProduct = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa tin này?')) return;

        try {
            const res = await deleteMyProduct(id);
            if (res.success) {
                await fetchData();
                alert('Đã xóa sản phẩm');
            }
        } catch (err) {
            alert(err.message || 'Không thể xóa sản phẩm');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm của tôi</h1>
                        <p className="text-gray-600 mt-1">Sửa hoặc xóa tin khi chưa có người đặt giá</p>
                    </div>
                    <Link to="/create-product" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                        Tạo tin mới
                    </Link>
                </div>

                {products.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
                        Bạn chưa có sản phẩm nào.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {products.map((p) => (
                            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-5">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">{p.title}</h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Trạng thái: <span className="font-medium text-gray-700">{p.status}</span> | Lượt bid: <span className="font-medium text-gray-700">{p.total_bids}</span>
                                        </p>
                                        <p className="text-sm text-gray-500">Giá hiện tại: {Number(p.current_price).toLocaleString('vi-VN')} đ</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link to={`/products/${p.id}`} className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition">
                                            Xem
                                        </Link>
                                        <button
                                            onClick={() => startEdit(p)}
                                            disabled={!isEditable(p)}
                                            className="px-3 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => removeProduct(p.id)}
                                            disabled={!isEditable(p)}
                                            className="px-3 py-2 bg-red-600 rounded-lg text-sm font-medium text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>

                                {editingId === p.id && (
                                    <div className="mt-5 border-t border-gray-200 pt-5 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                                                <input
                                                    value={form.title}
                                                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                                                <select
                                                    value={form.category_id}
                                                    onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                >
                                                    <option value="">-- Chọn danh mục --</option>
                                                    {categories.map((c) => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng</label>
                                                <select
                                                    value={form.condition_status}
                                                    onChange={(e) => setForm((prev) => ({ ...prev, condition_status: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                >
                                                    <option value="NEW">Mới</option>
                                                    <option value="USED">Đã sử dụng</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Giá khởi điểm</label>
                                                <input
                                                    type="number"
                                                    value={form.starting_price}
                                                    onChange={(e) => setForm((prev) => ({ ...prev, starting_price: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Thời hạn (giờ)</label>
                                                <select
                                                    value={form.duration_hours}
                                                    onChange={(e) => setForm((prev) => ({ ...prev, duration_hours: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                >
                                                    <option value={24}>1 ngày</option>
                                                    <option value={72}>3 ngày</option>
                                                    <option value={168}>7 ngày</option>
                                                    <option value={240}>10 ngày</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                            <textarea
                                                rows={3}
                                                value={form.description}
                                                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh (mỗi dòng 1 URL, tối đa 12)</label>
                                            <textarea
                                                rows={3}
                                                value={form.images}
                                                onChange={(e) => setForm((prev) => ({ ...prev, images: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => submitEdit(p.id)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                                            >
                                                Lưu thay đổi
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerProductsPage;
