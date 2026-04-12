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
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 border border-gray-200 rounded-2xl shadow-sm">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Tạo tài khoản mới</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Đã có tài khoản? <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">Đăng nhập</Link>
                    </p>
                </div>
                
                {errorMsg && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                        {errorMsg}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                        <input 
                            type="text" 
                            {...formRegister("name", { required: "Họ và tên là bắt buộc" })} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                        />
                        {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ email</label>
                        <input 
                            type="email" 
                            {...formRegister("email", { 
                                required: "Email là bắt buộc",
                                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Định dạng email không hợp lệ" }
                            })} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                        />
                        {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                        <input 
                            type="password" 
                            {...formRegister("password", { 
                                required: "Mật khẩu là bắt buộc",
                                minLength: { value: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
                            })} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                        />
                        {errors.password && <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>}
                    </div>

                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
                        Đăng ký
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
