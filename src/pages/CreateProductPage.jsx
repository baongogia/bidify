import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../services/categoryService';
import { createProduct } from '../services/productService';
import CustomSelect from '../components/CustomSelect';
import { parseAttributeLines } from '../utils/productAttributes';

const DURATION_PRESETS = [15, 60, 1440, 4320, 10080];

const CreateProductPage = () => {
    const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm({
        defaultValues: { duration_minutes: 1440 }
    });
    const durationWatch = watch('duration_minutes');
    const durationNum = durationWatch === '' || durationWatch == null
        ? NaN
        : Number(durationWatch);
    const isPresetDuration = Number.isFinite(durationNum) && DURATION_PRESETS.includes(durationNum);
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
                duration_minutes: parseInt(data.duration_minutes),
                start_time: data.start_time || undefined,
                buy_now_price: data.buy_now_price ? parseFloat(data.buy_now_price) : undefined,
                bid_increment: data.bid_increment ? parseFloat(data.bid_increment) : undefined,
                deposit_required: data.deposit_required ? parseFloat(data.deposit_required) : 0,
                location: data.location?.trim() || undefined,
                video_url: data.video_url?.trim() || undefined,
                attributes: parseAttributeLines(data.attributes_spec),
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
                            Thời lượng đấu giá <span className="text-red-500">*</span>
                        </label>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                            {[
                                { label: '15 phút', value: 15 },
                                { label: '1 giờ', value: 60 },
                                { label: '1 ngày', value: 1440 },
                                { label: '3 ngày', value: 4320 },
                                { label: '7 ngày', value: 10080 },
                                { label: 'Tùy chỉnh', value: 'custom' }
                            ].map((opt) => {
                                const isSelected =
                                    opt.value === 'custom'
                                        ? !isPresetDuration
                                        : isPresetDuration && durationNum === opt.value;

                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            if (opt.value !== 'custom') {
                                                setValue("duration_minutes", opt.value, {
                                                    shouldValidate: true,
                                                    shouldDirty: true,
                                                });
                                            } else {
                                                if (isPresetDuration) {
                                                    setValue("duration_minutes", 45, {
                                                        shouldValidate: true,
                                                        shouldDirty: true,
                                                    });
                                                }
                                            }
                                        }}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                                            isSelected 
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' 
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">
                                    Nhập số phút cụ thể
                                </label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        {...register("duration_minutes", { 
                                            required: "Vui lòng nhập thời gian",
                                            min: { value: 1, message: "Ít nhất 1 phút" },
                                            max: { value: 10080, message: "Tối đa 7 ngày (10080 phút)" }
                                        })} 
                                        placeholder="VD: 45"
                                        className="w-full pl-4 pr-12 py-3 bg-white border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition font-bold text-lg"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-blue-400">phút</span>
                                </div>
                                <p className="text-[11px] text-blue-500 mt-2 font-medium">
                                    {(() => {
                                        const m = Number.isFinite(durationNum) ? durationNum : 0;
                                        return `${Math.floor(m / 1440)} ngày ${Math.floor((m % 1440) / 60)} giờ ${m % 60} phút`;
                                    })()}
                                </p>
                            </div>
                        {errors.duration_minutes && <span className="text-xs text-red-500 mt-1 block font-medium">{errors.duration_minutes.message}</span>}
                    </div>

                    {/* Start Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Thời gian bắt đầu <span className="text-gray-500 font-normal">(Tuỳ chọn)</span>
                        </label>
                        <input 
                            type="datetime-local" 
                            {...register("start_time")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                        />
                        <p className="text-xs text-gray-500 mt-1">Nếu để trống, sản phẩm sẽ bắt đầu đấu giá ngay sau khi được Admin phê duyệt.</p>
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

                    <div className="border border-gray-200 rounded-2xl p-6 space-y-4 bg-gray-50/50">
                        <h3 className="text-sm font-bold text-gray-900">Thông tin đấu giá &amp; sản phẩm bổ sung</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Giá mua ngay (tuỳ chọn)</label>
                                <input type="number" {...register('buy_now_price', { min: 0 })} placeholder="VNĐ — để trống nếu không áp dụng" className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Bước giá tối thiểu (tuỳ chọn)</label>
                                <input type="number" {...register('bid_increment', { min: 0 })} placeholder="Để trống = theo bảng hệ thống" className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Tiền cọc tham gia (VNĐ)</label>
                                <input type="number" {...register('deposit_required', { min: 0 })} placeholder="0 = không yêu cầu" className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Vị trí / khu vực</label>
                                <input type="text" {...register('location')} placeholder="VD: Quận 1, TP.HCM" className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Link video (YouTube / URL)</label>
                            <input type="url" {...register('video_url')} placeholder="https://..." className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Thông số bổ sung (mỗi dòng: Nhãn: Giá trị)</label>
                            <textarea {...register('attributes_spec')} rows={4} placeholder={'Năm sản xuất: 2020\nMàu sắc: Đỏ\nODO: 15.000 km'} className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm font-mono" />
                        </div>
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
