import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    approveModerationProduct,
    deleteModerationProduct,
    getModerationProducts,
    rejectModerationProduct,
    requestEditModerationProduct
} from '../services/adminService';
import {
    CheckCircle,
    XCircle,
    Edit3,
    Trash2,
    X,
    AlertTriangle,
    Clock,
    Tag,
    User,
    ExternalLink,
    Filter
} from 'lucide-react';
import { useModal } from '../context/ModalContext';
import CustomModal from '../components/Modal';

/* ──────────────────── Constants ──────────────────── */
const STATUS_TABS = [
    { key: 'PENDING', label: 'Chờ duyệt', color: 'bg-amber-500' },
    { key: 'NEEDS_EDIT', label: 'Cần chỉnh sửa', color: 'bg-orange-500' },
    { key: 'REJECTED', label: 'Đã từ chối', color: 'bg-red-500' },
    { key: 'APPROVED', label: 'Đã duyệt', color: 'bg-emerald-500' }
];

const STATUS_BADGE = {
    PENDING: 'bg-amber-100 text-amber-700 border border-amber-200',
    NEEDS_EDIT: 'bg-orange-100 text-orange-700 border border-orange-200',
    REJECTED: 'bg-red-100 text-red-700 border border-red-200',
    APPROVED: 'bg-emerald-100 text-emerald-700 border border-emerald-200'
};

const fmt = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

