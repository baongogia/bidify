import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Search, Bell, Plus, ShieldCheck, Clock } from 'lucide-react';
import { getProducts } from '../services/productService';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchRef = useRef(null);

    // Xử lý click ra ngoài vùng search
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Live search (Debounce)
    useEffect(() => {
        const q = keyword.trim();
        if (!q) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await getProducts({ keyword: q, limit: 5 });
                if (res.success) {
                    setSearchResults(res.data.products || []);
                }
            } catch (err) {
                console.error('Failed to quick search', err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [keyword]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const q = keyword.trim();
        if (!q) {
            navigate('/');
            return;
        }
        navigate(`/?q=${encodeURIComponent(q)}`);
    };

    const isSeller = user?.role === 'SELLER' && user?.seller_status === 'APPROVED';
    const isBuyer = user?.role === 'BUYER';
    const isAdmin = user?.role === 'ADMIN';
    const isPendingSeller = user?.seller_status === 'PENDING';

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tight flex-shrink-0">Bidify</Link>
                        
                        {/* Live Search */}
                        <div ref={searchRef} className="hidden md:flex relative w-96 ml-6">
                            <form onSubmit={handleSearch} className="w-full relative">
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm sản phẩm..." 
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    className="w-full pl-4 pr-10 py-2 border border-blue-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all text-sm"
                                />
                                <button type="submit" className="absolute right-0 top-0 h-full flex items-center px-4 bg-blue-600 rounded-r-full text-white cursor-pointer hover:bg-blue-700 transition">
                                    <Search size={18} />
                                </button>
                            </form>

                            {/* Dropdown Results */}
                            {isSearchFocused && keyword.trim() && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 transition-all duration-200">
                                    {isSearching ? (
                                        <div className="p-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                                            Đang tìm...
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <ul>
                                            {searchResults.map(p => (
                                                <li key={p.id}>
                                                    <Link 
                                                        to={`/products/${p.id}`} 
                                                        onClick={() => setIsSearchFocused(false)}
                                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                            {p.images && p.images.length > 0 ? (
                                                                <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full text-[8px] text-gray-400 flex items-center justify-center">No img</div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <div className="text-sm font-semibold text-gray-900 truncate">{p.title}</div>
                                                            <div className="text-xs text-blue-600 font-bold mt-0.5">{Number(p.current_price).toLocaleString('vi-VN')} đ</div>
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                            <li>
                                                <Link 
                                                    to={`/?q=${encodeURIComponent(keyword.trim())}`}
                                                    onClick={() => setIsSearchFocused(false)}
                                                    className="block text-center p-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
                                                >
                                                    Xem tất cả kết quả
                                                </Link>
                                            </li>
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-center text-sm text-gray-500">
                                            Không tìm thấy sản phẩm nào
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                    
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                {/* Show "Đăng bán" button only for approved sellers */}
                                {isSeller && (
                                    <Link 
                                        to="/create-product" 
                                        className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition font-medium text-sm"
                                    >
                                        <Plus size={18} />
                                        Đăng bán
                                    </Link>
                                )}

                                {isSeller && (
                                    <Link
                                        to="/seller/products"
                                        className="hidden sm:block text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                                    >
                                        Quản lý tin
                                    </Link>
                                )}

                                {/* Show "Đăng ký người bán" for buyers without pending application */}
                                {isBuyer && !isPendingSeller && (
                                    <Link 
                                        to="/apply-seller" 
                                        className="hidden sm:flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition font-medium text-sm"
                                    >
                                        <ShieldCheck size={18} />
                                        Đăng ký người bán
                                    </Link>
                                )}

                                {/* Admin button */}
                                {isAdmin && (
                                    <Link 
                                        to="/admin/seller-applications" 
                                        className="hidden sm:flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition font-medium text-sm"
                                    >
                                        <ShieldCheck size={18} />
                                        Admin
                                    </Link>
                                )}

                                <Link to="/notifications" className="text-gray-500 hover:text-blue-600 transition p-2 rounded-full hover:bg-gray-100 hidden sm:block">
                                    <Bell size={20} />
                                </Link>
                                <div className="flex items-center gap-2 relative group cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition">
                                    <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-bold">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 hidden sm:block">Xin chào, {user?.name?.split(' ')[0]}</span>
                                    
                                    {/* Dropdown menu */}
                                    <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                        <div className="py-2">
                                            {/* Mobile: Show create product for sellers */}
                                            {isSeller && (
                                                <Link to="/create-product" className="sm:hidden block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium border-b border-gray-100">
                                                    <Plus size={16} className="inline mr-2" />
                                                    Đăng bán sản phẩm
                                                </Link>
                                            )}

                                            {isSeller && (
                                                <Link to="/seller/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium border-b border-gray-100">
                                                    Quản lý tin đăng
                                                </Link>
                                            )}
                                            
                                            {/* Mobile: Show apply seller for buyers */}
                                            {isBuyer && !isPendingSeller && (
                                                <Link to="/apply-seller" className="sm:hidden block px-4 py-2 text-sm text-green-700 hover:bg-green-50 font-medium border-b border-gray-100">
                                                    <ShieldCheck size={16} className="inline mr-2" />
                                                    Đăng ký người bán
                                                </Link>
                                            )}

                                            {/* Show pending status */}
                                            {isPendingSeller && (
                                                <Link to="/my-seller-application" className="block px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 font-medium border-b border-gray-100">
                                                    Đơn đăng ký đang chờ duyệt
                                                </Link>
                                            )}

                                            {/* Admin link for mobile */}
                                            {isAdmin && (
                                                <Link to="/admin/seller-applications" className="sm:hidden block px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 font-medium border-b border-gray-100">
                                                    <ShieldCheck size={16} className="inline mr-2" />
                                                    Quản lý Admin
                                                </Link>
                                            )}

                                            {isAdmin && (
                                                <Link to="/admin/categories" className="block px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 font-medium border-b border-gray-100">
                                                    Quản lý danh mục
                                                </Link>
                                            )}

                                            {isAdmin && (
                                                <Link to="/admin/users" className="block px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 font-medium border-b border-gray-100">
                                                    Quản lý người dùng
                                                </Link>
                                            )}

                                            {isAdmin && (
                                                <Link to="/admin/moderation" className="block px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 font-medium border-b border-gray-100">
                                                    Kiểm duyệt tin đăng
                                                </Link>
                                            )}

                                            {isAdmin && (
                                                <Link to="/admin/settings" className="block px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 font-medium border-b border-gray-100">
                                                    Thiết lập hệ thống
                                                </Link>
                                            )}

                                            <Link to="/watchlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium border-b border-gray-100 mb-1">Danh sách theo dõi</Link>
                                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium">Đăng xuất</button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-sm font-medium flex items-center gap-4">
                                <Link to="/login" className="text-blue-600 hover:underline">Đăng nhập</Link>
                                <Link to="/register" className="text-blue-600 hover:underline">Đăng ký</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
