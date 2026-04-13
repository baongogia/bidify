import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getProducts, getCategories } from '../services/productService';
import { toggleWatchlist } from '../services/watchlistService';
import { AuthContext } from '../context/AuthContext';
import SkeletonCard from '../components/SkeletonCard';
import CountdownTimer from '../components/CountdownTimer';
import { Heart, ShieldCheck, Zap, Lock, Search, Filter, ChevronDown } from 'lucide-react';
import { useModal } from '../context/ModalContext';

const CustomSelect = ({ value, onChange, options, minWidth = '150px' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === String(value)) || options[0];

    return (
        <div ref={ref} className="relative" style={{ minWidth }}>
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between border border-gray-200 rounded-xl text-sm bg-gray-50 px-3 py-2.5 outline-none hover:bg-gray-100 transition focus:ring-2 focus:ring-blue-500"
            >
                <span className="truncate mr-2">{selectedOption?.label}</span>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg shadow-gray-200/50 z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    {options.map(o => (
                        <button
                            key={o.value}
                            type="button"
                            onClick={() => {
                                onChange(o.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left whitespace-normal leading-snug px-3 py-2.5 text-sm hover:bg-gray-50 transition tracking-tight ${String(value) === String(o.value) ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 font-medium'}`}
                        >
                            {o.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const ProductListPage = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const { showAlert } = useModal();
    const navigate = useNavigate();
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filter, setFilter] = useState({
        category_id: '',
        condition: '',
        keyword: '',
        sort: 'ending_soon',
        page: 1
    });

    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = (params.get('q') || '').trim();
        setFilter(prev => {
            if (prev.keyword === q) return prev;
            return { ...prev, keyword: q, page: 1 };
        });
    }, [location.search]);

    useEffect(() => {
        fetchProducts();
    }, [filter]);

    const fetchCategories = async () => {
        try {
            const res = await getCategories();
            if (res.success) setCategories(res.data);
        } catch (e) {
            console.error('Failed to get categories');
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await getProducts(filter);
            if (res.success) {
                setProducts(res.data.products);
                setTotalPages(res.data.pagination.totalPages || 1);
            }
        } catch (e) {
            console.error('Failed to get products');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilter({ ...filter, [e.target.name]: e.target.value, page: 1 });
    };

    const handleWatchToggle = async (id, e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            return navigate('/login');
        }
        try {
            const res = await toggleWatchlist(id);
            const isWatchlisted = !!res?.data?.isWatchlisted;
            setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_watchlisted: isWatchlisted } : p)));
        } catch (err) {
            if (err.message) showAlert('Lỗi', err.message);
        }
    };

    const isLanding = !filter.keyword && !filter.category_id && !filter.condition && filter.page === 1;

    // Components to render filters horizontally
    const renderFilters = () => (
        <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm mb-8 inline-flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500 pl-2">
                <Filter size={16} /> Lọc:
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
                <CustomSelect 
                    value={filter.category_id}
                    onChange={(val) => handleFilterChange({ target: { name: 'category_id', value: val } })}
                    options={[
                        { value: '', label: 'Tất cả danh mục' },
                        ...categories.map(c => ({ value: String(c.id), label: c.name }))
                    ]}
                    minWidth="160px"
                />

                <CustomSelect 
                    value={filter.condition}
                    onChange={(val) => handleFilterChange({ target: { name: 'condition', value: val } })}
                    options={[
                        { value: '', label: 'Mọi tình trạng' },
                        { value: 'NEW', label: 'Hàng Mới' },
                        { value: 'USED', label: 'Đã qua sử dụng' }
                    ]}
                    minWidth="150px"
                />

                <CustomSelect 
                    value={filter.sort}
                    onChange={(val) => handleFilterChange({ target: { name: 'sort', value: val } })}
                    options={[
                        { value: 'ending_soon', label: 'Sắp kết thúc' },
                        { value: 'newly_listed', label: 'Mới đăng' },
                        { value: 'price_asc', label: 'Giá: Thấp đến cao' },
                        { value: 'price_desc', label: 'Giá: Cao đến thấp' }
                    ]}
                    minWidth="170px"
                />
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50/50 min-h-screen">
            {isLanding && (
                <>
                    {/* Hero Section */}
                    <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white pb-20 pt-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500 blur-3xl"></div>
                            <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-indigo-500 blur-3xl"></div>
                        </div>

                        <div className="max-w-4xl mx-auto text-center relative z-10">
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                                Khám phá & Sở hữu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">Sản phẩm Tuyệt vời</span>
                            </h1>
                            <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Nền tảng đấu giá trực tuyến an toàn, minh bạch. Trao đổi những món đồ giá trị cao với mức giá do chính bạn quyết định.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <button onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })} className="px-8 py-4 bg-white text-blue-900 rounded-full font-bold text-lg hover:bg-blue-50 transition shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105">
                                    Bắt đầu Đấu giá ngay
                                </button>
                                <Link to="/register" className="px-8 py-4 bg-blue-800/50 backdrop-blur-md border border-blue-400/30 text-white rounded-full font-bold text-lg hover:bg-blue-700/50 transition">
                                    Đăng ký Người bán
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Value Props */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 mb-16">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
                                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 rotate-3">
                                    <ShieldCheck size={28} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Bảo vệ người mua</h3>
                                <p className="text-gray-500 text-sm">Giao dịch qua hệ thống trung gian uy tín, đảm bảo an toàn tuyệt đối cho dòng tiền của bạn.</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
                                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 -rotate-3">
                                    <Zap size={28} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Đấu giá thời gian thực</h3>
                                <p className="text-gray-500 text-sm">Công nghệ WebSocket cập nhật giá ngay lập tức. Tính năng chống Snipe bảo vệ quyền lợi phút chót.</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
                                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 rotate-3">
                                    <Lock size={28} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Thông tin minh bạch</h3>
                                <p className="text-gray-500 text-sm">Cơ chế định danh nghiêm ngặt, chống đấu giá ảo và hiển thị lịch sử đặt giá công khai 100%.</p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLanding ? (
                    <div className="flex items-end justify-between border-b border-gray-200 pb-4 mb-6 mt-8">
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Sản phẩm đang lên sàn</h2>
                            <p className="text-gray-500 text-sm mt-1">Cơ hội sở hữu hàng chất lượng với mức giá do bạn quyết định</p>
                        </div>
                    </div>
                ) : (
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 tracking-tight">
                        {filter.keyword ? `Kết quả tìm kiếm cho "${filter.keyword}"` : 'Khám phá sản phẩm'}
                    </h1>
                )}

                {/* Horizontal Filter Bar */}
                {renderFilters()}

                {/* Grid */}
                <div className="w-full">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map(p => {
                                    const isEnded = p.status !== 'ACTIVE' || new Date(p.end_time) <= new Date();
                                    return (
                                    <Link to={`/products/${p.id}`} key={p.id} className="group flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative">
                                        {isEnded && (
                                            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
                                                <span className="bg-gray-900/85 text-white px-6 py-2.5 mt-[-20%] rounded-full font-bold text-sm shadow-xl tracking-widest transform -rotate-12 border border-gray-700">
                                                    ĐÃ KẾT THÚC
                                                </span>
                                            </div>
                                        )}
                                        <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                                            {p.images && p.images.length > 0 ? (
                                                <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Không có ảnh</div>
                                            )}
                                            <button 
                                                className={`absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-md rounded-full hover:bg-white transition shadow-sm z-10 ${p.is_watchlisted ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                                                onClick={(e) => handleWatchToggle(p.id, e)}
                                            >
                                                <Heart size={16} fill={p.is_watchlisted ? 'currentColor' : 'none'} />
                                            </button>
                                        </div>
                                        <div className="p-4 flex flex-col flex-1">
                                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition tracking-tight line-clamp-2 text-base mb-1 leading-snug">{p.title}</h3>
                                            <p className="text-sm text-gray-500 mb-4">{p.condition_status === 'NEW' ? 'Hàng Mới' : 'Đã qua sử dụng'}</p>
                                            
                                            <div className="mt-auto flex items-end justify-between">
                                                <div className="text-2xl font-bold text-gray-900 tracking-tight">
                                                    {Number(p.current_price).toLocaleString('vi-VN')} <span className="text-sm font-semibold text-gray-500">đ</span>
                                                </div>
                                                {!isEnded && (
                                                    <div className="text-xs text-blue-700 font-medium bg-blue-50 px-2.5 py-1.5 rounded-lg whitespace-nowrap mb-0.5">
                                                        <CountdownTimer endTime={p.end_time} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                    );
                                })}
                            </div>
                            
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-12 flex justify-center gap-2">
                                    <button 
                                        disabled={filter.page === 1} 
                                        onClick={() => setFilter({ ...filter, page: filter.page - 1 })}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition"
                                    >
                                        Trước
                                    </button>
                                    <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg">
                                        Trang {filter.page} / {totalPages}
                                    </div>
                                    <button 
                                        disabled={filter.page === totalPages} 
                                        onClick={() => setFilter({ ...filter, page: filter.page + 1 })}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition"
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductListPage;
