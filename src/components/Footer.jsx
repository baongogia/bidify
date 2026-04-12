import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Shield,
  Zap,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 pt-16 pb-8 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="col-span-1 lg:col-span-1">
            <Link
              to="/"
              className="text-2xl font-black tracking-tighter text-white mb-6 inline-block"
            >
              Bidify<span className="text-blue-500">.</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Nền tảng đấu giá trực tuyến hiện đại nhất. Mang đến trải nghiệm
              mua sắm minh bạch, an toàn và đầy kịch tính cho mọi tín đồ.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">
              Khám Phá
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition">
                  Sắp kết thúc
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition">
                  Vừa lên sàn
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition">
                  Đồ điện tử / Công nghệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">
              Hỗ Trợ
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Quy chế hoạt động
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Giải quyết khiếu nại
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Chính sách bảo mật
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">
              Liên Hệ
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-gray-500 mt-1 shrink-0" />
                <span>85 Vũ Đức Thận, Long Biên, Hà Nội</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-gray-500 shrink-0" />
                <span>1900 8888 (Miễn phí)</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-gray-500 shrink-0" />
                <span>support@bidify.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider & Bottom Section */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Bidify Platform. Bản quyền đã được
            bảo hộ.
          </p>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold bg-gray-800/80 border border-gray-700 px-3 py-1.5 rounded-lg shadow-sm">
              <Shield size={14} className="text-green-500" /> Thanh toán An toàn
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold bg-gray-800/80 border border-gray-700 px-3 py-1.5 rounded-lg shadow-sm">
              <Zap size={14} className="text-yellow-500" /> Tốc độ Tối đa
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
