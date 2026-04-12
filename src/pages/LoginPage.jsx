import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../services/authService';

const LoginPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [errorMsg, setErrorMsg] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            setErrorMsg('');
            const res = await loginUser(data.email, data.password);
            if (res.success) {
                login(res.data.token, res.data.user);
                navigate('/');
            }
        } catch (err) {
            setErrorMsg(err.message || 'Đăng nhập thất bại');
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gray-50">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[100px] pointer-events-none"></div>

            <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-10 border border-white/50 rounded-3xl shadow-xl shadow-blue-900/5 relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Đăng nhập<span className="text-blue-600">.</span></h2>
                    <p className="mt-3 text-sm text-gray-500 font-medium">
                        Bước vào không gian mua sắm kịch tính của Bidify.
                    </p>
                </div>
                
                {errorMsg && (
                    <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        {errorMsg}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ email</label>
                        <input 
                            type="email" 
                            placeholder="name@example.com"
                            {...register("email", { required: "Email là bắt buộc" })} 
                            className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder-gray-400 font-medium text-gray-900"
                        />
                        {errors.email && <span className="text-xs text-red-500 mt-1.5 block font-medium">{errors.email.message}</span>}
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-semibold text-gray-700">Mật khẩu</label>
                            <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-500 transition">Quên mật khẩu?</a>
                        </div>
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            {...register("password", { required: "Mật khẩu là bắt buộc" })} 
                            className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder-gray-400 font-medium text-gray-900"
                        />
                        {errors.password && <span className="text-xs text-red-500 mt-1.5 block font-medium">{errors.password.message}</span>}
                    </div>

                    <button type="submit" className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300">
                        Đăng nhập vào hệ thống
                    </button>
                    
                    <p className="mt-8 text-center text-sm text-gray-600 font-medium">
                        Chưa có tài khoản? <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500 hover:underline transition">Đăng ký ngay</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
