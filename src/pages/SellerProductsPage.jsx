import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../services/categoryService';
import { deleteMyProduct, getMyProducts, updateMyProduct } from '../services/productService';
import dayjs from 'dayjs';
import CustomSelect from '../components/CustomSelect';
import { useModal } from '../context/ModalContext';
import { 
    Package, 
    Tag, 
    Clock, 
    Eye, 
    Edit3, 
    Trash2, 
    Plus, 
    Calendar,
    AlertCircle,
    ChevronRight,
    Image as ImageIcon,
    LayoutGrid,
    Timer
} from 'lucide-react';

const STATUS_CONFIG = {
    DRAFT: { label: 'Bản nháp', color: 'bg-gray-100 text-gray-600 border-gray-200' },
    PENDING: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700 border-amber-200 shadow-amber-100/50' },
    ACTIVE: { label: 'Đang đấu giá', color: 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-emerald-100/50' },
    ENDED_WAITING_PAYMENT: { label: 'Chờ thanh toán', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    COMPLETED: { label: 'Hoàn tất', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    UNSOLD: { label: 'Không thành công', color: 'bg-red-100 text-red-700 border-red-200' },
    REJECTED: { label: 'Bị từ chối', color: 'bg-orange-100 text-orange-700 border-orange-200' },
};

const SellerProductsPage = () => {
    const { showAlert, showConfirm } = useModal();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        title: '',
        category_id: '',
        condition_status: 'USED',
        starting_price: '',
        duration_minutes: 1440,
        start_time: '',
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

    const isEditable = (p) => ['DRAFT', 'PENDING', 'ACTIVE'].includes(p.status) && Number(p.total_bids) === 0;

    const startEdit = (product) => {
        const start = dayjs(product.start_time);
        const end = dayjs(product.end_time);
        const diffMinutes = end.diff(start, 'minute');

        setEditingId(product.id);
        setForm({
            title: product.title || '',
            category_id: product.category_id || '',
            condition_status: product.condition_status || 'USED',
            starting_price: product.starting_price || '',
            duration_minutes: diffMinutes || 1440,
            start_time: product.start_time ? dayjs(product.start_time).format('YYYY-MM-DDTHH:mm') : '',
            description: product.description || '',
            images: Array.isArray(product.images) ? product.images.join('\n') : ''
        });
        
        // Scroll to form with smooth offset
        setTimeout(() => {
            const element = document.getElementById(`edit-form-${product.id}`);
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const submitEdit = async (id) => {
        try {
            const payload = {
                title: form.title,
                category_id: Number(form.category_id),
                condition_status: form.condition_status,
                starting_price: Number(form.starting_price),
                duration_minutes: Number(form.duration_minutes),
                start_time: form.start_time || undefined,
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
                showAlert('Thành công', 'Cập nhật sản phẩm thành công');
            }
        } catch (err) {
            showAlert('Lỗi', err.message || 'Không thể cập nhật sản phẩm');
        }
    };

    const removeProduct = async (id) => {
        const confirmed = await showConfirm('Xác nhận xóa', 'Bạn có chắc muốn xóa tin đăng này? Thao tác này không thể hoàn tác.');
        if (!confirmed) return;

        try {
            const res = await deleteMyProduct(id);
            if (res.success) {
                await fetchData();
                showAlert('Thành công', 'Đã xóa sản phẩm');
            }
        } catch (err) {
            showAlert('Lỗi', err.message || 'Không thể xóa sản phẩm');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium animate-pulse">Đang tải dữ liệu của bạn...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-10 bg-gray-50/50">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
                             <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Kế hoạch bán hàng</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Quản lý sản phẩm</h1>
                        <p className="text-gray-500 mt-2 font-medium max-w-lg">Theo dõi, chỉnh sửa và quản lý các phiên đấu giá của bạn hiệu quả hơn với giao diện tập trung.</p>
                    </div>
                    <Link to="/create-product" className="group flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-lg font-bold shadow-2xl shadow-gray-900/20 hover:bg-black transition-all hover:-translate-y-1 active:scale-95">
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        Tạo tin mới
                    </Link>
                </div>

                {products.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-lg p-24 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300 mb-6">
                             <Package size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có sản phẩm nào</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mb-8">Bắt đầu đăng sản phẩm đầu tiên của bạn để tiếp cận hàng ngàn người mua.</p>
                        <Link to="/create-product" className="px-10 py-4 bg-blue-600 text-white rounded-lg font-black hover:bg-blue-700 transition shadow-xl shadow-blue-600/20">
                             Đăng tin ngay
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {products.map((p) => {
                            const statusInfo = STATUS_CONFIG[p.status] || { label: p.status, color: 'bg-gray-100 text-gray-500' };
                            const mainImage = (p.images && p.images.length > 0) ? p.images[0] : null;
                            const isCurrentlyEditing = editingId === p.id;
                            const hasBids = Number(p.total_bids) > 0;

                            return (
                                <div key={p.id} id={`product-card-${p.id}`} className={`bg-white rounded-lg overflow-hidden shadow-xl shadow-blue-900/5 ring-1 ring-gray-100 transition-all duration-500 ${isCurrentlyEditing ? 'ring-2 ring-blue-500 shadow-blue-500/10' : 'hover:shadow-2xl hover:shadow-blue-900/10'}`}>
                                    <div className="p-6 md:p-8">
                                        <div className="flex flex-col lg:flex-row gap-8">
                                            {/* Thumbnail */}
                                            <div className="w-full lg:w-48 h-48 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 relative group">
                                                {mainImage ? (
                                                    <img src={mainImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.title} />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                                        <ImageIcon size={32} strokeWidth={1.5} />
                                                        <span className="text-[10px] mt-2 font-black uppercase">No Image</span>
                                                    </div>
                                                )}
                                                <div className="absolute top-3 left-3">
                                                     <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border backdrop-blur-md ${statusInfo.color}`}>
                                                         {statusInfo.label}
                                                     </div>
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 space-y-6">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 opacity-60">
                                                            <Tag size={12} /> {p.category_name || 'Đang đấu giá'}
                                                        </div>
                                                        <h2 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition tracking-tight">
                                                            {p.title}
                                                        </h2>
                                                    </div>
                                                    
                                                    <div className="flex gap-2">
                                                        <Link to={`/products/${p.id}`} className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-100 transition active:scale-95">
                                                            <Eye size={18} /> <span className="hidden sm:inline">Xem</span>
                                                        </Link>
                                                        <button
                                                            onClick={() => isCurrentlyEditing ? cancelEdit() : startEdit(p)}
                                                            disabled={!isEditable(p)}
                                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition active:scale-95 ${isCurrentlyEditing ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'} disabled:opacity-30 disabled:grayscale`}
                                                        >
                                                            <Edit3 size={18} /> <span className="hidden sm:inline">Sửa</span>
                                                        </button>
                                                        <button
                                                            onClick={() => removeProduct(p.id)}
                                                            disabled={!isEditable(p)}
                                                            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition active:scale-95 disabled:opacity-30 disabled:grayscale"
                                                        >
                                                            <Trash2 size={18} /> <span className="hidden sm:inline">Xóa</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Giá hiện tại</p>
                                                        <p className="text-lg font-black text-gray-900">{Number(p.current_price).toLocaleString('vi-VN')} <span className="text-xs">₫</span></p>
                                                    </div>
                                                    <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lượt đặt giá</p>
                                                        <p className="text-lg font-black text-gray-900">{p.total_bids} <span className="text-xs font-medium text-gray-500">lượt</span></p>
                                                    </div>
                                                    <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-100 sm:col-span-2">
                                                        <div className="flex items-center gap-4">
                                                             <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-600 flex-shrink-0">
                                                                 <Calendar size={20} />
                                                             </div>
                                                             <div>
                                                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Thời điểm bắt đầu</p>
                                                                 <p className="text-sm font-bold text-gray-900">{dayjs(p.start_time).format('DD/MM/YYYY HH:mm')}</p>
                                                             </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {!isEditable(p) && hasBids && (
                                                    <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                                        <AlertCircle size={16} className="text-amber-600" />
                                                        <p className="text-xs font-semibold text-amber-800">Không thể sửa/xóa tin vì phiên đấu giá đã có người đặt giá.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Inline Edit Form */}
                                        {isCurrentlyEditing && (
                                            <div id={`edit-form-${p.id}`} className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                                    {/* Left Form */}
                                                    <div className="md:col-span-8 space-y-6">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
                                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tiêu đề sản phẩm</label>
                                                                <input
                                                                    value={form.title}
                                                                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-900"
                                                                    placeholder="VD: iPhone 15 Pro Max 256GB..."
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Danh mục</label>
                                                                <CustomSelect
                                                                    value={form.category_id}
                                                                    onChange={(val) => setForm((prev) => ({ ...prev, category_id: val }))}
                                                                    options={[
                                                                        { value: "", label: "-- Chọn danh mục --" },
                                                                        ...categories.map((c) => ({ value: c.id, label: c.name }))
                                                                    ]}
                                                                    className="h-[42px]"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Mô tả chi tiết</label>
                                                            <textarea
                                                                rows={4}
                                                                value={form.description}
                                                                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 resize-none"
                                                                placeholder="Mô tả kỹ tình trạng, xuất xứ, phụ kiện kèm theo..."
                                                            />
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Danh sách URL ảnh (Tối đa 12)</label>
                                                            <textarea
                                                                rows={3}
                                                                value={form.images}
                                                                onChange={(e) => setForm((prev) => ({ ...prev, images: e.target.value }))}
                                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 resize-none text-xs"
                                                                placeholder="Mỗi dòng là 1 đường dẫn ảnh..."
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Right Settings */}
                                                    <div className="md:col-span-4 space-y-6">
                                                        <div className="bg-gray-50/50 p-6 rounded-lg border border-gray-100 space-y-6">
                                                            <div className="space-y-3">
                                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                                     <ImageIcon size={14} /> Tình trạng
                                                                </label>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {['NEW', 'USED'].map(cond => (
                                                                        <button
                                                                            key={cond}
                                                                            type="button"
                                                                            onClick={() => setForm(prev => ({ ...prev, condition_status: cond }))}
                                                                            className={`py-2.5 rounded-lg text-sm font-bold border transition ${form.condition_status === cond ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-transparent border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                                                        >
                                                                            {cond === 'NEW' ? 'Mới' : 'Cũ'}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                                     <Tag size={14} /> Giá khởi điểm
                                                                </label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="number"
                                                                        value={form.starting_price}
                                                                        onChange={(e) => setForm((prev) => ({ ...prev, starting_price: e.target.value }))}
                                                                        className="w-full pl-4 pr-12 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-900"
                                                                    />
                                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₫</span>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                                     <Timer size={14} /> Thời lượng
                                                                </label>
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    {[
                                                                        { label: '15p', value: 15 },
                                                                        { label: '1h', value: 60 },
                                                                        { label: '1n', value: 1440 },
                                                                        { label: '3n', value: 4320 },
                                                                        { label: '7n', value: 10080 },
                                                                    ].map((opt) => (
                                                                        <button
                                                                            key={opt.value}
                                                                            type="button"
                                                                            onClick={() => setForm(prev => ({ ...prev, duration_minutes: opt.value }))}
                                                                            className={`py-2 rounded-lg text-xs font-bold border transition ${Number(form.duration_minutes) === opt.value ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                                                                        >
                                                                            {opt.label}
                                                                        </button>
                                                                    ))}
                                                                    <div className="relative">
                                                                         <input 
                                                                             type="number" 
                                                                             className="w-full h-full text-[10px] font-bold border border-gray-200 rounded-lg text-center focus:border-blue-500 outline-none"
                                                                             placeholder="..."
                                                                             value={[15, 60, 1440, 4320, 10080].includes(Number(form.duration_minutes)) ? '' : form.duration_minutes}
                                                                             onChange={(e) => setForm(prev => ({ ...prev, duration_minutes: e.target.value }))}
                                                                         />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                                     <Calendar size={14} /> Thời gian bắt đầu
                                                                </label>
                                                                <input
                                                                    type="datetime-local"
                                                                    value={form.start_time}
                                                                    onChange={(e) => setForm((prev) => ({ ...prev, start_time: e.target.value }))}
                                                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 text-sm"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-3 pt-2">
                                                            <button
                                                                onClick={() => submitEdit(p.id)}
                                                                className="flex-1 py-4 bg-gray-900 text-white rounded-lg font-black hover:bg-black transition shadow-xl shadow-gray-900/10 active:scale-95"
                                                            >
                                                                Lưu thay đổi
                                                            </button>
                                                            <button
                                                                onClick={cancelEdit}
                                                                className="px-6 py-4 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition active:scale-95"
                                                            >
                                                                Hủy
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerProductsPage;