/* ──────────────────── Page ──────────────────── */
const AdminModerationPage = () => {
    const { showAlert, showConfirm } = useModal();
    const [status, setStatus] = useState('PENDING');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [toast, setToast] = useState(null);
    const [reasonModal, setReasonModal] = useState({ open: false, productId: null, title: '', action: '' });
    const [reasonText, setReasonText] = useState('');

    useEffect(() => { fetchProducts(); }, [status]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await getModerationProducts({ status, q: keyword });
            if (res.success) setProducts(res.data.products);
        } catch (err) {
            showToast(err.message || 'Không tải được danh sách kiểm duyệt', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, title) => {
        const confirmed = await showConfirm("Duyệt tin đăng", `Bạn có chắc muốn duyệt công khai sản phẩm "${title}"?`);
        if (!confirmed) return;

        try {
            setActionLoading(id);
            await approveModerationProduct(id);
            showAlert("Thành công", `Đã duyệt thành công: "${title}"`);
            await fetchProducts();
        } catch (err) {
            showAlert("Lỗi", err.message || 'Không duyệt được tin đăng');
        } finally {
            setActionLoading(null);
        }
    };

    const openReasonModal = (productId, title, action) => {
        setReasonText('');
        setReasonModal({ open: true, productId, title, action });
    };

    const handleReasonConfirm = async () => {
        if (!reasonText.trim()) return;
        const { productId, action, title } = reasonModal;
        try {
            setActionLoading(productId);
            if (action === 'reject') {
                await rejectModerationProduct(productId, reasonText.trim());
                showToast(`Đã từ chối: "${title}"`);
            } else {
                await requestEditModerationProduct(productId, reasonText.trim());
                showToast(`Đã gửi yêu cầu chỉnh sửa: "${title}"`);
            }
            setReasonModal({ open: false, productId: null, title: '', action: '' });
            setReasonText('');
            await fetchProducts();
        } catch (err) {
            showToast(err.message || 'Thao tác thất bại', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteConfirm = async (id, title) => {
        const confirmed = await showConfirm("Xác nhận xóa", `Bạn có chắc muốn xóa vĩnh viễn tin đăng "${title}"?`);
        if (!confirmed) return;

        try {
            setActionLoading(id);
            await deleteModerationProduct(id);
            showAlert("Thành công", `Đã xóa tin đăng: "${title}"`);
            await fetchProducts();
        } catch (err) {
            showAlert("Lỗi", err.message || 'Không xóa được tin đăng');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="bg-gray-50/50 min-h-screen py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Trung tâm Kiểm duyệt</h1>
                        <p className="text-gray-500 mt-2 font-medium">Bảo vệ cộng đồng bằng cách kiểm tra kỹ lưỡng mọi tin đăng</p>
                    </div>
                    
                    <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex gap-1">
                        {STATUS_TABS.map(({ key, label, color }) => (
                            <button
                                key={key}
                                onClick={() => setStatus(key)}
                                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                                    status === key
                                        ? `${color} text-white shadow-[0_4px_12px_-2px_rgba(0,0,0,0.2)]`
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-[24px] shadow-xl shadow-blue-900/5 ring-1 ring-gray-100 p-6">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Filter size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                            placeholder="Lọc theo tên sản phẩm, người bán hoặc nội dung..."
                            className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                        />
                        <button 
                            onClick={fetchProducts}
                            className="absolute right-2.5 top-2.5 bottom-2.5 px-6 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
                        >
                            Tìm kiếm
                        </button>
                    </div>
                </div>

                {/* Product list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 border-dashed">
                             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                             <p className="text-gray-400 font-medium">Đang truy vấn dữ liệu...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 border-dashed">
                             <Filter className="text-gray-300 mb-4" size={48} />
                             <p className="text-gray-400 font-medium">Hiện tại không có tin nào cần xử lý</p>
                        </div>
                    ) : (
                        products.map((product) => (
                            <div key={product.id} className="bg-white rounded-[24px] shadow-lg shadow-blue-900/5 ring-1 ring-gray-100 overflow-hidden flex flex-col group hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start gap-4 mb-4">
                                        <div className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border-2 ${STATUS_BADGE[product.moderation_status] || ''}`}>
                                            {STATUS_TABS.find(t => t.key === product.moderation_status)?.label || product.moderation_status}
                                        </div>
                                        <Link to={`/products/${product.id}`} className="text-gray-400 hover:text-blue-600 transition" target="_blank">
                                            <ExternalLink size={18} />
                                        </Link>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                        {product.title}
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400">
                                                <User size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-900 truncate">{product.seller_name}</p>
                                                <p className="text-[10px] text-gray-500 truncate">{product.seller_email}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-50">
                                                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter mb-1">Giá khởi điểm</p>
                                                <p className="text-sm font-black text-gray-900">{fmt(product.starting_price)}</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mb-1">Danh mục</p>
                                                <p className="text-sm font-black text-gray-900 truncate">{product.category_name}</p>
                                            </div>
                                        </div>
                                        
                                        {product.moderation_reason && (
                                            <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                                                <div className="flex items-center gap-2 mb-1 text-orange-700 font-bold text-[10px] uppercase">
                                                    <AlertTriangle size={12} /> Ghi chú từ chối
                                                </div>
                                                <p className="text-xs text-orange-800 leading-relaxed italic">"{product.moderation_reason}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50/50 border-t border-gray-100 grid grid-cols-2 gap-2 mt-auto">
                                    <button
                                        disabled={actionLoading === product.id}
                                        onClick={() => handleApprove(product.id, product.title)}
                                        className="col-span-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <CheckCircle size={16} /> Duyệt ngay
                                    </button>
                                    <button
                                        disabled={actionLoading === product.id}
                                        onClick={() => openReasonModal(product.id, product.title, 'request-edit')}
                                        className="py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 transition-all flex items-center justify-center gap-2 text-xs"
                                    >
                                        <Edit3 size={14} /> Yêu cầu sửa
                                    </button>
                                    <button
                                        disabled={actionLoading === product.id}
                                        onClick={() => openReasonModal(product.id, product.title, 'reject')}
                                        className="py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all flex items-center justify-center gap-2 text-xs"
                                    >
                                        <XCircle size={14} /> Từ chối
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Reason Modal (reject / request-edit) */}
            <CustomModal
                open={reasonModal.open}
                title={reasonModal.action === 'reject' ? `Từ chối tin đăng` : `Yêu cầu chỉnh sửa`}
                onClose={() => { setReasonModal({ open: false, productId: null, title: '', action: '' }); setReasonText(''); }}
            >
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Sản phẩm</p>
                        <p className="text-sm font-bold text-gray-900">{reasonModal.title}</p>
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                            {reasonModal.action === 'reject' ? 'Lý do từ chối' : 'Yêu cầu cụ thể'}
                        </label>
                        <textarea
                            value={reasonText}
                            onChange={(e) => setReasonText(e.target.value)}
                            rows={4}
                            placeholder={reasonModal.action === 'reject' ? 'VD: Hình ảnh không rõ nét, sai chuyên mục...' : 'VD: Cần bổ sung ảnh chụp mặt sau...'}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all text-sm font-medium resize-none shadow-inner"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => { setReasonModal({ open: false, productId: null, title: '', action: '' }); setReasonText(''); }}
                            className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={handleReasonConfirm}
                            disabled={!reasonText.trim() || actionLoading === reasonModal.productId}
                            className={`flex-1 py-3 text-white font-bold rounded-xl transition shadow-lg disabled:opacity-50 ${
                                reasonModal.action === 'reject' 
                                    ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' 
                                    : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
                            }`}
                        >
                            {reasonModal.action === 'reject' ? 'Xác nhận từ chối' : 'Gửi yêu cầu'}
                        </button>
                    </div>
                </div>
            </CustomModal>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-8 right-8 z-[100] px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 duration-500 border flex items-center gap-3 ${
                    toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-gray-900 border-gray-800 text-white'
                }`}>
                    {toast.type === 'error' && <AlertTriangle size={18} />}
                    <p className="text-sm font-bold">{toast.msg}</p>
                </div>
            )}
        </div>
    );
};

export default AdminModerationPage;
