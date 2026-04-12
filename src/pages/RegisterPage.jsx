import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';

const RegisterPage = () => {
    const { register: formRegister, handleSubmit, formState: { errors } } = useForm();
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            setErrorMsg('');
            const res = await registerUser(data.name, data.email, data.password);
            if (res.success) {
                navigate('/login');
            }
        } catch (err) {
            setErrorMsg(err.message || 'Đăng ký thất bại');
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gray-50">
            {/* Background elements */}
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[100px] pointer-events-none"></div>

            <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-10 border border-white/50 rounded-3xl shadow-xl shadow-indigo-900/5 relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Tạo tài khoản<span className="text-indigo-600">.</span></h2>
                    <p className="mt-3 text-sm text-gray-500 font-medium">
                        Mở ra cơ hội sở hữu hàng chất lượng với giá không tưởng.
                    </p>
                </div>
                
                {errorMsg && (
                    <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        {errorMsg}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                        <input 
                            type="text" 
                            placeholder="Nguyễn Văn A"
                            {...formRegister("name", { required: "Họ và tên là bắt buộc" })} 
                            className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 font-medium text-gray-900"
                        />
                        {errors.name && <span className="text-xs text-red-500 mt-1.5 block font-medium">{errors.name.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ email</label>
                        <input 
                            type="email" 
                            placeholder="name@example.com"
                            {...formRegister("email", { 
                                required: "Email là bắt buộc",
                                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Định dạng email không hợp lệ" }
                            })} 
                            className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 font-medium text-gray-900"
                        />
                        {errors.email && <span className="text-xs text-red-500 mt-1.5 block font-medium">{errors.email.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            {...formRegister("password", { 
                                required: "Mật khẩu là bắt buộc",
                                minLength: { value: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
                            })} 
                            className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 font-medium text-gray-900"
                        />
                        {errors.password && <span className="text-xs text-red-500 mt-1.5 block font-medium">{errors.password.message}</span>}
                    </div>

                    <button type="submit" className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 mt-2">
                        Đăng ký ngay
                    </button>

                    <p className="mt-8 pt-4 text-center text-sm text-gray-600 font-medium">
                        Đã có tài khoản? <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 hover:underline transition">Đăng nhập</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
