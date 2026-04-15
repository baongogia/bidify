import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductDetail, getProducts } from '../services/productService';
import { placeBid } from '../services/bidService';
import { toggleWatchlist } from '../services/watchlistService';
import { AuthContext } from '../context/AuthContext';
import useAuctionSocket from '../hooks/useAuctionSocket';
import SkeletonDetail from '../components/SkeletonDetail';
import CountdownTimer from '../components/CountdownTimer';
import BidHistoryModal from '../components/BidHistoryModal';
import { Heart, User, ShieldCheck, Clock, ChevronRight, Minus, Plus, Trophy, PartyPopper, MapPin, Share2, Flag, Star, MessageCircle, ExternalLink } from 'lucide-react';
import { useModal } from '../context/ModalContext';

const formatDateTimeVi = (iso) => {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
        return String(iso);
    }
};

const resolveBidStep = (prod, price) => {
    if (prod?.bid_increment != null && Number(prod.bid_increment) > 0) {
        return Number(prod.bid_increment);
    }
    const p = Number(price);
    if (p < 1000000) return 50000;
    if (p < 5000000) return 100000;
    return 200000;
};

const toYoutubeEmbedUrl = (raw) => {
    if (!raw || !String(raw).trim()) return null;
    const s = String(raw).trim();
    try {
        const u = new URL(s);
        const host = u.hostname.replace(/^www\./, '');
        if (host === 'youtu.be') {
            const id = u.pathname.replace(/^\//, '').split('/')[0];
            return id ? `https://www.youtube.com/embed/${id}` : null;
        }
        if (host.includes('youtube.com')) {
            const v = u.searchParams.get('v');
            if (v) return `https://www.youtube.com/embed/${v}`;
            const m = u.pathname.match(/\/embed\/([^/]+)/);
            if (m) return `https://www.youtube.com/embed/${m[1]}`;
        }
    } catch {
        return null;
    }
    return null;
};

const ProductDetailPage = () => {
    const { showAlert } = useModal();
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useContext(AuthContext);
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState('');
    const [bidError, setBidError] = useState('');
    const [isBidding, setIsBidding] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [latestBid, setLatestBid] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showConfetti, setShowConfetti] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchDetail();
    }, [id]);

    useEffect(() => {
        if (!product?.category_id) return;
        (async () => {
            try {
                const res = await getProducts({
                    category_id: product.category_id,
                    limit: 16,
                    page: 1,
                    sort: 'ending_soon',
                });
                if (res.success) {
                    setRelatedProducts(
                        res.data.products
                            .filter((x) => String(x.id) !== String(id))
                            .slice(0, 8),
                    );
                }
            } catch {
                setRelatedProducts([]);
            }
        })();
    }, [product?.category_id, id]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await getProductDetail(id);
            if (res.success) {
                setProduct(res.data);
                setBidAmount(res.data.min_valid_bid);
            }
        } catch (error) {
            console.error(error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    useAuctionSocket(id, 
        (data) => {
            // new_bid
            setProduct((prev) => {
                if (!prev) return prev;
                const step = resolveBidStep(prev, data.amount);
                const nextMin = Number(data.amount) + step;
                setBidAmount(nextMin);
                return {
                    ...prev,
                    current_price: data.amount,
                    total_bids: prev.total_bids + 1,
                    min_valid_bid: nextMin,
                };
            });
            setLatestBid({
                id: Date.now(),
                bidder_name: data.bidder_name,
                amount: data.amount,
                created_at: data.timestamp
            });
        },
        (data) => {
            // auction_extended
            setProduct(prev => prev ? { ...prev, end_time: data.newEndTime } : prev);
        },
        (data) => {
            // auction_ended
            setProduct(prev => prev ? { 
                ...prev, 
                status: data.status,
                highest_bidder_id: data.winner_id,
                highest_bidder_name: data.winner_name
            } : prev);
            
            if (data.status === 'UNSOLD') {
                showAlert('Đã kết thúc', 'Phiên đấu giá đã khép lại mà không có người trả giá.');
            } else if (user && data.winner_id === user.id) {
                setShowConfetti(true);
                // Success modal with premium styling
                setTimeout(() => {
                    showAlert('Chúc mừng chiến thắng!', 'Bạn đã xuất sắc giành chiến thắng trong phiên đấu giá này! Vui lòng tiến hành thanh toán để nhận hàng.');
                }, 500);
            } else {
                showAlert('Đã kết thúc', `Phiên đấu giá đã khép lại. Người chiến thắng là ${data.winner_name || 'Người dùng ẩn danh'}.`);
            }
        }
    );

    const handleBid = async (e) => {
        e.preventDefault();
        setBidError('');
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setIsBidding(true);
        try {
            const res = await placeBid(id, bidAmount);
            if (res.success) {
                const placedAmount = Number(res.data.amount);
                const nextMinBid = placedAmount + resolveBidStep(product, placedAmount);

                // Update local UI immediately; socket will keep all clients in sync.
                setProduct(prev => prev ? {
                    ...prev,
                    current_price: placedAmount,
                    total_bids: (prev.total_bids || 0) + 1,
                    min_valid_bid: nextMinBid,
                    end_time: res.data.newEndTime || prev.end_time
                } : prev);

                setLatestBid({
                    id: Date.now(),
                    bidder_name: user?.name || 'Bạn',
                    amount: placedAmount,
                    created_at: new Date().toISOString()
                });
                setBidAmount(nextMinBid);
                showAlert('Thành công', 'Đặt giá thành công!');
            }
        } catch (err) {
            setBidError(err.message || 'Đặt giá thất bại');
        } finally {
            setIsBidding(false);
        }
    };

    const handleWatch = async () => {
        if (!isAuthenticated) return navigate('/login');
        try {
            const res = await toggleWatchlist(id);
            setProduct(prev => ({ ...prev, is_watchlisted: res.data.isWatchlisted }));
        } catch (e) {
            console.error(e);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: product?.title || 'Bidify', url });
            } else if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
                showAlert('Đã sao chép', 'Liên kết sản phẩm đã được sao chép.');
            }
        } catch (e) {
            if (e?.name !== 'AbortError') {
                showAlert('Chia sẻ', 'Không thể chia sẻ tự động. Hãy sao chép địa chỉ trên thanh trình duyệt.');
            }
        }
    };

    const handleReport = () => {
        showAlert(
            'Báo cáo tin đăng',
            `Vui lòng gửi yêu cầu tới bộ phận kiểm duyệt kèm mã tin #${id} và lý do. Chúng tôi sẽ xử lý trong 24–48 giờ.`,
        );
    };

    if (loading) return <SkeletonDetail />;
    if (!product) return null;

    const startMs = new Date(product.start_time).getTime();
    const endMs = new Date(product.end_time).getTime();
    const nowMs = currentTime.getTime();
    const isBeforeStart = startMs > nowMs;
    const isAfterEnd = endMs <= nowMs;

    const TERMINAL_STATUSES = [
        'ENDED_WAITING_PAYMENT',
        'COMPLETED',
        'UNSOLD',
        'CANCELLED',
    ];

    /** Đã kết thúc: trạng thái kết thúc thật, hoặc ACTIVE nhưng đã quá giờ end (chờ cron). Không coi PENDING là đã xong. */
    const isEnded =
        TERMINAL_STATUSES.includes(product.status) ||
        (product.status === 'ACTIVE' && isAfterEnd);

    /** Sắp bắt đầu: ACTIVE/PENDING và chưa tới start_time */
    const isNotStarted =
        ['ACTIVE', 'PENDING'].includes(product.status) && isBeforeStart;

    /** Đang trong cửa sổ phiên nhưng tin chờ duyệt */
    const isPendingApproval =
        product.status === 'PENDING' && !isBeforeStart && !isAfterEnd;
    const minBid = Number(product.min_valid_bid) || (Number(product.current_price) + resolveBidStep(product, product.current_price));
    const bidStep = resolveBidStep(product, product.current_price);

    const handleIncrement = () => {
        const val = Number(bidAmount) || minBid;
        setBidAmount(val + bidStep);
    };

    const handleDecrement = () => {
        const val = Number(bidAmount) || minBid;
        if (val - bidStep >= minBid) {
            setBidAmount(val - bidStep);
        } else {
            setBidAmount(minBid);
        }
    };

    // Provide default image if array is empty or undefined
    const images = (product.images && product.images.length > 0) 
        ? product.images 
        : ['https://via.placeholder.com/600x600?text=No+Image'];

    const attributeEntries =
        product.attributes &&
        typeof product.attributes === 'object' &&
        !Array.isArray(product.attributes)
            ? Object.entries(product.attributes)
            : [];
    const ytEmbed = toYoutubeEmbedUrl(product.video_url);
    const sellerSales = Number(product.seller_completed_sales) || 0;

    return (
        <div className="bg-white min-h-screen pb-12">
            {/* Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center text-sm text-gray-500">
                    <Link to="/" className="hover:text-blue-600 transition">Trang chủ</Link>
                    <ChevronRight size={14} className="mx-2 text-gray-400" />
                    <span className="text-gray-900 font-medium truncate">{product.title}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Left: Gallery (7 cols) */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="aspect-[4/3] bg-gray-100 rounded-3xl overflow-hidden border border-gray-200 flex items-center justify-center">
                            <img src={images[activeImageIndex]} alt="Sản phẩm" className="w-full h-full object-cover drop-shadow-sm" />
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                {images.map((img, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImageIndex === idx ? 'border-blue-600 ring-4 ring-blue-100' : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt={`Ảnh nhỏ ${idx}`} />
                                    </button>
                                ))}
                            </div>
                        )}

                        {attributeEntries.length > 0 && (
                            <div className="mt-10 pt-8 border-t border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900 mb-3">Thông số &amp; thuộc tính</h2>
                                <div className="rounded-xl border border-gray-200 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <tbody>
                                            {attributeEntries.map(([k, v]) => (
                                                <tr key={k} className="border-b border-gray-100 last:border-0">
                                                    <th className="text-left py-2.5 px-4 bg-gray-50 font-semibold text-gray-700 w-2/5 align-top">{k}</th>
                                                    <td className="py-2.5 px-4 text-gray-800 align-top">{String(v)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {ytEmbed && (
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900 mb-3">Video</h2>
                                <div className="aspect-video rounded-2xl overflow-hidden border border-gray-200 bg-black">
                                    <iframe title="Video sản phẩm" src={ytEmbed} className="w-full h-full" allowFullScreen />
                                </div>
                            </div>
                        )}
                        {!ytEmbed && product.video_url && (
                            <div className="mt-6">
                                <a
                                    href={product.video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
                                >
                                    <ExternalLink size={14} /> Mở liên kết video
                                </a>
                            </div>
                        )}

                        {/* Description — người bán tự viết */}
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả từ người bán</h2>
                            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                                {product.description || 'Chưa có mô tả cho sản phẩm này.'}
                            </div>
                        </div>
                    </div>

                    {/* Right: Info (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col pt-2 lg:pt-0">
                        <div className="flex justify-between items-start mb-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{product.title}</h1>
                            <button 
                                onClick={handleWatch}
                                className={`ml-4 p-2.5 rounded-full flex-shrink-0 transition-all ${product.is_watchlisted ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                            >
                                <Heart size={24} fill={product.is_watchlisted ? 'currentColor' : 'none'} />
                            </button>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-3">
                            <span className="font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{product.condition_status === 'NEW' ? 'Mới' : 'Đã qua sử dụng'}</span>
                            {product.category_name && (
                                <span className="text-gray-500">
                                    Danh mục: <strong className="text-gray-800">{product.category_name}</strong>
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700 mb-2">
                            <User size={14} className="text-gray-400" />
                            <span className="font-semibold text-gray-900">{product.seller_name}</span>
                            <span className="inline-flex items-center gap-0.5 text-amber-600 text-xs font-bold">
                                <Star size={12} className="fill-amber-500 text-amber-500" />
                                {sellerSales} giao dịch hoàn tất
                            </span>
                        </div>
                        {product.location && (
                            <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                                <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                                <span>{product.location}</span>
                            </div>
                        )}
                        <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-gray-200">
                            <button
                                type="button"
                                onClick={() =>
                                    showAlert(
                                        'Liên hệ người bán',
                                        'Kênh chat trực tiếp đang được triển khai. Bạn có thể dùng thông tin trong phần mô tả hoặc liên hệ hỗ trợ để được kết nối.',
                                    )
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-800 text-xs font-bold hover:bg-gray-200 transition"
                            >
                                <MessageCircle size={14} /> Nhắn người bán
                            </button>
                            <button
                                type="button"
                                onClick={handleShare}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                            >
                                <Share2 size={14} /> Chia sẻ
                            </button>
                            <button
                                type="button"
                                onClick={handleReport}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-100 text-xs font-bold text-red-700 hover:bg-red-50 transition"
                            >
                                <Flag size={14} /> Báo cáo
                            </button>
                        </div>

                        {/* Price Area */}
                        <div className="mb-8">
                            <div className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-1">Giá hiện tại</div>
                            <div className="text-5xl font-extrabold text-gray-900 tracking-tight">
                                {Number(product.current_price).toLocaleString('vi-VN')} <span className="text-2xl font-bold text-gray-500">đ</span>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                                <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                                    <div className="text-gray-500 font-semibold uppercase tracking-wide">Giá khởi điểm</div>
                                    <div className="font-bold text-gray-900">{Number(product.starting_price).toLocaleString('vi-VN')} đ</div>
                                </div>
                                <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                                    <div className="text-gray-500 font-semibold uppercase tracking-wide">Bước giá tối thiểu</div>
                                    <div className="font-bold text-gray-900">{bidStep.toLocaleString('vi-VN')} đ</div>
                                </div>
                                {product.buy_now_price != null && Number(product.buy_now_price) > 0 && (
                                    <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 col-span-2">
                                        <div className="text-emerald-700 font-semibold uppercase tracking-wide">Giá mua ngay (tham khảo)</div>
                                        <div className="font-bold text-emerald-900">{Number(product.buy_now_price).toLocaleString('vi-VN')} đ</div>
                                        <p className="text-[10px] text-emerald-800/90 mt-1 leading-snug">
                                            Có thể thỏa thuận với người bán; hệ thống vẫn ưu tiên đấu giá theo luật phiên.
                                        </p>
                                    </div>
                                )}
                                {Number(product.deposit_required) > 0 && (
                                    <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 col-span-2">
                                        <div className="text-amber-800 font-semibold uppercase tracking-wide">Cọc tham gia (theo tin đăng)</div>
                                        <div className="font-bold text-amber-900">{Number(product.deposit_required).toLocaleString('vi-VN')} đ</div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 text-xs text-gray-600 space-y-1.5 border border-gray-100 rounded-xl px-3 py-2.5 bg-white">
                                <div className="flex justify-between gap-2">
                                    <span>Bắt đầu phiên</span>
                                    <span className="font-medium text-gray-900 text-right">{formatDateTimeVi(product.start_time)}</span>
                                </div>
                                <div className="flex justify-between gap-2">
                                    <span>Kết thúc dự kiến</span>
                                    <span className="font-medium text-gray-900 text-right">{formatDateTimeVi(product.end_time)}</span>
                                </div>
                            </div>
                            
                            <div className="mt-4 flex items-center justify-between text-sm py-3 px-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className={isEnded ? 'text-gray-500' : 'text-blue-600'} />
                                    <span className="font-semibold text-gray-700">
                                        {isNotStarted ? 'Sẽ bắt đầu sau:' : 'Thời gian còn lại:'}
                                    </span>
                                </div>
                                <CountdownTimer 
                                    endTime={isNotStarted ? product.start_time : product.end_time} 
                                    forcedEnd={isEnded}
                                />
                            </div>

                            <button 
                                onClick={() => setIsHistoryModalOpen(true)}
                                className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition inline-flex items-center gap-1 cursor-pointer"
                            >
                                {product.total_bids} lượt đấu giá <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs ml-1">Xem lịch sử</span>
                            </button>
                        </div>

                        {/* Bidding Box */}
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
                            {isNotStarted ? (
                                <div className="text-center py-4">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3 text-blue-600">
                                        <Clock size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Sắp bắt đầu đấu giá</h3>
                                    <p className="text-gray-500 mt-1 mb-4">Phiên mở đặt giá lúc: <br /> <strong className="text-blue-700">{formatDateTimeVi(product.start_time)}</strong></p>
                                    <p className="text-xs text-gray-400">Đếm ngược phía trên tới thời điểm bắt đầu.</p>
                                </div>
                            ) : isPendingApproval ? (
                                <div className="text-center py-4">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-3 text-amber-600">
                                        <Clock size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Tin đang chờ phê duyệt</h3>
                                    <p className="text-gray-500 mt-1">Phiên chưa mở đặt giá cho tới khi được duyệt.</p>
                                </div>
                            ) : isEnded ? (
                                <div className="text-center py-4">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full mb-3 text-gray-500">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Phiên đấu giá đã kết thúc</h3>
                                    <p className="text-gray-500 mt-1 mb-4">Sản phẩm này không còn nhận đặt giá.</p>
                                    {['ENDED_WAITING_PAYMENT', 'COMPLETED'].includes(product.status) && (
                                        user?.id === product.highest_bidder_id ? (
                                            <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-left">
                                                <h4 className="text-green-800 font-bold mb-2">Xin chúc mừng! Bạn đã thắng phiên đấu giá này!</h4>
                                                
                                                {product.status === 'ENDED_WAITING_PAYMENT' ? (
                                                    <>
                                                        <p className="text-sm text-green-700 mb-4">Vui lòng tiến hành thanh toán để người bán giao hàng cho bạn.</p>
                                                        <button 
                                                            onClick={() => navigate(`/checkout/${product.id}`)}
                                                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-xl transition"
                                                        >
                                                            Thanh toán ngay
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="inline-block bg-green-200 text-green-800 px-4 py-2 rounded-lg font-bold text-sm">Đơn hàng đã được thanh toán</div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mt-4 text-left">
                                                <h4 className="text-blue-800 font-bold mb-2">Sản phẩm đã có chủ nhân</h4>
                                                <p className="text-sm text-blue-700">Người thắng cuộc: <strong>{product.highest_bidder_name || 'Người dùng ẩn danh'}</strong></p>
                                                <p className="text-sm text-blue-700 mt-1">Mức giá chốt: <strong>{Number(product.current_price).toLocaleString('vi-VN')} đ</strong></p>
                                            </div>
                                        )
                                    )}

                                    {product.status === 'UNSOLD' && (
                                        <div className="bg-red-50 border border-red-200 p-4 rounded-xl mt-4">
                                            <h4 className="text-red-800 font-bold mb-2">Đấu giá không thành công</h4>
                                            <p className="text-sm text-red-700">Sản phẩm này kết thúc mà không có người trả giá.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleBid}>
                                    <div className="mb-2 flex justify-between items-end">
                                        <label className="block text-sm font-bold text-gray-700">Số tiền bạn muốn đặt</label>
                                        <span className="text-xs text-gray-500 font-medium tracking-wide">Nhập từ {minBid.toLocaleString('vi-VN')} đ trở lên</span>
                                    </div>
                                    <div className="relative mb-4 flex items-center">
                                        <button 
                                            type="button"
                                            onClick={handleDecrement}
                                            className="absolute left-1.5 top-1.5 bottom-1.5 w-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg text-gray-600 transition z-10 cursor-pointer"
                                        >
                                            <Minus size={20} />
                                        </button>
                                        <input 
                                            type="number" 
                                            min={minBid}
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(e.target.value)}
                                            className="w-full text-center px-16 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition text-xl font-bold text-gray-900 hide-arrows"
                                            placeholder={minBid}
                                        />
                                        <button 
                                            type="button"
                                            onClick={handleIncrement}
                                            className="absolute right-1.5 top-1.5 bottom-1.5 w-12 flex items-center justify-center bg-blue-100 hover:bg-blue-200 active:bg-blue-300 rounded-lg text-blue-700 transition z-10 cursor-pointer"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                    {bidError && <div className="mb-4 text-sm text-red-600 font-medium">{bidError}</div>}
                                    
                                    <button 
                                        type="submit" 
                                        disabled={isBidding || user?.id === product.seller_id}
                                        className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(53,99,233,0.39)] hover:shadow-[0_6px_20px_rgba(53,99,233,0.23)] hover:-translate-y-0.5 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                                    >
                                        {isBidding ? 'Đang đặt giá...' : 'Đặt giá'}
                                    </button>
                                    
                                    {user?.id === product.seller_id && (
                                        <p className="mt-3 text-sm text-center text-red-500 font-medium">Bạn không thể tự đấu giá sản phẩm của mình.</p>
                                    )}
                                    <p className="mt-4 text-[11px] text-gray-500 text-center leading-relaxed px-4">
                                        Khi bấm Đặt giá, bạn cam kết mua sản phẩm nếu trở thành người thắng cuộc.
                                    </p>
                                </form>
                            )}
                        </div>
                        
                        {/* eBay Style Guarantees */}
                        <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><ShieldCheck size={18} className="text-green-600" /> Bảo vệ người mua</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Nhận đúng sản phẩm đã đặt hoặc được hoàn tiền. Cam kết bởi chính sách bảo đảm hoàn tiền của chúng tôi.
                            </p>
                        </div>
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <section className="mt-16 pt-12 border-t border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Sản phẩm cùng danh mục</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {relatedProducts.map((rp) => {
                                const thumb =
                                    Array.isArray(rp.images) && rp.images.length > 0
                                        ? rp.images[0]
                                        : 'https://via.placeholder.com/400x300?text=No+Image';
                                return (
                                    <Link
                                        key={rp.id}
                                        to={`/products/${rp.id}`}
                                        className="group rounded-xl border border-gray-200 overflow-hidden bg-white hover:shadow-md hover:border-gray-300 transition"
                                    >
                                        <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                                            <img src={thumb} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500" />
                                        </div>
                                        <div className="p-3">
                                            <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600">{rp.title}</p>
                                            <p className="text-sm font-bold text-gray-800 mt-1">
                                                {Number(rp.current_price).toLocaleString('vi-VN')} đ
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>

            <BidHistoryModal 
                productId={id} 
                isOpen={isHistoryModalOpen} 
                onClose={() => setIsHistoryModalOpen(false)} 
                totalBids={product.total_bids}
                latestBid={latestBid}
            />

            {/* Premium Celebration Overlay */}
            {showConfetti && (
                <div 
                    className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden"
                    onClick={() => setShowConfetti(false)}
                >
                    <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-[2px] animate-in fade-in duration-1000"></div>
                    
                    {/* CSS Confetti Particles */}
                    <div className="confetti-container">
                        {[...Array(50)].map((_, i) => (
                            <div 
                                key={i} 
                                className={`confetti-particle particle-${i % 5}`}
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 3}s`,
                                    animationDuration: `${2 + Math.random() * 2}s`,
                                    backgroundColor: ['#3B82F6', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6'][i % 5]
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative pointer-events-auto bg-white/90 backdrop-blur-xl p-10 rounded-[40px] shadow-2xl border border-white/50 flex flex-col items-center text-center max-w-sm mx-4 animate-in zoom-in-50 slide-in-from-bottom-20 duration-700">
                        <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30 animate-bounce">
                            <Trophy size={48} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight uppercase">Chiến Thắng!</h2>
                        <p className="text-gray-600 font-medium mb-8">Xin chúc mừng, bạn là người trả giá cao nhất cho sản phẩm này.</p>
                        <button 
                            onClick={() => {
                                setShowConfetti(false);
                                navigate(`/checkout/${product.id}`);
                            }}
                            className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2"
                        >
                            Thanh toán ngay <PartyPopper size={20} />
                        </button>
                    </div>
                    
                    <style dangerouslySetInnerHTML={{ __html: `
                        .confetti-container {
                            position: absolute;
                            top: -20px;
                            left: 0;
                            width: 100%;
                            height: 100%;
                        }
                        .confetti-particle {
                            position: absolute;
                            width: 10px;
                            height: 10px;
                            border-radius: 2px;
                            top: -10px;
                            animation: fall linear forwards;
                        }
                        @keyframes fall {
                            to {
                                transform: translateY(110vh) rotate(720deg);
                            }
                        }
                        .particle-0 { width: 8px; height: 12px; }
                        .particle-1 { width: 12px; height: 8px; border-radius: 50%; }
                        .particle-2 { width: 10px; height: 10px; transform: rotate(45deg); }
                    `}} />
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;
