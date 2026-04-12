import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Users,
    ClipboardList,
    ShieldCheck,
    FolderOpen,
    Settings,
    LayoutDashboard
} from 'lucide-react';

const NAV_ITEMS = [
    {
        to: '/admin/seller-applications',
        icon: ClipboardList,
        label: 'Duyệt đơn người bán',
        color: 'text-indigo-600',
        activeBg: 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600'
    },
    {
        to: '/admin/users',
        icon: Users,
        label: 'Quản lý người dùng',
        color: 'text-blue-600',
        activeBg: 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
    },
    {
        to: '/admin/moderation',
        icon: ShieldCheck,
        label: 'Kiểm duyệt tin đăng',
        color: 'text-emerald-600',
        activeBg: 'bg-emerald-50 text-emerald-700 border-r-2 border-emerald-600'
    },
    {
        to: '/admin/categories',
        icon: FolderOpen,
        label: 'Quản lý danh mục',
        color: 'text-amber-600',
        activeBg: 'bg-amber-50 text-amber-700 border-r-2 border-amber-600'
    },
    {
        to: '/admin/settings',
        icon: Settings,
        label: 'Thiết lập hệ thống',
        color: 'text-slate-600',
        activeBg: 'bg-slate-50 text-slate-700 border-r-2 border-slate-600'
    }
];

const AdminLayout = ({ children }) => {
    const location = useLocation();

    return (
        <div className="min-h-[calc(100vh-64px)] flex bg-gray-50">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 flex-shrink-0">
                <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-purple-700">
                        <LayoutDashboard size={20} />
                        <span className="text-base font-bold tracking-tight">Bảng điều khiển</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Quản trị viên</p>
                </div>

                <nav className="flex-1 py-4">
                    {NAV_ITEMS.map(({ to, icon: Icon, label, color, activeBg }) => {
                        const isActive = location.pathname === to;
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all ${
                                    isActive
                                        ? activeBg
                                        : `text-gray-600 hover:bg-gray-50 hover:${color}`
                                }`}
                            >
                                <Icon size={18} className={isActive ? '' : color} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition"
                    >
                        ← Về trang chủ
                    </Link>
                </div>
            </aside>

            {/* Mobile top nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex items-center justify-around py-2 px-2">
                {NAV_ITEMS.map(({ to, icon: Icon, label, color, activeBg }) => {
                    const isActive = location.pathname === to;
                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-medium transition ${
                                isActive ? 'text-purple-700' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Icon size={20} className={isActive ? 'text-purple-600' : color} />
                            <span className="line-clamp-1 max-w-[5rem] text-center leading-tight" style={{ fontSize: '10px' }}>
                                {label.split(' ').slice(0, 2).join(' ')}
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-auto pb-16 md:pb-0">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
