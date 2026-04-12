import React, { useEffect, useState } from 'react';
import { getBidHistory } from '../services/bidService';
import dayjs from 'dayjs';
import { X } from 'lucide-react';

const BidHistoryModal = ({ productId, isOpen, onClose, totalBids, latestBid }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (isOpen && productId) {
            fetchHistory(1);
        }
    }, [isOpen, productId]);

    useEffect(() => {
        if (latestBid && page === 1 && isOpen) {
            setHistory(prev => {
                const exists = prev.some(b => Number(b.amount) === Number(latestBid.amount));
                if (exists) return prev;
                return [latestBid, ...prev].slice(0, 10);
            });
        }
    }, [latestBid, isOpen, page]);

    const fetchHistory = async (p) => {
        setLoading(true);
        try {
            const res = await getBidHistory(productId, p, 10);
            if (res.success) {
                setHistory(res.data.data);
                setTotalPages(res.data.pagination.totalPages || 1);
                setPage(p);
            }
        } catch (err) {
            console.error('Fetch history failed', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Lịch sử đấu giá</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-800 rounded-full hover:bg-gray-100 transition">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="mb-4 text-sm font-medium text-gray-500 flex justify-between">
                        <span>Tổng số lượt đấu giá: {totalBids}</span>
                        <span>* Tên người dùng được ẩn để bảo mật</span>
                    </div>
                    
                    {loading ? (
                        <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 border border-dashed rounded-xl">Chưa có lượt đấu giá nào</div>
                    ) : (
                        <div className="relative border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Người đấu giá</th>
                                        <th className="px-4 py-3 font-medium">Số tiền</th>
                                        <th className="px-4 py-3 font-medium text-right">Thời gian</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {history.map((bid) => (
                                        <tr key={bid.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 font-medium text-gray-700 font-mono">{bid.bidder_name}</td>
                                            <td className="px-4 py-3 font-bold text-gray-900">{Number(bid.amount).toLocaleString('vi-VN')} đ</td>
                                            <td className="px-4 py-3 text-right text-gray-500 text-xs">{dayjs(bid.created_at).format('DD/MM/YYYY HH:mm:ss')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-2xl">
                        <button 
                            disabled={page === 1} 
                            onClick={() => fetchHistory(page - 1)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
                        >
                            Trước
                        </button>
                        <span className="text-sm font-medium text-gray-500">Trang {page} / {totalPages}</span>
                        <button 
                            disabled={page === totalPages} 
                            onClick={() => fetchHistory(page + 1)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BidHistoryModal;
