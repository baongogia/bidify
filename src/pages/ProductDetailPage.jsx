import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductDetail } from '../services/productService';
import { placeBid } from '../services/bidService';
import { toggleWatchlist } from '../services/watchlistService';
import { AuthContext } from '../context/AuthContext';
import useAuctionSocket from '../hooks/useAuctionSocket';
import SkeletonDetail from '../components/SkeletonDetail';
import CountdownTimer from '../components/CountdownTimer';
import BidHistoryModal from '../components/BidHistoryModal';
import { Heart, Tag, User, ShieldCheck, Clock, ChevronRight, Minus, Plus } from 'lucide-react';
import { useModal } from '../context/ModalContext';

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

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchDetail();
    }, [id]);

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
            setProduct(prev => prev ? {
                ...prev,
                current_price: data.amount,
                total_bids: prev.total_bids + 1,
                min_valid_bid: Number(data.amount) + getBidStep(data.amount)
            } : prev);
            // Optionally update bidAmount input if user hasn't typed
            setBidAmount(Number(data.amount) + getBidStep(data.amount));
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
        }
    );

    const getBidStep = (price) => {
        const p = Number(price);
        if (p < 1000000) return 50000;
        if (p < 5000000) return 100000;
        return 200000;
    };

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
                const nextMinBid = placedAmount + getBidStep(placedAmount);

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

    if (loading) return <SkeletonDetail />;
    if (!product) return null;

    const isEnded = product.status !== 'ACTIVE' || new Date(product.end_time) <= currentTime;
    const minBid = Number(product.min_valid_bid) || (Number(product.current_price) + 10000);
    const bidStep = Math.max(minBid - Number(product.current_price), 10000);

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

                        {/* Description */}
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả</h2>
                            <div className="prose max-w-none text-gray-700">
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
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                            <span className="font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{product.condition_status === 'NEW' ? 'Mới' : 'Đã qua sử dụng'}</span>
                            <span className="flex items-center gap-1.5"><User size={14} className="text-gray-400" /> Người bán: <span className="text-blue-600 hover:underline cursor-pointer font-medium">{product.seller_name}</span></span>
                        </div>

                        {/* Price Area */}
                        <div className="mb-8">
                            <div className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-1">Giá hiện tại</div>
                            <div className="text-5xl font-extrabold text-gray-900 tracking-tight">
                                {Number(product.current_price).toLocaleString('vi-VN')} <span className="text-2xl font-bold text-gray-500">đ</span>
                            </div>
                            
                            <div className="mt-4 flex items-center justify-between text-sm py-3 px-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className={isEnded ? 'text-gray-500' : 'text-blue-600'} />
                                    <span className="font-semibold text-gray-700">Thời gian còn lại:</span>
                                </div>
                                <CountdownTimer endTime={product.end_time} />
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
                            {isEnded ? (
                                <div className="text-center py-4">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full mb-3 text-gray-500">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Phiên đấu giá đã kết thúc</h3>
                                    <p className="text-gray-500 mt-1 mb-4">Sản phẩm này không còn nhận đặt giá.</p>
                                    {['ENDED_WAITING_PAYMENT', 'COMPLETED'].includes(product.status) && (
                                        user?.id === product.highest_bidder_id ? (
                                            <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-left">
                                                <h4 className="text-green-800 font-bold mb-2">🎉 Xin chúc mừng! Bạn đã thắng phiên đấu giá này!</h4>
                                                
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
            </div>

            <BidHistoryModal 
                productId={id} 
                isOpen={isHistoryModalOpen} 
                onClose={() => setIsHistoryModalOpen(false)} 
                totalBids={product.total_bids}
                latestBid={latestBid}
            />
        </div>
    );
};

export default ProductDetailPage;
