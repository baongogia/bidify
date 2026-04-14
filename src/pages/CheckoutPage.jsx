import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProductDetail, confirmPayment } from "../services/productService";
import { AuthContext } from "../context/AuthContext";
import {
  CheckCircle,
  MapPin,
  CreditCard,
  ShieldCheck,
  QrCode,
  Loader2,
} from "lucide-react";
import { useModal } from "../context/ModalContext";

const CheckoutPage = () => {
  const { showAlert, showConfirm } = useModal();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("waiting"); // waiting, processing, success

  const [shippingData, setShippingData] = useState({
    fullName: user?.name || "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await getProductDetail(id);
      if (res.success) {
        // Ensure only the winner can access this page
        if (
          res.data.status !== "ENDED_WAITING_PAYMENT" ||
          res.data.highest_bidder_id !== user?.id
        ) {
          navigate("/");
          return;
        }
        setProduct(res.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin sản phẩm:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (
      !shippingData.fullName ||
      !shippingData.phone ||
      !shippingData.address
    ) {
      showAlert("Cảnh báo", "Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    setShowQR(true);
  };

  const processBackendPayment = async () => {
    setPaymentStatus("processing");

    // Giả lập thời gian load giao dịch ngân hàng
    setTimeout(async () => {
      try {
        const res = await confirmPayment(id, shippingData);

        if (res.success) {
          setPaymentStatus("success");
          setTimeout(async () => {
            setShowQR(false);
            await showAlert(
              "Thanh toán thành công!",
              "Người bán đã nhận được thông báo và sẽ sớm liên hệ giao hàng cho bạn.",
            );
            navigate("/");
          }, 1500);
        }
      } catch (err) {
        setShowQR(false);
        setPaymentStatus("waiting");
        showAlert("Lỗi", err.message || "Thanh toán thất bại.");
      }
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) return null;

  const mainImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://via.placeholder.com/300";

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Thanh toán đơn hàng
          </h1>
          <p className="mt-2 text-gray-600">
            Hoàn tất thủ tục thanh toán cho phiên đấu giá bạn đã trúng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Shipping Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <MapPin className="text-blue-600" size={20} /> Thông tin nhận
                hàng
              </h2>
              <form className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-sm font-medium"
                      placeholder="Tên người nhận"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-sm font-medium"
                      placeholder="Số điện thoại"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                    Địa chỉ cụ thể
                  </label>
                  <textarea
                    name="address"
                    rows="3"
                    value={shippingData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all resize-none text-sm font-medium"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  ></textarea>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <CreditCard className="text-blue-600" size={20} /> Phương thức
                thanh toán
              </h2>
              <div className="space-y-3">
                <div className="border border-blue-600 bg-blue-50/50 p-4 rounded-xl flex items-center justify-between cursor-pointer ring-1 ring-blue-600 transition-all hover:bg-blue-50 relative overflow-hidden">
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-5 h-5 rounded-full border-4 border-blue-600 bg-white flex-shrink-0"></div>
                    <span className="font-bold text-gray-900 text-sm">
                      Thanh toán chuyển khoản (Thử nghiệm)
                    </span>
                  </div>
                  <CheckCircle
                    className="text-blue-600 relative z-10"
                    size={20}
                  />
                  <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-blue-100/50 to-transparent z-0"></div>
                </div>
                <div className="border border-gray-200 bg-gray-50/50 p-4 rounded-xl flex items-center justify-between opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border border-gray-300 bg-gray-100 flex-shrink-0"></div>
                    <span className="font-semibold text-gray-600 text-sm">
                      Thanh toán VNPay (Đang bảo trì)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="h-full">
            <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 ring-1 ring-gray-100 p-8 h-full flex flex-col flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">
                Tóm tắt đơn hàng
              </h2>

              <div className="flex gap-4 mb-6">
                <div className="w-20 h-20 rounded-xl bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden">
                  <img
                    src={mainImage}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                    {product.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Hàng{" "}
                    {product.condition_status === "NEW"
                      ? "mới"
                      : "đã qua sử dụng"}
                  </p>
                </div>
              </div>

              <div className="flex-1">
                <div className="space-y-4 text-sm text-gray-600 mb-6 border-b border-gray-100 pb-6">
                  <div className="flex justify-between items-end relative group">
                    <span className="flex-shrink-0 text-gray-500 font-medium group-hover:text-gray-700 transition">
                      Giá trúng thầu
                    </span>
                    <div className="flex-1 border-b-[1.5px] border-dotted border-gray-300 mx-4 mb-1.5 opacity-60"></div>
                    <span className="font-bold text-gray-900 text-right">
                      {Number(product.current_price).toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <div className="flex justify-between items-end relative group">
                    <span className="flex-shrink-0 text-gray-500 font-medium group-hover:text-gray-700 transition">
                      Phí giao dịch
                    </span>
                    <div className="flex-1 border-b-[1.5px] border-dotted border-gray-300 mx-4 mb-1.5 opacity-60"></div>
                    <span className="font-bold text-gray-900 text-right text-green-600">
                      Miễn phí
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-5 mb-8 border border-blue-100/50 shadow-inner">
                <div className="flex flex-col gap-1 items-end">
                  <span className="font-bold text-gray-500 uppercase tracking-widest text-[11px] mb-1">
                    Tổng thanh toán
                  </span>
                  <div className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-500 leading-tight">
                    {Number(product.current_price).toLocaleString("vi-VN")}{" "}
                    <span className="text-xl sm:text-2xl font-bold text-blue-600 ml-0.5">
                      đ
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-2">
                <button
                  onClick={handlePayment}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-xl shadow-[0_8px_16px_-6px_rgba(37,99,235,0.5)] hover:shadow-[0_12px_20px_-8px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 transition-all outline-none text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận thanh toán"}
                </button>

                <div className="mt-5 flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
                  <ShieldCheck
                    className="text-green-600 flex-shrink-0"
                    size={18}
                  />
                  <p className="text-xs text-green-700 leading-tight">
                    Cam kết bảo mật thông tin. Bạn sẽ được hoàn tiền nếu người
                    bán không giao hàng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Payment QR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-blue-600 p-6 text-center text-white relative">
              <h3 className="text-xl font-bold mb-1">
                Cổng thanh toán tự động
              </h3>
              <p className="text-blue-100 text-sm">
                Vui lòng quét mã QR qua ứng dụng ngân hàng
              </p>
              <button
                onClick={() => {
                  if (paymentStatus === "waiting") setShowQR(false);
                }}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
                disabled={paymentStatus !== "waiting"}
              >
                ×
              </button>
            </div>

            <div className="p-8 text-center flex flex-col items-center">
              {paymentStatus === "waiting" && (
                <>
                  <div className="p-3 bg-white rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.1)] mb-6 border border-gray-100">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BIDIFY_PAYMENT_${product.id}`}
                      alt="QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                  <div className="text-2xl font-black text-blue-600 mb-2">
                    {Number(product.current_price).toLocaleString("vi-VN")} đ
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                    Mã giao dịch:{" "}
                    <span className="font-mono text-gray-900">
                      #BID{product.id}2026
                    </span>
                  </p>

                  <button
                    onClick={processBackendPayment}
                    className="w-full py-3.5 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors flex justify-center items-center gap-2"
                  >
                    <QrCode size={20} /> Đã thanh toán
                  </button>
                </>
              )}

              {paymentStatus === "processing" && (
                <div className="py-12 flex flex-col items-center">
                  <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    Đang xử lý giao dịch...
                  </h4>
                  <p className="text-sm text-gray-500">
                    Vui lòng không đóng cửa sổ này
                  </p>
                </div>
              )}

              {paymentStatus === "success" && (
                <div className="py-12 flex flex-col items-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">
                    Thanh toán thành công!
                  </h4>
                  <p className="text-sm text-gray-500">
                    Hệ thống đang chuyển hướng...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
