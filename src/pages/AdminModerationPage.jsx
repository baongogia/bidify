import React, { useEffect, useState } from 'react';
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
    Search,
    X,
    AlertTriangle,
    Clock,
    Tag,
    User
} from 'lucide-react';

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

/* ──────────────────── Modal ──────────────────── */
const Modal = ({ open, title, children, onClose }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                        <X size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

/* ──────────────────── Helpers ──────────────────── */
const fmt = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

/* ──────────────────── Page ──────────────────── */
const AdminModerationPage = () => {
    const [status, setStatus] = useState('PENDING');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    // Modals
    const [reasonModal, setReasonModal] = useState({ open: false, productId: null, title: '', action: '' }); // 'reject' | 'request-edit'
    const [reasonText, setReasonText] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, productId: null, title: '' });
    const [toast, setToast] = useState(null);

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
        try {
            setActionLoading(id);
            await approveModerationProduct(id);
            showToast(`Đã duyệt: "${title}"`);
            await fetchProducts();
        } catch (err) {
            showToast(err.message || 'Không duyệt được tin đăng', 'error');
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

    const handleDeleteConfirm = async () => {
        try {
            setActionLoading(deleteModal.productId);
            await deleteModerationProduct(deleteModal.productId);
            showToast(`Đã xóa: "${deleteModal.title}"`);
            setDeleteModal({ open: false, productId: null, title: '' });
            await fetchProducts();
        } catch (err) {
            showToast(err.message || 'Không xóa được tin đăng', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kiểm duyệt tin đăng</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Duyệt, từ chối, yêu cầu chỉnh sửa hoặc xóa tin đăng của người bán
                    </p>
                </div>

                {/* Status tabs + search */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {STATUS_TABS.map(({ key, label, color }) => (
                            <button
                                key={key}
                                onClick={() => setStatus(key)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                                    status === key
                                        ? `${color} text-white shadow-sm`
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                                placeholder="Tìm theo tiêu đề / người bán / email..."
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                        </div>
                        <button
                            onClick={fetchProducts}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Tìm
                        </button>
                    </div>
                </div>

                {/* Product list */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
                            Đang tải...
                        </div>
                    ) : products.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
                            Không có tin đăng nào ở trạng thái này
                        </div>
                    ) : (
                        products.map((product) => (
                            <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-5">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-2 flex-wrap mb-2">
                                            <h3 className="text-base font-bold text-gray-900 leading-tight">{product.title}</h3>
                                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_BADGE[product.moderation_status] || ''}`}>
                                                {STATUS_TABS.find(t => t.key === product.moderation_status)?.label || product.moderation_status}
                                            </span>
                                        </div>

                                        <div className="space-y-1 text-xs text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <User size={13} />
                                                <span>{product.seller_name} ({product.seller_email})</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Tag size={13} />
                                                <span>{product.category_name}</span>
                                                {product.starting_price && (
                                                    <span className="text-blue-600 font-semibold ml-2">
                                                        Giá khởi điểm: {fmt(product.starting_price)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={13} />
                                                <span>Đăng lúc: {new Date(product.created_at).toLocaleString('vi-VN')}</span>
                                            </div>
                                            {product.moderation_reason && (
                                                <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                                                    <p className="text-amber-800 text-xs font-medium">Lý do trước đó:</p>
                                                    <p className="text-amber-700 text-xs mt-0.5">{product.moderation_reason}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2 flex-shrink-0">
                                        <button
                                            disabled={actionLoading === product.id}
                                            onClick={() => handleApprove(product.id, product.title)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition disabled:opacity-50"
                                        >
                                            <CheckCircle size={14} />
                                            Duyệt
                                        </button>
                                        <button
                                            disabled={actionLoading === product.id}
                                            onClick={() => openReasonModal(product.id, product.title, 'request-edit')}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition disabled:opacity-50"
                                        >
                                            <Edit3 size={14} />
                                            Yêu cầu sửa
                                        </button>
                                        <button
                                            disabled={actionLoading === product.id}
                                            onClick={() => openReasonModal(product.id, product.title, 'reject')}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                                        >
                                            <XCircle size={14} />
                                            Từ chối
                                        </button>
                                        <button
                                            disabled={actionLoading === product.id}
                                            onClick={() => setDeleteModal({ open: true, productId: product.id, title: product.title })}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition disabled:opacity-50"
                                        >
                                            <Trash2 size={14} />
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Reason Modal (reject / request-edit) */}
            <Modal
                open={reasonModal.open}
                title={reasonModal.action === 'reject' ? `Từ chối tin đăng` : `Yêu cầu chỉnh sửa`}
                onClose={() => { setReasonModal({ open: false, productId: null, title: '', action: '' }); setReasonText(''); }}
            >
                <p className="text-sm text-gray-600 mb-1">
                    Tin đăng: <strong>{reasonModal.title}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-3">
                    {reasonModal.action === 'reject'
                        ? 'Nhập lý do từ chối. Người bán sẽ được thông báo.'
                        : 'Nhập nội dung yêu cầu chỉnh sửa. Người bán sẽ nhận được thông báo.'}
                </p>
                <textarea
                    value={reasonText}
                    onChange={(e) => setReasonText(e.target.value)}
                    rows={4}
                    placeholder={reasonModal.action === 'reject' ? 'Lý do từ chối...' : 'Nội dung cần chỉnh sửa...'}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                />
                <div className="flex gap-2 mt-4 justify-end">
                    <button
                        onClick={() => { setReasonModal({ open: false, productId: null, title: '', action: '' }); setReasonText(''); }}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleReasonConfirm}
                        disabled={!reasonText.trim() || actionLoading === reasonModal.productId}
                        className={`px-4 py-2 text-sm text-white rounded-lg transition disabled:opacity-50 ${
                            reasonModal.action === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'
                        }`}
                    >
                        {reasonModal.action === 'reject' ? 'Xác nhận từ chối' : 'Gửi yêu cầu'}
                    </button>
                </div>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal
                open={deleteModal.open}
                title="Xác nhận xóa tin đăng"
                onClose={() => setDeleteModal({ open: false, productId: null, title: '' })}
            >
                <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-gray-700">
                        Bạn có chắc muốn xóa tin đăng <strong>"{deleteModal.title}"</strong>? Hành động này không thể hoàn tác.
                    </p>
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => setDeleteModal({ open: false, productId: null, title: '' })}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleDeleteConfirm}
                        disabled={actionLoading === deleteModal.productId}
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                        Xóa tin đăng
                    </button>
                </div>
            </Modal>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
                    toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'
                }`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

export default AdminModerationPage;
