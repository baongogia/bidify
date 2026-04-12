import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyWatchlist, toggleWatchlist } from '../services/watchlistService';
import CountdownTimer from '../components/CountdownTimer';
import { HeartOff } from 'lucide-react';

const WatchlistPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchData(page);
    }, [page]);

    const fetchData = async (p) => {
        setLoading(true);
        try {
            const res = await getMyWatchlist(p, 10);
            if (res.success) {
                const listData = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
                const paging = res.pagination || res.data?.pagination;

                setItems(listData);
                setTotalPages(paging?.totalPages || 1);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        try {
            await toggleWatchlist(productId);
            // Re-fetch or remove from state locally
            setItems(prev => prev.filter(item => item.id !== productId));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-64px)] bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Danh sách theo dõi</h1>
            
            {loading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
            ) : items.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-lg mb-4">Bạn chưa theo dõi sản phẩm nào.</p>
                    <Link to="/" className="text-blue-600 font-medium hover:underline">Bắt đầu khám phá đấu giá</Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <ul className="divide-y divide-gray-100">
                        {items.map(item => {
                            let itemImages = [];
                            try {
                                if (typeof item.images === 'string') itemImages = JSON.parse(item.images);
                                else if (Array.isArray(item.images)) itemImages = item.images;
                            } catch(e){}

                            return (
                                <li key={item.watchlist_id} className="relative hover:bg-gray-50 transition">
                                    <Link to={`/products/${item.id}`} className="flex flex-col sm:flex-row gap-6 p-4 sm:p-6">
                                        <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                                            <img src={itemImages[0] || 'https://via.placeholder.com/150'} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <span className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition line-clamp-2 pr-4">
                                                        {item.title}
                                                    </span>
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(item.id); }}
                                                        className="text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-full flex-shrink-0"
                                                        title="Xóa khỏi danh sách theo dõi"
                                                    >
                                                        <HeartOff size={20} />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">Giá hiện tại: <span className="font-bold text-gray-900">{Number(item.current_price).toLocaleString('vi-VN')} đ</span></p>
                                            </div>
                                            <div className="mt-4 flex items-center gap-4">
                                                {item.status === 'ACTIVE' ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                        Còn lại: <span className="ml-1"><CountdownTimer endTime={item.end_time} /></span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                        Đã kết thúc
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                            <button 
                                disabled={page === 1} 
                                onClick={() => setPage(p => p - 1)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white font-medium hover:bg-gray-50 disabled:opacity-50"
                            >
                                Trước
                            </button>
                            <span className="text-sm font-medium text-gray-500">Trang {page} / {totalPages}</span>
                            <button 
                                disabled={page === totalPages} 
                                onClick={() => setPage(p => p + 1)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white font-medium hover:bg-gray-50 disabled:opacity-50"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WatchlistPage;
