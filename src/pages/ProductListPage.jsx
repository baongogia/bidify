import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getProducts, getCategories } from '../services/productService';
import { toggleWatchlist } from '../services/watchlistService';
import { AuthContext } from '../context/AuthContext';
import SkeletonCard from '../components/SkeletonCard';
import CountdownTimer from '../components/CountdownTimer';
import { Heart } from 'lucide-react';

const ProductListPage = () => {
    const { isAuthenticated } = useContext(AuthContext);
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
            if (err.message) alert(err.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Khám phá phiên đấu giá</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filter */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-3 text-left">Sắp xếp theo</h3>
                        <div className="flex flex-col gap-2">
                            <select 
                                name="sort" 
                                value={filter.sort} 
                                onChange={handleFilterChange}
                                className="w-full border-gray-300 rounded-lg text-sm bg-white p-2.5 outline-none focus:ring-2 focus:ring-blue-500 border"
                            >
                                <option value="ending_soon">Sắp kết thúc</option>
                                <option value="newly_listed">Mới đăng</option>
                                <option value="price_asc">Giá: Thấp đến cao</option>
                                <option value="price_desc">Giá: Cao đến thấp</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-3 text-left">Danh mục</h3>
                        <select 
                            name="category_id" 
                            value={filter.category_id} 
                            onChange={handleFilterChange}
                            className="w-full border-gray-300 rounded-lg text-sm bg-white p-2.5 outline-none focus:ring-2 focus:ring-blue-500 border"
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-3 text-left">Tình trạng</h3>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="condition" value="" checked={filter.condition === ''} onChange={handleFilterChange} className="text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm text-gray-700">Mọi tình trạng</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="condition" value="NEW" checked={filter.condition === 'NEW'} onChange={handleFilterChange} className="text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm text-gray-700">Mới</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="condition" value="USED" checked={filter.condition === 'USED'} onChange={handleFilterChange} className="text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm text-gray-700">Đã qua sử dụng</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1">
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
                                {products.map(p => (
                                    <Link to={`/products/${p.id}`} key={p.id} className="group flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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
                                        <div className="p-3 flex flex-col flex-1">
                                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition tracking-tight line-clamp-2 text-sm leading-snug">{p.title}</h3>
                                            <p className="text-[11px] text-gray-500 mt-1.5 mb-2.5 font-medium">{p.condition_status === 'NEW' ? 'Hàng Mới' : 'Đã qua sử dụng'}</p>
                                            <div className="mt-auto pt-2 border-t border-gray-50/80">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Giá hiện tại</div>
                                                        <div className="text-lg font-bold text-gray-900 tracking-tight">{Number(p.current_price).toLocaleString('vi-VN')} <span className="text-sm font-semibold text-gray-500">đ</span></div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-1.5 rounded-md inline-block whitespace-nowrap shadow-sm border border-blue-100">
                                                            <CountdownTimer endTime={p.end_time} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
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
