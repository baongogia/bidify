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
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 border border-gray-200 rounded-2xl shadow-sm">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Chào mừng bạn quay lại</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Chưa có tài khoản? <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">Đăng ký ngay</Link>
                    </p>
                </div>
                
                {errorMsg && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                        {errorMsg}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ email</label>
                        <input 
                            type="email" 
                            {...register("email", { required: "Email là bắt buộc" })} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                        />
                        {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                        <input 
                            type="password" 
                            {...register("password", { required: "Mật khẩu là bắt buộc" })} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                        />
                        {errors.password && <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>}
                    </div>

                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
                        Đăng nhập
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
