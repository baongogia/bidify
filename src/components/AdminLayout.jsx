import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Users,
    ClipboardList,
    ShieldCheck,
    FolderOpen,
    Settings,
    LayoutDashboard,
    ArrowLeft
} from 'lucide-react';

const NAV_ITEMS = [
    {
        to: '/admin',
        icon: LayoutDashboard,
        label: 'Dashboard',
    },
    {
        to: '/admin/seller-applications',
        icon: ClipboardList,
        label: 'Duyệt người bán',
    },
    {
        to: '/admin/users',
        icon: Users,
        label: 'Người dùng',
    },
    {
        to: '/admin/moderation',
        icon: ShieldCheck,
        label: 'Vi phạm & báo cáo',
    },
    {
        to: '/admin/categories',
        icon: FolderOpen,
        label: 'Danh mục',
    },
    {
        to: '/admin/settings',
        icon: Settings,
        label: 'Thiết lập',
    }
];

const AdminLayout = ({ children }) => {
    const location = useLocation();

    return (
        <div className="min-h-screen flex bg-[#f4f7f9] font-['Inter',_sans-serif]">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-[#002B5B] sticky top-0 h-screen overflow-hidden shadow-xl">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                            <LayoutDashboard size={18} className="text-[#002B5B]" />
                        </div>
                        <div>
                            <span className="text-base font-bold text-white tracking-tight block">BIDIFY ADMIN</span>
                            <span className="text-[9px] uppercase font-bold text-blue-300 tracking-wider">Hệ thống quản trị</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
                        const isActive = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isActive
                                        ? 'bg-white/10 text-white'
                                        : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <Icon size={18} className={isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 bg-black/10">
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-blue-100 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Quay về trang chủ
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0 h-screen overflow-y-auto">
                <header className="bg-white border-b border-gray-200 h-16 sticky top-0 z-30 px-8 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                        <span>Admin</span>
                        <span>/</span>
                        <span className="text-gray-900">
                             {NAV_ITEMS.find(i => location.pathname === i.to || (i.to !== '/admin' && location.pathname.startsWith(i.to)))?.label || 'Quản lý'}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                         <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-[#002B5B] font-black text-[10px]">
                             AD
                         </div>
                    </div>
                </header>

                <div className="p-8 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
