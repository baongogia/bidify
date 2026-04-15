import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    deleteModerationProduct,
    dismissReviewProduct,
    getModerationProducts,
} from '../services/adminService';
import {
    Trash2,
    ExternalLink,
    Search,
    ShieldAlert,
    User,
    CheckCircle,
    Ban,
} from 'lucide-react';
import { useModal } from '../context/ModalContext';
import CustomModal from '../components/Modal';

const fmt = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const parseImages = (imgData) => {
    if (!imgData) return [];
    try {
        return typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
    } catch {
        return [];
    }
};

const parseAutoFlag = (raw) => {
    if (!raw) return [];
    try {
        const o = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (o && Array.isArray(o.reasons)) return o.reasons;
    } catch {
        return [];
    }
    return [];
};

const AdminModerationPage = () => {
    const { showAlert, showConfirm } = useModal();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [toast, setToast] = useState(null);
    const [penalizeModal, setPenalizeModal] = useState({
        open: false,
        productId: null,
        title: '',
    });
    const [penalizeReason, setPenalizeReason] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await getModerationProducts({ q: keyword });
            if (res.success) setProducts(res.data.products);
        } catch (err) {
            showToast(err.message || 'Không tải được danh sách', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = async (id, title) => {
        const ok = await showConfirm(
            'Bỏ cờ kiểm tra',
            `Xác nhận tin "${title}" không vi phạm và gỡ khỏi hàng đợi?`,
        );
        if (!ok) return;
        try {
            setActionLoading(id);
            await dismissReviewProduct(id);
            showToast(`Đã bỏ cờ: "${title}"`);
            await fetchProducts();
        } catch (err) {
            showAlert('Lỗi', err.message || 'Thao tác thất bại');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemove = async (id, title) => {
        const ok = await showConfirm(
            'Gỡ bài đăng',
            `Gỡ tin "${title}" khỏi sàn? Người bán vẫn dùng tài khoản bình thường.`,
        );
        if (!ok) return;
        try {
            setActionLoading(id);
            await deleteModerationProduct(id);
            showToast(`Đã gỡ bài: "${title}"`);
            await fetchProducts();
        } catch (err) {
            showAlert('Lỗi', err.message || 'Thao tác thất bại');
        } finally {
            setActionLoading(null);
        }
    };

    const openPenalize = (productId, title) => {
        setPenalizeReason('');
        setPenalizeModal({ open: true, productId, title });
    };

    const confirmPenalize = async () => {
        if (!penalizeReason.trim()) return;
        const { productId, title } = penalizeModal;
        try {
            setActionLoading(productId);
            await deleteModerationProduct(productId, {
                penalize: true,
                reason: penalizeReason.trim(),
            });
            setPenalizeModal({ open: false, productId: null, title: '' });
            setPenalizeReason('');
            showToast(`Đã gỡ bài và khóa tài khoản người bán: "${title}"`, 'error');
            await fetchProducts();
        } catch (err) {
            showToast(err.message || 'Thao tác thất bại', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="bg-[#f0f2f5] min-h-full pb-20">
            <div className="bg-white border-b border-gray-200 py-8 px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#002B5B]">Vi phạm &amp; báo cáo</h1>
                    <p className="text-gray-500 mt-1 text-sm max-w-xl">
                        Chỉ các tin bị hệ thống đánh cờ (từ khóa / ảnh) hoặc được người dùng báo cáo mới hiển thị ở đây.
                        Tin mới lên sàn ngay, không cần duyệt tay trước.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs font-semibold">
                    <ShieldAlert size={16} />
                    Hàng đợi kiểm tra
                </div>
            </div>

            <div className="px-8 mt-8 max-w-[1400px] mx-auto">
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
                        <p className="text-gray-500 text-sm italic">Không có tin nào cần admin xử lý.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => {
                            const images = parseImages(product.images);
                            const mainImg = images[0] || 'https://via.placeholder.com/400x300?text=No+Image';
                            const price = Number(product.starting_price) || 0;
                            const autoReasons = parseAutoFlag(product.auto_flag_reason);
                            const hasAuto = autoReasons.length > 0;
                            const reportCount = Number(product.report_count) || 0;

                            return (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:border-blue-300 transition-all"
                                >
                                    <div className="w-full h-48 bg-gray-50 border-b border-gray-100 relative">
                                        <img src={mainImg} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <Link
                                                to={`/products/${product.id}`}
                                                className="p-2 bg-white/90 backdrop-blur-sm text-gray-400 hover:text-[#002B5B] rounded shadow-sm transition"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <ExternalLink size={14} />
                                            </Link>
                                        </div>
                                        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                                            {hasAuto && (
                                                <span className="text-[9px] font-bold px-2 py-1 rounded border shadow-sm bg-amber-100 text-amber-800 border-amber-200">
                                                    Cờ tự động
                                                </span>
                                            )}
                                            {reportCount > 0 && (
                                                <span className="text-[9px] font-bold px-2 py-1 rounded border shadow-sm bg-red-100 text-red-800 border-red-200">
                                                    Báo cáo: {reportCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-5 flex flex-col flex-1">
                                        <span className="text-[10px] font-bold text-gray-400">ID #{product.id}</span>
                                        <h3 className="text-base font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3rem] leading-tight">
                                            {product.title}
                                        </h3>

                                        {hasAuto && (
                                            <div className="mb-3 text-[10px] text-amber-900 bg-amber-50 border border-amber-100 rounded-lg px-2 py-2 space-y-1">
                                                <p className="font-bold uppercase tracking-wide">Lý do hệ thống</p>
                                                <ul className="list-disc pl-4 space-y-0.5">
                                                    {autoReasons.map((r) => (
                                                        <li key={r}>{r}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="space-y-3 mb-4 flex-1 border-b border-gray-50 pb-3">
                                            <div className="flex justify-between items-end">
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

                                        <div className="grid grid-cols-1 gap-2 pt-2">
                                            <button
                                                type="button"
                                                disabled={actionLoading === product.id}
                                                onClick={() => handleDismiss(product.id, product.title)}
                                                className="w-full py-2.5 bg-emerald-600 text-white text-[11px] font-bold rounded hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={14} /> Bỏ cờ (đã kiểm tra)
                                            </button>
                                            <button
                                                type="button"
                                                disabled={actionLoading === product.id}
                                                onClick={() => handleRemove(product.id, product.title)}
                                                className="w-full py-2.5 bg-white border border-gray-300 text-gray-800 text-[11px] font-bold rounded hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <Trash2 size={14} /> Gỡ bài
                                            </button>
                                            <button
                                                type="button"
                                                disabled={actionLoading === product.id}
                                                onClick={() => openPenalize(product.id, product.title)}
                                                className="w-full py-2.5 bg-red-600 text-white text-[11px] font-bold rounded hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <Ban size={14} /> Gỡ bài &amp; khóa tài khoản
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <CustomModal
                open={penalizeModal.open}
                title="Gỡ bài và khóa người bán"
                onClose={() => {
                    setPenalizeModal({ open: false, productId: null, title: '' });
                    setPenalizeReason('');
                }}
            >
                <div className="space-y-4 pt-2">
                    <p className="text-sm font-bold text-gray-700">Sản phẩm: {penalizeModal.title}</p>
                    <p className="text-xs text-gray-500">
                        Nhập lý do vi phạm. Tài khoản người bán sẽ bị khóa theo chính sách nền tảng.
                    </p>
                    <textarea
                        value={penalizeReason}
                        onChange={(e) => setPenalizeReason(e.target.value)}
                        rows={4}
                        placeholder="Lý do gỡ bài và khóa tài khoản..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#002B5B] outline-none transition-all text-sm"
                    />
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setPenalizeModal({ open: false, productId: null, title: '' });
                                setPenalizeReason('');
                            }}
                            className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-200"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={confirmPenalize}
                            disabled={!penalizeReason.trim() || actionLoading === penalizeModal.productId}
                            className="flex-1 py-3 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            </CustomModal>

            {toast && (
                <div
                    className={`fixed bottom-10 right-10 z-[100] px-6 py-4 rounded-lg shadow-xl animate-in slide-in-from-right-10 duration-500 border ${
                        toast.type === 'error'
                            ? 'bg-white border-red-200 text-red-700'
                            : 'bg-[#002B5B] border-[#002B5B] text-white'
                    }`}
                >
                    <p className="text-sm font-bold">{toast.msg}</p>
                </div>
            )}
        </div>
    );
};

export default AdminModerationPage;
