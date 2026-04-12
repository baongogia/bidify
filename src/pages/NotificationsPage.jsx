import React, { useEffect, useState } from 'react';
import { getMyNotifications, markNotificationRead } from '../services/notificationService';
import dayjs from 'dayjs';
import { Bell, CheckCircle } from 'lucide-react';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchData(page);
    }, [page]);

    const fetchData = async (p) => {
        setLoading(true);
        try {
            const res = await getMyNotifications(p, 10);
            if (res.success) {
                setNotifications(res.data);
                setTotalPages(res.pagination?.totalPages || 1);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-64px)] bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Bell className="text-blue-600" /> Thông báo
            </h1>
            
            {loading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
            ) : notifications.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-lg">Bạn chưa có thông báo nào.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <ul className="divide-y divide-gray-100">
                        {notifications.map(n => (
                            <li key={n.id} className={`p-4 sm:p-6 flex items-start gap-4 transition ${n.is_read ? 'bg-white opacity-70' : 'bg-blue-50/30'}`}>
                                <div className={`flex-shrink-0 mt-1 ${n.is_read ? 'text-gray-400' : 'text-blue-600'}`}>
                                    <Bell size={20} fill={!n.is_read ? 'currentColor' : 'none'} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start gap-4">
                                        <h3 className={`text-base font-semibold ${n.is_read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</h3>
                                        {!n.is_read && (
                                            <button 
                                                onClick={() => handleMarkRead(n.id)}
                                                className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-blue-100 transition"
                                            >
                                                <CheckCircle size={14} /> Đánh dấu đã đọc
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                                    <p className="text-xs text-gray-400 mt-3">{dayjs(n.created_at).format('DD/MM/YYYY HH:mm')}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white font-medium hover:bg-gray-50 disabled:opacity-50">Trước</button>
                            <span className="text-sm font-medium text-gray-500">Trang {page} / {totalPages}</span>
                            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white font-medium hover:bg-gray-50 disabled:opacity-50">Sau</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
