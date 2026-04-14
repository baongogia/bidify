import React, { useEffect, useState } from 'react';
import { getAllApplications, approveApplication, rejectApplication } from '../services/sellerApplicationService';
import { CheckCircle, XCircle, Clock, User, Store, Phone, MapPin, FileText } from 'lucide-react';
import { useModal } from '../context/ModalContext';

const AdminSellerApplicationsPage = () => {
    const { showAlert, showConfirm } = useModal();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');
    const [actionLoading, setActionLoading] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectNote, setRejectNote] = useState('');

    useEffect(() => {
        fetchApplications();
    }, [filter]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const res = await getAllApplications(filter);
            if (res.success) {
                setApplications(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch applications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        const confirmed = await showConfirm('Xác nhận phê duyệt', 'Cấp quyền Người bán cho tài khoản này?');
        if (!confirmed) return;
        
        try {
            setActionLoading(id);
            const res = await approveApplication(id);
            if (res.success) {
                showAlert('Thành công', 'Đã phê duyệt!');
                fetchApplications();
            }
        } catch (err) {
            showAlert('Lỗi', err.message || 'Lỗi thao tác');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        if (!rejectNote.trim()) {
            showAlert('Lỗi', 'Vui lòng nhập lý do từ chối.');
            return;
        }

        try {
            setActionLoading(id);
            const res = await rejectApplication(id, rejectNote);
            if (res.success) {
                showAlert('Đã từ chối', 'Đã lưu phản hồi.');
                setRejectingId(null);
                setRejectNote('');
                fetchApplications();
            }
        } catch (err) {
            showAlert('Lỗi', err.message || 'Lỗi thao tác');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            PENDING: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700 border-amber-200' },
            APPROVED: { label: 'Đã duyệt', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
            REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-700 border-red-200' }
        };
        return configs[status] || configs.PENDING;
    };

    return (
        <div className="bg-[#f0f2f5] min-h-full pb-20">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 py-8 px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#002B5B]">Duyệt đơn người bán</h1>
                    <p className="text-gray-500 mt-1 text-sm">Xác thực yêu cầu nâng cấp tài khoản bán hàng.</p>
                </div>
                
                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                    {['PENDING', 'APPROVED', 'REJECTED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
                                filter === status
                                    ? 'bg-white text-[#002B5B] shadow-sm border border-gray-200'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {status === 'PENDING' && 'Đang chờ'}
                            {status === 'APPROVED' && 'Đã duyệt'}
                            {status === 'REJECTED' && 'Từ chối'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-8 mt-8 max-w-[1400px] mx-auto">
                {loading ? (
                    <div className="py-20 text-center text-gray-400 text-sm">Đang tải hồ sơ...</div>
                ) : applications.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-lg border border-gray-200">
                         <p className="text-gray-500 text-sm italic">Không có yêu cầu nào.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {applications.map(app => {
                            const config = getStatusConfig(app.status);
                            return (
                                <div key={app.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col p-6 hover:border-blue-300 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-blue-50 p-3 rounded-lg text-[#002B5B]">
                                            <Store size={24} />
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${config.color}`}>
                                            {config.label}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{app.shop_name}</h3>
                                    <div className="text-sm text-gray-500 mb-6 font-medium">
                                        <p>{app.user_name}</p>
                                        <p className="text-xs text-gray-400">{app.user_email}</p>
                                    </div>

                                    <div className="space-y-3 mb-6 flex-1">
                                        <div className="flex items-center gap-3 text-sm text-gray-700">
                                            <Phone size={14} className="text-gray-400" />
                                            <span>{app.phone}</span>
                                        </div>
                                        {app.address && (
                                            <div className="flex items-start gap-3 text-sm text-gray-700">
                                                <MapPin size={14} className="text-gray-400 mt-0.5" />
                                                <span className="line-clamp-2">{app.address}</span>
                                            </div>
                                        )}
                                        {app.business_description && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-100 text-xs text-gray-600 leading-relaxed italic line-clamp-3">
                                                "{app.business_description}"
                                            </div>
                                        )}
                                    </div>

                                    {app.status === 'PENDING' && (
                                        <div className="pt-4 border-t border-gray-100">
                                            {rejectingId === app.id ? (
                                                <div className="space-y-3">
                                                    <textarea
                                                        value={rejectNote}
                                                        onChange={(e) => setRejectNote(e.target.value)}
                                                        placeholder="Lý do từ chối..."
                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm placeholder:italic"
                                                        rows="2"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleReject(app.id)}
                                                            className="flex-1 py-2 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition"
                                                        >
                                                            Gửi từ chối
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectingId(null)}
                                                            className="px-4 py-2 bg-gray-100 text-gray-500 text-xs font-bold rounded"
                                                        >
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleApprove(app.id)}
                                                        className="flex-1 py-2 bg-[#002B5B] text-white text-xs font-bold rounded hover:bg-[#001f40] transition flex items-center justify-center gap-2"
                                                    >
                                                        <CheckCircle size={14} /> Duyệt hồ sơ
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectingId(app.id)}
                                                        className="px-4 py-2 border border-gray-300 text-gray-500 text-xs font-bold rounded hover:bg-gray-50 transition"
                                                    >
                                                        <XCircle size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    <div className="mt-4 pt-4 border-t border-gray-50 text-[10px] text-gray-400 font-bold uppercase text-center">
                                        Nộp ngày {new Date(app.created_at).toLocaleDateString('vi-VN')}
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

export default AdminSellerApplicationsPage;
