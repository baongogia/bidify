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
    Filter,
    Search
} from 'lucide-react';
import { useModal } from '../context/ModalContext';
import CustomModal from '../components/Modal';

/* ──────────────────── Constants ──────────────────── */
const STATUS_TABS = [
    { key: 'PENDING', label: 'Chờ duyệt' },
    { key: 'NEEDS_EDIT', label: 'Cần sửa' },
    { key: 'REJECTED', label: 'Đã từ chối' },
    { key: 'APPROVED', label: 'Đã duyệt' }
];

const STATUS_BADGE = {
    PENDING: 'bg-amber-100 text-amber-700 border border-amber-200',
    NEEDS_EDIT: 'bg-orange-100 text-orange-700 border border-orange-200',
    REJECTED: 'bg-red-100 text-red-700 border border-red-200',
    APPROVED: 'bg-emerald-100 text-emerald-700 border border-emerald-200'
};

const fmt = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

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
            showToast(err.message || 'Không tải được danh sách', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, title) => {
        const confirmed = await showConfirm("Duyệt tin đăng", `Phê duyệt sản phẩm "${title}"?`);
        if (!confirmed) return;

        try {
            setActionLoading(id);
            await approveModerationProduct(id);
            showToast(`Đã duyệt: "${title}"`);
            await fetchProducts();
        } catch (err) {
            showAlert("Lỗi", err.message || 'Thao tác thất bại');
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
                showToast(`Đã từ chối: "${title}"`, 'error');
            } else {
                await requestEditModerationProduct(productId, reasonText.trim());
                showToast(`Yêu cầu sửa: "${title}"`, 'warning');
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

    const parseImages = (imgData) => {
        if (!imgData) return [];
        try {
            return typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
        } catch (e) {
            return [];
        }
    };

    return (
        <div className="bg-[#f0f2f5] min-h-full pb-20">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 py-8 px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#002B5B]">Kiểm duyệt tin đăng</h1>
                    <p className="text-gray-500 mt-1 text-sm">Quản lý và phê duyệt sản phẩm đấu giá mới.</p>
                </div>
                
                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                    {STATUS_TABS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setStatus(key)}
                            className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
                                status === key
                                    ? 'bg-white text-[#002B5B] shadow-sm border border-gray-200'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-8 mt-8 max-w-[1400px] mx-auto">
                {/* Search Bar */}
                <div className="mb-8 max-w-xl relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                        placeholder="Tìm theo ID, tên sản phẩm, seller..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-[#002B5B] outline-none transition-all shadow-sm text-sm"
                    />
                </div>

                {loading ? (
                    <div className="py-20 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>
                ) : products.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-lg border border-gray-200">
                         <p className="text-gray-500 text-sm italic">Không có tin đăng nào cần xử lý.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => {
                            const images = parseImages(product.images);
                            const mainImg = images[0] || 'https://via.placeholder.com/400x300?text=No+Image';
                            const price = Number(product.starting_price) || 0;

                            return (
                                <div key={product.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:border-blue-300 transition-all">
                                    {/* Image Section */}
                                    <div className="w-full h-48 bg-gray-50 border-b border-gray-100 relative">
                                        <img src={mainImg} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <Link to={`/products/${product.id}`} className="p-2 bg-white/90 backdrop-blur-sm text-gray-400 hover:text-[#002B5B] rounded shadow-sm transition" target="_blank">
                                                <ExternalLink size={14} />
                                            </Link>
                                        </div>
                                        <div className="absolute bottom-3 left-3">
                                            <span className={`text-[9px] font-bold px-2 py-1 rounded border shadow-sm ${STATUS_BADGE[product.moderation_status]}`}>
                                                {STATUS_TABS.find(t => t.key === product.moderation_status)?.label || product.moderation_status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="mb-1">
                                            <span className="text-[10px] font-bold text-gray-400">ID #{product.id}</span>
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900 mb-4 line-clamp-2 h-12 leading-tight">
                                            {product.title}
                                        </h3>
                                        
                                        <div className="space-y-4 mb-6 flex-1">
                                            <div className="flex justify-between items-end border-b border-gray-50 pb-3">
                                                <div>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Giá khởi điểm</p>
                                                    <p className="text-sm font-bold text-[#002B5B]">{fmt(price)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Người bán</p>
                                                    <p className="text-xs font-bold text-gray-700 truncate max-w-[120px]">{product.seller_name}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <User size={12} />
                                                <span className="text-[10px] font-medium truncate italic">{product.seller_email}</span>
                                            </div>
                                        </div>

                                        {/* Actions Row - Compact */}
                                        <div className="pt-4 border-t border-gray-100 grid grid-cols-1 gap-2">
                                            <button
                                                disabled={actionLoading === product.id}
                                                onClick={() => handleApprove(product.id, product.title)}
                                                className="w-full py-2.5 bg-emerald-600 text-white text-[11px] font-bold rounded hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={14} /> Phê duyệt tin
                                            </button>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    disabled={actionLoading === product.id}
                                                    onClick={() => openReasonModal(product.id, product.title, 'request-edit')}
                                                    className="py-2 bg-[#002B5B] text-white text-[11px] font-bold rounded hover:bg-[#001f40] transition disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    <Edit3 size={14} /> Sửa
                                                </button>
                                                <button
                                                    disabled={actionLoading === product.id}
                                                    onClick={() => openReasonModal(product.id, product.title, 'reject')}
                                                    className="py-2 bg-white border border-gray-300 text-gray-600 text-[11px] font-bold rounded hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    <XCircle size={14} /> Từ chối
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <CustomModal
                open={reasonModal.open}
                title={reasonModal.action === 'reject' ? `Lý do từ chối` : `Nội dung yêu cầu sửa`}
                onClose={() => { setReasonModal({ open: false, productId: null, title: '', action: '' }); setReasonText(''); }}
            >
                <div className="space-y-4 pt-4">
                    <p className="text-sm font-bold text-gray-700">Sản phẩm: {reasonModal.title}</p>
                    <textarea
                        value={reasonText}
                        onChange={(e) => setReasonText(e.target.value)}
                        rows={5}
                        placeholder="Nhập nội dung phản hồi cho người bán..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#002B5B] outline-none transition-all text-sm"
                    />
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => { setReasonModal({ open: false, productId: null, title: '', action: '' }); setReasonText(''); }}
                            className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-200"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleReasonConfirm}
                            disabled={!reasonText.trim() || actionLoading === reasonModal.productId}
                            className={`flex-1 py-3 text-white font-bold text-sm rounded-lg transition ${
                                reasonModal.action === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#002B5B] hover:bg-[#001f40]'
                            }`}
                        >
                            Gửi phản hồi
                        </button>
                    </div>
                </div>
            </CustomModal>

            {toast && (
                <div className={`fixed bottom-10 right-10 z-[100] px-6 py-4 rounded-lg shadow-xl animate-in slide-in-from-right-10 duration-500 border ${
                    toast.type === 'error' ? 'bg-white border-red-200 text-red-700' : 'bg-[#002B5B] border-[#002B5B] text-white'
                }`}>
                    <p className="text-sm font-bold">{toast.msg}</p>
                </div>
            )}
        </div>
    );
};

export default AdminModerationPage;
