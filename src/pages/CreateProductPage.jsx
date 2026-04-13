import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../services/categoryService';
import { createProduct } from '../services/productService';
import CustomSelect from '../components/CustomSelect';

const CreateProductPage = () => {
    const { register, handleSubmit, control, formState: { errors } } = useForm();
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getCategories();
                if (res.success) {
                    setCategories(res.data);
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            }
        };
        fetchCategories();
    }, []);

    const onSubmit = async (data) => {
        try {
            setErrorMsg('');
            setSuccessMsg('');
            setIsSubmitting(true);

            // Process images - split by comma or newline
            const imageUrls = data.images ? 
                data.images.split(/[\n,]+/).map(url => url.trim()).filter(url => url) : 
                [];

            const productData = {
                category_id: parseInt(data.category_id),
                title: data.title,
                description: data.description,
                condition_status: data.condition_status,
                starting_price: parseFloat(data.starting_price),
                images: imageUrls,
                duration_hours: parseInt(data.duration_hours)
            };

            const res = await createProduct(productData);
            
            if (res.success) {
                setSuccessMsg('Tin đăng đã được gửi và đang chờ Admin kiểm duyệt.');
                setTimeout(() => {
                    navigate(`/products/${res.data.id}`);
                }, 1500);
            }
        } catch (err) {
            setErrorMsg(err.message || 'Đăng sản phẩm thất bại');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-3xl mx-auto bg-white p-8 border border-gray-200 rounded-2xl shadow-sm">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Đăng bán sản phẩm</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Điền thông tin sản phẩm của bạn để bắt đầu đấu giá
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
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tiêu đề sản phẩm <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            {...register("title", { required: "Tiêu đề là bắt buộc" })} 
                            placeholder="VD: iPhone 13 Pro Max 256GB"
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                        />
                        {errors.title && <span className="text-xs text-red-500 mt-1 block">{errors.title.message}</span>}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Danh mục <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="category_id"
                            control={control}
                            rules={{ required: "Danh mục là bắt buộc" }}
                            render={({ field }) => (
                                <CustomSelect
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    options={[
                                        { value: "", label: "-- Chọn danh mục --" },
                                        ...categories.map(cat => ({ value: cat.id, label: cat.name }))
                                    ]}
                                    error={errors.category_id}
                                />
                            )}
                        />
                        {errors.category_id && <span className="text-xs text-red-500 mt-1 block">{errors.category_id.message}</span>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả sản phẩm
                        </label>
                        <textarea 
                            {...register("description")} 
                            rows="4"
                            placeholder="Mô tả chi tiết về tình trạng, tính năng..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                        />
                    </div>

                    {/* Condition */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tình trạng <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input 
                                    type="radio" 
                                    value="NEW" 
                                    {...register("condition_status", { required: true })}
                                    className="mr-2"
                                />
                                <span className="text-sm">Mới</span>
                            </label>
                            <label className="flex items-center">
                                <input 
                                    type="radio" 
                                    value="USED" 
                                    {...register("condition_status", { required: true })}
                                    defaultChecked
                                    className="mr-2"
                                />
                                <span className="text-sm">Đã sử dụng</span>
                            </label>
                        </div>
                    </div>

                    {/* Starting Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giá khởi điểm (VNĐ) <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="number" 
                            {...register("starting_price", { 
                                required: "Giá khởi điểm là bắt buộc",
                                min: { value: 1000, message: "Giá tối thiểu 1,000 VNĐ" }
                            })} 
                            placeholder="1000000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                        />
                        {errors.starting_price && <span className="text-xs text-red-500 mt-1 block">{errors.starting_price.message}</span>}
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Thời gian đấu giá (giờ) <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="duration_hours"
                            control={control}
                            rules={{ required: "Thời gian là bắt buộc" }}
                            render={({ field }) => (
                                <CustomSelect
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    options={[
                                        { value: "", label: "-- Chọn thời gian --" },
                                        { value: "24", label: "24 giờ (1 ngày)" },
                                        { value: "48", label: "48 giờ (2 ngày)" },
                                        { value: "72", label: "72 giờ (3 ngày)" },
                                        { value: "120", label: "120 giờ (5 ngày)" },
                                        { value: "168", label: "168 giờ (7 ngày)" }
                                    ]}
                                    error={errors.duration_hours}
                                />
                            )}
                        />
                        {errors.duration_hours && <span className="text-xs text-red-500 mt-1 block">{errors.duration_hours.message}</span>}
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hình ảnh (URL)
                        </label>
                        <textarea 
                            {...register("images")} 
                            rows="3"
                            placeholder="Nhập URL hình ảnh (mỗi dòng một URL hoặc phân cách bằng dấu phẩy)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">VD: https://example.com/image1.jpg</p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Đang đăng...' : 'Đăng bán ngay'}
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

export default CreateProductPage;
