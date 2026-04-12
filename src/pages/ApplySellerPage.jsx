import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getMyApplication, submitSellerApplication } from '../services/sellerApplicationService';
import { getCategories } from '../services/categoryService';
import { Store, Phone, MapPin, FileText, Clock, AlertCircle, Grid } from 'lucide-react';

const ApplySellerPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);
    const [currentApplication, setCurrentApplication] = useState(null);
    const [categories, setCategories] = useState([]);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCurrentApplication = async () => {
            try {
                const res = await getMyApplication();
                if (res.success && res.data) {
                    setCurrentApplication(res.data);
                }
            } catch (err) {
                console.error('Failed to fetch current seller application:', err);
            } finally {
                setIsCheckingStatus(false);
            }
        };

        const fetchCategoriesData = async () => {
            try {
                const res = await getCategories();
                if (res.success) {
                    setCategories(res.data);
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            }
        };

        fetchCurrentApplication();
        fetchCategoriesData();
    }, []);

    if (isCheckingStatus) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Check if user is already seller or has pending application
    if (user?.role === 'SELLER') {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 bg-gray-50">
                <div className="max-w-md w-full bg-white p-8 border border-gray-200 rounded-2xl shadow-sm text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Store className="text-green-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Bạn đã là người bán</h2>
                    <p className="text-gray-600 mb-6">Tài khoản của bạn đã được phê duyệt làm người bán.</p>
                    <button 
                        onClick={() => navigate('/create-product')}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                    >
                        Đăng bán sản phẩm
                    </button>
                </div>
            </div>
        );
    }

    if (currentApplication?.status === 'PENDING') {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 bg-gray-50">
                <div className="max-w-md w-full bg-white p-8 border-2 border-yellow-200 rounded-2xl shadow-sm text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="text-yellow-700" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-yellow-800 mb-2">Đơn đang chờ duyệt</h2>
                    <p className="text-yellow-700 mb-6">
                        Tài khoản của bạn đang trong quá trình đăng ký người bán. Vui lòng chờ admin phê duyệt.
                    </p>
                    <button
                        onClick={() => navigate('/my-seller-application')}
                        className="w-full bg-yellow-600 text-white py-3 rounded-xl font-semibold hover:bg-yellow-700 transition"
                    >
                        Xem chi tiết đơn
                    </button>
                </div>
            </div>
        );
    }

    if (currentApplication?.status === 'APPROVED') {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 bg-gray-50">
                <div className="max-w-md w-full bg-white p-8 border border-gray-200 rounded-2xl shadow-sm text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Store className="text-green-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Đơn đã được phê duyệt</h2>
                    <p className="text-gray-600 mb-6">Bạn đã trở thành người bán và có thể đăng sản phẩm.</p>
                    <button
                        onClick={() => navigate('/create-product')}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                    >
                        Đăng bán sản phẩm
                    </button>
                </div>
            </div>
        );
    }

    if (currentApplication?.status === 'REJECTED') {
        return (
            <div className="min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="text-red-600 mt-0.5" size={18} />
                        <p className="text-sm text-red-700">
                            Đơn trước của bạn đã bị từ chối. Bạn có thể cập nhật thông tin và gửi đăng ký lại.
                        </p>
                    </div>
                    <div className="bg-white p-8 border border-gray-200 rounded-2xl shadow-sm">
                        <div className="mb-8">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Store className="text-blue-600" size={32} />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight text-center">Đăng ký lại làm người bán</h2>
                            <p className="mt-2 text-sm text-gray-600 text-center">
                                Điền lại thông tin để gửi đơn đăng ký mới
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Store size={18} />
                                    Tên cửa hàng <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register('shop_name', { required: 'Tên cửa hàng là bắt buộc' })}
                                    placeholder="VD: Cửa hàng điện tử ABC"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                                />
                                {errors.shop_name && <span className="text-xs text-red-500 mt-1 block">{errors.shop_name.message}</span>}
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Phone size={18} />
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    {...register('phone', {
                                        required: 'Số điện thoại là bắt buộc',
                                        pattern: {
                                            value: /^[0-9]{10,11}$/,
                                            message: 'Số điện thoại không hợp lệ (10-11 số)'
                                        }
                                    })}
                                    placeholder="0901234567"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                                />
                                {errors.phone && <span className="text-xs text-red-500 mt-1 block">{errors.phone.message}</span>}
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <MapPin size={18} />
                                    Địa chỉ
                                </label>
                                <input
                                    type="text"
                                    {...register('address')}
                                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Grid size={18} />
                                    Ngành hàng chính <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('category_id', { required: 'Vui lòng chọn ngành hàng' })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                                >
                                    <option value="">-- Chọn ngành hàng --</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.category_id && <span className="text-xs text-red-500 mt-1 block">{errors.category_id.message}</span>}
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <FileText size={18} />
                                    Mô tả về hoạt động kinh doanh
                                </label>
                                <textarea
                                    {...register('business_description')}
                                    rows="4"
                                    placeholder="Mô tả ngắn gọn về loại sản phẩm bạn muốn bán, kinh nghiệm kinh doanh..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    const onSubmit = async (data) => {
        try {
            setErrorMsg('');
            setSuccessMsg('');
            setIsSubmitting(true);

            const res = await submitSellerApplication(data);
            
            if (res.success) {
                setSuccessMsg('Đơn đăng ký đã được gửi thành công! Vui lòng chờ admin phê duyệt.');
                setTimeout(() => {
                    navigate('/my-seller-application');
                }, 2000);
            }
        } catch (err) {
            setErrorMsg(err.message || 'Đăng ký thất bại');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-2xl mx-auto bg-white p-8 border border-gray-200 rounded-2xl shadow-sm">
                <div className="mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Store className="text-blue-600" size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight text-center">Đăng ký làm người bán</h2>
                    <p className="mt-2 text-sm text-gray-600 text-center">
                        Điền thông tin để trở thành người bán trên nền tảng của chúng tôi
                    </p>
                </div>
                
                {errorMsg && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm font-medium">
                        {successMsg}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {/* Shop Name */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Store size={18} />
                            Tên cửa hàng <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            {...register("shop_name", { required: "Tên cửa hàng là bắt buộc" })} 
                            placeholder="VD: Cửa hàng điện tử ABC"
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                        />
                        {errors.shop_name && <span className="text-xs text-red-500 mt-1 block">{errors.shop_name.message}</span>}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Phone size={18} />
                            Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="tel" 
                            {...register("phone", { 
                                required: "Số điện thoại là bắt buộc",
                                pattern: {
                                    value: /^[0-9]{10,11}$/,
                                    message: "Số điện thoại không hợp lệ (10-11 số)"
                                }
                            })} 
                            placeholder="0901234567"
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                        />
                        {errors.phone && <span className="text-xs text-red-500 mt-1 block">{errors.phone.message}</span>}
                    </div>

                    {/* Address */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <MapPin size={18} />
                            Địa chỉ
                        </label>
                        <input 
                            type="text" 
                            {...register("address")} 
                            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Grid size={18} />
                            Ngành hàng chính <span className="text-red-500">*</span>
                        </label>
                        <select 
                            {...register("category_id", { required: "Vui lòng chọn ngành hàng" })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                        >
                            <option value="">-- Chọn ngành hàng --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        {errors.category_id && <span className="text-xs text-red-500 mt-1 block">{errors.category_id.message}</span>}
                    </div>

                    {/* Business Description */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <FileText size={18} />
                            Mô tả về hoạt động kinh doanh
                        </label>
                        <textarea 
                            {...register("business_description")} 
                            rows="4"
                            placeholder="Mô tả ngắn gọn về loại sản phẩm bạn muốn bán, kinh nghiệm kinh doanh..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                        />
                    </div>

                    {/* Info Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Lưu ý:</strong> Đơn đăng ký của bạn sẽ được admin xem xét và phê duyệt trong vòng 24-48 giờ. 
                            Bạn sẽ nhận được thông báo khi đơn được xử lý.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => navigate('/')}
                            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplySellerPage;
