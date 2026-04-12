import React, { useEffect, useState } from 'react';
import { getAllApplications, approveApplication, rejectApplication } from '../services/sellerApplicationService';
import { CheckCircle, XCircle, Clock, User, Store, Phone, MapPin, FileText } from 'lucide-react';

const AdminSellerApplicationsPage = () => {
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
        if (!confirm('Bạn có chắc muốn phê duyệt đơn này?')) return;
        
        try {
            setActionLoading(id);
            const res = await approveApplication(id);
            if (res.success) {
                alert('Đã phê duyệt thành công!');
                fetchApplications();
            }
        } catch (err) {
            alert(err.message || 'Lỗi khi phê duyệt');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        if (!rejectNote.trim()) {
            alert('Vui lòng nhập lý do từ chối');
            return;
        }

        try {
            setActionLoading(id);
            const res = await rejectApplication(id, rejectNote);
            if (res.success) {
                alert('Đã từ chối đơn');
                setRejectingId(null);
                setRejectNote('');
                fetchApplications();
            }
        } catch (err) {
            alert(err.message || 'Lỗi khi từ chối');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            APPROVED: 'bg-green-100 text-green-800 border-green-200',
            REJECTED: 'bg-red-100 text-red-800 border-red-200'
        };
        const icons = {
            PENDING: <Clock size={14} />,
            APPROVED: <CheckCircle size={14} />,
            REJECTED: <XCircle size={14} />
        };
        const labels = {
            PENDING: 'Đang chờ',
            APPROVED: 'Đã duyệt',
            REJECTED: 'Đã từ chối'
        };

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
                {icons[status]}
                {labels[status]}
            </span>
        );
    };

    return (
        <div className="min-h-[calc(100vh-64px)] py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý đơn đăng ký người bán</h1>
                    <p className="text-gray-600">Xem xét và phê duyệt các đơn đăng ký trở thành người bán</p>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-xl border border-gray-200 mb-6">
                    <div className="flex gap-2 p-2">
                        {['PENDING', 'APPROVED', 'REJECTED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition ${
                                    filter === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {status === 'PENDING' && 'Đang chờ'}
                                {status === 'APPROVED' && 'Đã duyệt'}
                                {status === 'REJECTED' && 'Đã từ chối'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Applications List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <p className="text-gray-500">Không có đơn đăng ký nào</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map(app => (
                            <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{app.shop_name}</h3>
                                            {getStatusBadge(app.status)}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Đăng ký bởi: <span className="font-medium text-gray-700">{app.user_name}</span> ({app.user_email})
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(app.created_at).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-start gap-2">
                                        <Phone size={18} className="text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500">Số điện thoại</p>
                                            <p className="text-sm font-medium text-gray-900">{app.phone}</p>
                                        </div>
                                    </div>

                                    {app.address && (
                                        <div className="flex items-start gap-2">
                                            <MapPin size={18} className="text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-500">Địa chỉ</p>
                                                <p className="text-sm font-medium text-gray-900">{app.address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {app.business_description && (
                                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <FileText size={18} className="text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Mô tả kinh doanh</p>
                                                <p className="text-sm text-gray-700">{app.business_description}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {app.admin_note && (
                                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-xs text-red-600 font-semibold mb-1">Ghi chú từ Admin:</p>
                                        <p className="text-sm text-red-800">{app.admin_note}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {app.status === 'PENDING' && (
                                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                                        {rejectingId === app.id ? (
                                            <div className="flex-1">
                                                <textarea
                                                    value={rejectNote}
                                                    onChange={(e) => setRejectNote(e.target.value)}
                                                    placeholder="Nhập lý do từ chối..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
                                                    rows="2"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleReject(app.id)}
                                                        disabled={actionLoading === app.id}
                                                        className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                                                    >
                                                        Xác nhận từ chối
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setRejectingId(null);
                                                            setRejectNote('');
                                                        }}
                                                        className="px-4 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(app.id)}
                                                    disabled={actionLoading === app.id}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                                                >
                                                    <CheckCircle size={18} />
                                                    Phê duyệt
                                                </button>
                                                <button
                                                    onClick={() => setRejectingId(app.id)}
                                                    disabled={actionLoading === app.id}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                                                >
                                                    <XCircle size={18} />
                                                    Từ chối
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSellerApplicationsPage;
