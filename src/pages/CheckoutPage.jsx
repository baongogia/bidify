import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductDetail, confirmPayment } from '../services/productService';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, MapPin, CreditCard, ShieldCheck } from 'lucide-react';

const CheckoutPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [shippingData, setShippingData] = useState({
        fullName: user?.name || '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await getProductDetail(id);
            if (res.success) {
                // Ensure only the winner can access this page
                if (res.data.status !== 'ENDED_WAITING_PAYMENT' || res.data.highest_bidder_id !== user?.id) {
                    navigate('/');
                    return;
                }
                setProduct(res.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải thông tin sản phẩm:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingData(prev => ({ ...prev, [name]: value }));
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        
        if (!shippingData.fullName || !shippingData.phone || !shippingData.address) {
            alert('Vui lòng điền đầy đủ thông tin giao hàng!');
            return;
        }

        setIsSubmitting(true);
        try {
            // Giả lập xử lý thanh toán (Mock Checkout)
            // Trong thực tế sẽ gọi API Stripe/VNPay ở đây
            const res = await confirmPayment(id, shippingData);
            
            if (res.success) {
                alert('Thanh toán thành công! Người bán sẽ sớm liên hệ giao hàng cho bạn.');
                navigate('/');
            }
        } catch (err) {
            alert(err.message || 'Thanh toán thất bại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!product) return null;

    const mainImage = (product.images && product.images.length > 0) ? product.images[0] : 'https://via.placeholder.com/300';

    return (
        <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Thanh toán đơn hàng</h1>
                    <p className="mt-2 text-gray-600">Hoàn tất thủ tục thanh toán cho phiên đấu giá bạn đã trúng</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Shipping Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <MapPin className="text-blue-600" /> Thông tin giao hàng
                            </h2>
                            <form className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                        <input 
                                            type="text" 
                                            name="fullName"
                                            value={shippingData.fullName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                                            placeholder="Tên người nhận"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                        <input 
                                            type="tel" 
                                            name="phone"
                                            value={shippingData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                                            placeholder="Số điện thoại"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ nhận hàng</label>
                                    <textarea 
                                        name="address"
                                        rows="3"
                                        value={shippingData.address}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition resize-none"
                                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                    ></textarea>
                                </div>
                            </form>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <CreditCard className="text-blue-600" /> Phương thức thanh toán
                            </h2>
                            <div className="space-y-3">
                                <div className="border border-blue-600 bg-blue-50 p-4 rounded-xl flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full border-4 border-blue-600 bg-white"></div>
                                        <span className="font-semibold text-gray-900">Thanh toán chuyển khoản (Thử nghiệm)</span>
                                    </div>
                                    <CheckCircle className="text-blue-600" />
                                </div>
                                <div className="border border-gray-200 p-4 rounded-xl flex items-center justify-between opacity-50 cursor-not-allowed">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full border border-gray-300 bg-gray-100"></div>
                                        <span className="font-medium text-gray-600">Thanh toán VNPay (Đang bảo trì)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">Tóm tắt đơn hàng</h2>
                            
                            <div className="flex gap-4 mb-6">
                                <div className="w-20 h-20 rounded-xl bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden">
                                    <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">{product.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1">Hàng {product.condition_status === 'NEW' ? 'mới' : 'đã qua sử dụng'}</p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-gray-600 mb-6 border-b border-gray-100 pb-6">
                                <div className="flex justify-between">
                                    <span>Giá trúng thầu</span>
                                    <span className="font-semibold text-gray-900">{Number(product.current_price).toLocaleString('vi-VN')} đ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Phí giao dịch</span>
                                    <span className="font-semibold text-gray-900">0 đ</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-6">
                                <span className="font-bold text-gray-900">Tổng cộng</span>
                                <span className="text-2xl font-extrabold text-blue-600">{Number(product.current_price).toLocaleString('vi-VN')} đ</span>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isSubmitting}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(53,99,233,0.39)] hover:shadow-[0_6px_20px_rgba(53,99,233,0.23)] hover:-translate-y-0.5 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                            >
                                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                            </button>
                            
                            <div className="mt-4 flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
                                <ShieldCheck className="text-green-600 flex-shrink-0" size={18} />
                                <p className="text-xs text-green-700 leading-tight">Cam kết bảo mật thông tin. Bạn sẽ được hoàn tiền nếu người bán không giao hàng.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
