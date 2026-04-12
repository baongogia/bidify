import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMyApplication } from '../services/sellerApplicationService';
import { AuthContext } from '../context/AuthContext';
import { Clock, CheckCircle, XCircle, Store, AlertCircle } from 'lucide-react';

const MySellerApplicationPage = () => {
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetchApplication();
    }, []);

    const fetchApplication = async () => {
        try {
            const res = await getMyApplication();
            if (res.success) {
                setApplication(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch application:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 bg-gray-50">
                <div className="max-w-md w-full bg-white p-8 border border-gray-200 rounded-2xl shadow-sm text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-gray-400" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có đơn đăng ký</h2>
                    <p className="text-gray-600 mb-6">Bạn chưa đăng ký trở thành người bán.</p>
                    <button 
                        onClick={() => navigate('/apply-seller')}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                    >
                        Đăng ký ngay
                    </button>
                </div>
            </div>
        );
    }

    const getStatusDisplay = (status) => {
        switch (status) {
            case 'PENDING':
                return {
                    icon: <Clock size={48} className="text-yellow-600" />,
                    color: 'yellow',
                    title: 'Đơn đang chờ duyệt',
                    message: 'Đơn đăng ký của bạn đang được admin xem xét. Thường mất từ 24-48 giờ.',
                    bgClass: 'bg-yellow-50 border-yellow-200',
                    textClass: 'text-yellow-800'
                };
            case 'APPROVED':
                return {
                    icon: <CheckCircle size={48} className="text-green-600" />,
                    color: 'green',
                    title: 'Đơn đã được phê duyệt',
                    message: 'Chúc mừng! Bạn đã trở thành người bán. Bạn có thể bắt đầu đăng bán sản phẩm ngay bây giờ.',
                    bgClass: 'bg-green-50 border-green-200',
                    textClass: 'text-green-800'
                };
            case 'REJECTED':
                return {
                    icon: <XCircle size={48} className="text-red-600" />,
                    color: 'red',
                    title: 'Đơn đã bị từ chối',
                    message: 'Rất tiếc, đơn đăng ký của bạn không được phê duyệt. Bạn có thể đăng ký lại.',
                    bgClass: 'bg-red-50 border-red-200',
                    textClass: 'text-red-800'
                };
            default:
                return null;
        }
    };

    const statusDisplay = getStatusDisplay(application.status);

    return (
        <div className="min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-3xl mx-auto">
                {/* Status Card */}
                <div className={`bg-white border-2 rounded-2xl p-8 mb-6 ${statusDisplay.bgClass}`}>
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-4">
                            {statusDisplay.icon}
                        </div>
                        <h1 className={`text-3xl font-bold mb-2 ${statusDisplay.textClass}`}>
                            {statusDisplay.title}
                        </h1>
                        <p className={`text-lg mb-6 ${statusDisplay.textClass}`}>
                            {statusDisplay.message}
                        </p>

                        {application.status === 'APPROVED' && (
                            <Link
                                to="/create-product"
                                className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition inline-flex items-center gap-2"
                            >
                                <Store size={20} />
                                Đăng bán sản phẩm ngay
                            </Link>
                        )}

                        {application.status === 'REJECTED' && (
                            <button
                                onClick={() => navigate('/apply-seller')}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                            >
                                Đăng ký lại
                            </button>
                        )}
                    </div>
                </div>

                {/* Application Details */}
                <div className="bg-white border border-gray-200 rounded-2xl p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin đơn đăng ký</h2>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Tên cửa hàng</p>
                                <p className="font-semibold text-gray-900">{application.shop_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                                <p className="font-semibold text-gray-900">{application.phone}</p>
                            </div>
                        </div>

                        {application.address && (
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                                <p className="font-semibold text-gray-900">{application.address}</p>
                            </div>
                        )}

                        {application.business_description && (
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Mô tả kinh doanh</p>
                                <p className="text-gray-900">{application.business_description}</p>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Ngày đăng ký</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(application.created_at).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                                {application.updated_at !== application.created_at && (
                                    <div>
                                        <p className="text-gray-500">Cập nhật lần cuối</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(application.updated_at).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Admin Note (if rejected) */}
                        {application.status === 'REJECTED' && application.admin_note && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl mt-4">
                                <p className="text-sm font-semibold text-red-800 mb-1">Lý do từ chối:</p>
                                <p className="text-sm text-red-700">{application.admin_note}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MySellerApplicationPage;
