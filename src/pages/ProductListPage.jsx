import React, { useEffect, useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getProducts, getCategories } from "../services/productService";
import { toggleWatchlist } from "../services/watchlistService";
import { AuthContext } from "../context/AuthContext";
import SkeletonCard from "../components/SkeletonCard";
import CountdownTimer from "../components/CountdownTimer";
import {
  Heart,
  ShieldCheck,
  Zap,
  Lock,
  Search,
  Filter,
  ChevronDown,
  Clock,
} from "lucide-react";
import { useModal } from "../context/ModalContext";

const TERMINAL_PRODUCT_STATUSES = [
  "ENDED_WAITING_PAYMENT",
  "COMPLETED",
  "UNSOLD",
  "CANCELLED",
];

const isProductAuctionEnded = (p, now = new Date()) => {
  if (TERMINAL_PRODUCT_STATUSES.includes(p.status)) return true;
  if (p.status === "ACTIVE" && new Date(p.end_time) <= now) return true;
  return false;
};

const CustomSelect = ({ value, onChange, options, minWidth = "150px" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption =
    options.find((o) => o.value === String(value)) || options[0];

  return (
    <div ref={ref} className="relative" style={{ minWidth }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border border-gray-200 rounded-lg text-sm bg-gray-50 px-3 py-2.5 outline-none hover:bg-gray-100 transition focus:ring-2 focus:ring-blue-500"
      >
        <span className="truncate mr-2">{selectedOption?.label}</span>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg shadow-gray-200/50 z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setIsOpen(false);
              }}
              className={`w-full text-left whitespace-normal leading-snug px-3 py-2.5 text-sm hover:bg-gray-50 transition tracking-tight ${String(value) === String(o.value) ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-700 font-medium"}`}
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
    category_id: "",
    condition: "",
    keyword: "",
    sort: "ending_soon",
    page: 1,
    limit: 12,
  });

  const [totalPages, setTotalPages] = useState(1);

  const isLanding =
    !filter.keyword &&
    !filter.category_id &&
    !filter.condition &&
    filter.page === 1;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = (params.get("q") || "").trim();
    setFilter((prev) => {
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
      console.error("Failed to get categories");
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({
        ...filter,
        limit: isLanding ? 72 : filter.limit,
      });
      if (res.success) {
        setProducts(res.data.products);
        setTotalPages(res.data.pagination.totalPages || 1);
      }
    } catch (e) {
      console.error("Failed to get products");
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
      return navigate("/login");
    }
    try {
      const res = await toggleWatchlist(id);
      const isWatchlisted = !!res?.data?.isWatchlisted;
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, is_watchlisted: isWatchlisted } : p,
        ),
      );
    } catch (err) {
      if (err.message) showAlert("Lỗi", err.message);
    }
  };

  const renderProductCard = (p, layout = "grid") => {
    const isRow = layout === "row";
    const now = new Date();
    const isEnded = isProductAuctionEnded(p, now);
    const isUpcoming =
      ["ACTIVE", "PENDING"].includes(p.status) &&
      new Date(p.start_time) > now;
    const hoursLeft = (new Date(p.end_time) - now) / (1000 * 60 * 60);
    const isLiveActive =
      p.status === "ACTIVE" &&
      new Date(p.start_time) <= now &&
      new Date(p.end_time) > now;
    const isEndingSoon =
      isLiveActive && hoursLeft > 0 && hoursLeft < 24;

    return (
      <Link
        to={`/products/${p.id}`}
        key={p.id}
        className={`group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm shadow-gray-900/5 ring-1 ring-gray-200/80 hover:shadow-md hover:ring-gray-300/90 transition-all duration-300 hover:-translate-y-0.5 relative ${
          isRow
            ? "w-[min(280px,calc(100vw-3rem))] shrink-0 snap-start"
            : "h-full"
        }`}
      >
        <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
          {isEnded && (
            <>
              <div
                className="absolute inset-0 z-[15] bg-white/40 pointer-events-none"
                aria-hidden
              />
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 px-2.5 py-1 rounded-md bg-gray-900/88 text-white text-[9px] font-bold uppercase tracking-wide shadow-sm">
                Đã kết thúc
              </div>
            </>
          )}
          {isEndingSoon && (
            <div className="absolute top-2.5 left-2.5 z-10 bg-red-500 text-white px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm animate-pulse">
              <Zap size={9} fill="currentColor" /> Sắp kết thúc
            </div>
          )}
          {isUpcoming && (
            <div className="absolute top-2.5 left-2.5 z-10 bg-blue-600 text-white px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm">
              <Clock size={9} /> Sắp diễn ra
            </div>
          )}
          {p.images && p.images.length > 0 ? (
            <img
              src={p.images[0]}
              alt={p.title}
              className={`w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out ${isEnded ? "grayscale-[0.25] opacity-[0.92]" : ""}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-4 capitalize">
              Không có ảnh
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <button
            className={`absolute top-2.5 right-2.5 p-1.5 bg-white/95 backdrop-blur-sm rounded-full hover:bg-white transition shadow-sm ring-1 ring-black/5 z-30 ${p.is_watchlisted ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}
            onClick={(e) => handleWatchToggle(p.id, e)}
          >
            <Heart
              size={17}
              strokeWidth={2}
              fill={p.is_watchlisted ? "currentColor" : "none"}
            />
          </button>
        </div>

        <div className="p-3.5 sm:p-4 flex flex-col gap-1.5">
          <div className="text-[9px] font-semibold text-blue-600 uppercase tracking-wide">
            {p.category_name || "Đấu giá"}
          </div>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-2 text-sm leading-snug">
            {p.title}
          </h3>

          <div className="pt-2.5 mt-0.5 border-t border-gray-100">
            <div className="flex justify-between items-end gap-2">
              <div className="min-w-0">
                <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                  {isUpcoming ? "Giá khởi điểm" : "Giá hiện tại"}
                </p>
                <div className="text-base sm:text-lg font-bold text-gray-900 tabular-nums tracking-tight">
                  {Number(p.current_price).toLocaleString("vi-VN")}
                  <span className="text-[11px] font-semibold text-gray-400 ml-0.5">
                    ₫
                  </span>
                </div>
              </div>

              {!isEnded && (
                <div
                  className={`shrink-0 flex flex-col items-end ${isUpcoming ? "bg-blue-600" : "bg-gray-900"} text-white px-2 py-1 rounded-md shadow-sm`}
                >
                  <span className="text-[8px] font-bold uppercase tracking-wide opacity-90">
                    {isUpcoming ? "Bắt đầu sau" : "Kết thúc sau"}
                  </span>
                  <div className="text-[10px] font-semibold leading-tight">
                    <CountdownTimer
                      endTime={isUpcoming ? p.start_time : p.end_time}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const renderRecentlyEndedSection = () => {
    const now = new Date();
    const endedList = products
      .filter((p) => isProductAuctionEnded(p, now))
      .sort((a, b) => {
        const endB = new Date(b.end_time).getTime();
        const endA = new Date(a.end_time).getTime();
        if (endB !== endA) return endB - endA;
        return (b.id ?? 0) - (a.id ?? 0);
      });

    if (endedList.length === 0) return null;

    return (
      <section className="opacity-95 hover:opacity-100 transition-all duration-500">
        <div className="flex flex-col mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-[2px] w-8 bg-gray-400" />
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
              Đã kết thúc
            </span>
          </div>
          <h2 className="text-3xl font-black text-gray-700 tracking-tighter">
            Phiên đấu giá vừa qua
          </h2>
        </div>
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div
            className="flex gap-4 overflow-x-auto pb-3 scroll-smooth snap-x snap-mandatory [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-gray-100"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {endedList.map((p) => renderProductCard(p, "row"))}
          </div>
        </div>
      </section>
    );
  };

  // Components to render filters horizontally
  const renderFilters = () => (
    <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-xl shadow-gray-200/20 mb-8 flex flex-col lg:flex-row items-center gap-2 w-full lg:w-max">
      <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-4 pr-2">
        <Filter size={14} strokeWidth={3} /> Lọc kết quả
      </div>

      <div className="flex flex-wrap items-center gap-2 p-1 bg-gray-50/50 rounded-lg w-full lg:w-auto">
        <CustomSelect
          value={filter.category_id}
          onChange={(val) =>
            handleFilterChange({ target: { name: "category_id", value: val } })
          }
          options={[
            { value: "", label: "Tất cả danh mục" },
            ...categories.map((c) => ({ value: String(c.id), label: c.name })),
          ]}
          minWidth="180px"
        />

        <CustomSelect
          value={filter.condition}
          onChange={(val) =>
            handleFilterChange({ target: { name: "condition", value: val } })
          }
          options={[
            { value: "", label: "Tình trạng" },
            { value: "NEW", label: "Hàng Mới" },
            { value: "USED", label: "Hàng Cũ" },
          ]}
          minWidth="140px"
        />

        <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden lg:block"></div>

        <CustomSelect
          value={filter.sort}
          onChange={(val) =>
            handleFilterChange({ target: { name: "sort", value: val } })
          }
          options={[
            { value: "ending_soon", label: "Kết thúc sớm nhất" },
            { value: "newly_listed", label: "Sản phẩm mới nhất" },
            { value: "price_asc", label: "Giá thấp nhất" },
            { value: "price_desc", label: "Giá cao nhất" },
          ]}
          minWidth="190px"
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
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-black uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4">
                <Zap size={14} className="text-yellow-400" /> Sàn đấu giá trực
                tuyến số 1 Việt Nam
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700">
                KHÁM PHÁ & SỞ HỮU <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-cyan-300">
                  GIA SẢN ĐỘC BẢN
                </span>
              </h1>
              <p className="text-xl text-blue-100/80 mb-12 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000">
                Trải nghiệm đấu giá thời gian thực với hệ thống bảo mật tuyệt
                đối. Nơi những giá trị thực được khẳng định bởi chính bạn.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-5 translate-y-4">
                <button
                  onClick={() =>
                    window.scrollTo({ top: 800, behavior: "smooth" })
                  }
                  className="px-10 py-5 bg-white text-blue-900 rounded-lg font-black text-lg hover:bg-blue-50 transition shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95"
                >
                  Bắt đầu Đấu giá
                </button>
                <Link
                  to="/register"
                  className="px-10 py-5 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-lg font-black text-lg hover:bg-white/20 transition shadow-xl hover:scale-105 active:scale-95"
                >
                  Đăng ký Người bán
                </Link>
              </div>
            </div>
          </div>

          {/* Value Props */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 rotate-3">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Bảo vệ người mua
                </h3>
                <p className="text-gray-500 text-sm">
                  Giao dịch qua hệ thống trung gian uy tín, đảm bảo an toàn
                  tuyệt đối cho dòng tiền của bạn.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4 -rotate-3">
                  <Zap size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Đấu giá thời gian thực
                </h3>
                <p className="text-gray-500 text-sm">
                  Công nghệ WebSocket cập nhật giá ngay lập tức. Tính năng chống
                  Snipe bảo vệ quyền lợi phút chót.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 rotate-3">
                  <Lock size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Thông tin minh bạch
                </h3>
                <p className="text-gray-500 text-sm">
                  Cơ chế định danh nghiêm ngặt, chống đấu giá ảo và hiển thị
                  lịch sử đặt giá công khai 100%.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isLanding && (
          <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
              {filter.keyword
                ? `KẾT QUẢ CHO "${filter.keyword.toUpperCase()}"`
                : "KHÁM PHÁ DANH MỤC"}
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              Tìm thấy {products.length} sản phẩm phù hợp
            </p>
          </div>
        )}

        {/* Horizontal Filter Bar */}
        {renderFilters()}

        {/* Grid */}
        <div className="w-full">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-lg border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                <Search size={32} />
              </div>
              <p className="text-gray-500 text-lg font-bold">
                Không tìm thấy sản phẩm nào
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Vui lòng thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {isLanding && renderRecentlyEndedSection()}
              {/* Active Auctions Section */}
              {(() => {
                const activeList = products.filter((p) => {
                  const t = new Date();
                  if (p.status !== "ACTIVE") return false;
                  if (new Date(p.start_time) > t) return false;
                  if (new Date(p.end_time) <= t) return false;
                  return true;
                });
                if (activeList.length === 0 && !isLanding) return null;
                if (
                  activeList.length === 0 &&
                  isLanding &&
                  products.filter(
                    (p) =>
                      ["ACTIVE", "PENDING"].includes(p.status) &&
                      new Date(p.start_time) > new Date(),
                  ).length === 0
                )
                  return null;

                return (
                  <section>
                    {(isLanding || activeList.length > 0) && (
                      <div className="flex flex-col mb-8">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-[2px] w-8 bg-blue-600"></div>
                          <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                            Đang diễn ra
                          </span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">
                          Sản phẩm đang đấu giá
                        </h2>
                      </div>
                    )}
                    {activeList.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                        {activeList.map((p) => renderProductCard(p))}
                      </div>
                    ) : (
                      isLanding && (
                        <div className="py-12 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                          <p className="text-gray-400 font-medium">
                            Hiện không có sản phẩm nào đang trong phiên đấu giá.
                          </p>
                        </div>
                      )
                    )}
                  </section>
                );
              })()}

              {/* Upcoming Auctions Section */}
              {(() => {
                const upcomingList = products.filter(
                  (p) =>
                    ["ACTIVE", "PENDING"].includes(p.status) &&
                    new Date(p.start_time) > new Date(),
                );
                if (upcomingList.length === 0) return null;

                return (
                  <section>
                    <div className="flex flex-col mb-8">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-[2px] w-8 bg-amber-500"></div>
                        <span className="text-xs font-black text-amber-500 uppercase tracking-widest">
                          Sắp lên sàn
                        </span>
                      </div>
                      <h2 className="text-3xl font-black text-gray-900 tracking-tighter">
                        Phiên đấu giá sắp bắt đầu
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                      {upcomingList.map((p) => renderProductCard(p))}
                    </div>
                  </section>
                );
              })()}

              {!isLanding && renderRecentlyEndedSection()}
            </div>
          )}
        </div>

        {/* Pagination — ẩn trên landing (đã tải một lần + cuộn ngang) */}
        {totalPages > 1 && !isLanding && (
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
    </div>
  );
};

export default ProductListPage;
