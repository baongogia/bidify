import React, { useEffect, useState } from "react";
import {
  Users,
  ShoppingBag,
  Gavel,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import { getAdminUsers, getModerationProducts } from "../services/adminService";

// Fallback Chart components using SVG
const SimpleLineChart = ({ data }) => {
  const height = 100;
  const width = 300;
  const padding = 10;
  const maxValue = Math.max(...data, 1);

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
      const y = height - ((d / maxValue) * (height - 2 * padding) + padding);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <polyline
        fill="none"
        stroke="#002B5B"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="drop-shadow-sm"
      />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
        const y = height - ((d / maxValue) * (height - 2 * padding) + padding);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="4"
            fill="white"
            stroke="#002B5B"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
};

const SimpleBarChart = ({ data }) => {
  const height = 100;
  const width = 300;
  const maxValue = Math.max(...data, 1);
  const barWidth = width / data.length - 4;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      {data.map((d, i) => {
        const h = (d / maxValue) * height;
        const x = i * (width / data.length) + 2;
        return (
          <rect
            key={i}
            x={x}
            y={height - h}
            width={barWidth}
            height={h}
            fill="#002B5B"
            rx="2"
          />
        );
      })}
    </svg>
  );
};

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingProducts: 0,
    activeAuctions: 0,
    totalSales: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, productsRes] = await Promise.all([
        getAdminUsers({ limit: 1 }),
        getModerationProducts({ limit: 1 }),
      ]);

      setStats({
        totalUsers: usersRes.success ? usersRes.data.total : 0,
        pendingProducts: productsRes.success ? productsRes.data.total : 0,
        activeAuctions: 42, // Mock for now
        totalSales: 156000000, // Mock for now
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-[#002B5B] rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400 font-bold text-xs uppercase tracking-widest">
          Đang tải dữ liệu báo cáo...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tổng quan hệ thống
          </h1>
          <p className="text-gray-500 text-sm">
            Cập nhật số liệu thực tế từ dữ liệu sàn.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
          <Clock size={14} />
          Live: {new Date().toLocaleTimeString("vi-VN")}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Người dùng",
            value: stats.totalUsers,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Đang duyệt",
            value: stats.pendingProducts,
            icon: AlertCircle,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Đấu giá active",
            value: stats.activeAuctions,
            icon: Gavel,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
          {
            label: "Tổng doanh thu",
            value: formatCurrency(stats.totalSales),
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-start justify-between"
          >
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                {s.label}
              </p>
              <p className="text-xl font-bold text-gray-900 leading-none">
                {s.value}
              </p>
            </div>
            <div className={`p-2.5 ${s.bg} ${s.color} rounded-lg`}>
              <s.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              Tăng trưởng người dùng
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
              7 ngày gần nhất
            </span>
          </div>
          <div className="py-6">
            <SimpleLineChart data={[12, 19, 15, 22, 18, 25, 32]} />
          </div>
          <div className="mt-6 flex justify-between text-[10px] font-bold text-gray-400 uppercase">
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
            <span>CN</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag size={18} className="text-indigo-600" />
              Lượt đấu giá thành công
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
              Sản phẩm/tháng
            </span>
          </div>
          <div className="py-6">
            <SimpleBarChart
              data={[45, 32, 56, 42, 68, 89, 75, 92, 110, 85, 96, 120]}
            />
          </div>
          <div className="mt-6 flex justify-between text-[10px] font-bold text-gray-400 uppercase">
            <span>Jan</span>
            <span>Mar</span>
            <span>May</span>
            <span>Jul</span>
            <span>Sep</span>
            <span>Nov</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Mini Table */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-500" />
            Sản phẩm vừa được duyệt
          </h3>
          <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">
            Xem tất cả
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
              <tr>
                <th className="px-8 py-4">Tên sản phẩm</th>
                <th className="px-8 py-4">Người bán</th>
                <th className="px-8 py-4 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                {
                  title: "iPhone 15 Pro Max 256GB",
                  seller: "Minh Tuấn",
                  status: "Approved",
                  time: "5m",
                },
                {
                  title: "Rolex Submariner Date",
                  seller: "LuxuryWatch",
                  status: "Approved",
                  time: "12m",
                },
                {
                  title: "MacBook M3 Pro 14 inch",
                  seller: "Thành Đạt",
                  status: "Published",
                  time: "20m",
                },
                {
                  title: "Túi Gucci Marmont",
                  seller: "Thúy Hạnh",
                  status: "Approved",
                  time: "34m",
                },
              ].map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-4 font-bold text-gray-800">
                    {item.title}
                  </td>
                  <td className="px-8 py-4 text-gray-500">{item.seller}</td>
                  <td className="px-8 py-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
