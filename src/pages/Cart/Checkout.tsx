import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../api/services/userService';
import { orderService } from '../../api/services/orderService';
import { paymentService } from '../../api/services/paymentService';
import { installmentService } from '../../api/services/installmentService';
import { UserResponse } from '../../api/types/user';
import { InstallmentPackageResponse } from '../../api/types/installment';

const Checkout: React.FC = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank' | 'installment'>('cod');
  const [installmentPackages, setInstallmentPackages] = useState<InstallmentPackageResponse[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<InstallmentPackageResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserResponse | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
  });

  // Tính toán dựa trên gói được chọn
  // downPayment = khoản trả ngay khi đặt hàng
  // monthlyPayment = (totalPrice - downPayment) / durationMonths — mỗi tháng sau đó
  const downPaymentPercent = selectedPackage?.downPaymentPercent ?? 0;
  const downPayment = totalPrice * (downPaymentPercent / 100);
  const remainingAmount = totalPrice - downPayment;
  const monthlyPayment = selectedPackage
    ? (remainingAmount / selectedPackage.durationMonths).toFixed(2)
    : '0.00';
  // Cần trả ngay: nếu có down payment thì chỉ trả down payment, không có thì trả kỳ 1
  const dueNow = downPaymentPercent > 0 ? downPayment : parseFloat(monthlyPayment);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (authUser) {
        try {
          const profile = await userService.getMyProfile();
          setUserProfile(profile);
          setFormData({
            fullName: profile.username || '',
            phoneNumber: profile.phoneNumber || '',
            address: '',
          });
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      }
    };
    fetchUserProfile();
  }, [authUser]);

  // Load installment packages
  useEffect(() => {
    installmentService.getActivePackages()
      .then((pkgs) => {
        setInstallmentPackages(pkgs);
        if (pkgs.length > 0) setSelectedPackage(pkgs[0]);
      })
      .catch(console.error);
  }, []);

  React.useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart.length, navigate]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authUser) {
      alert('Vui lòng đăng nhập để đặt hàng');
      navigate('/login');
      return;
    }

    if (!formData.fullName.trim() || !formData.phoneNumber.trim() || !formData.address.trim()) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Map payment method to backend format
      let paymentType = 'CASH';
      if (paymentMethod === 'bank') {
        paymentType = 'BANK_TRANSFER';
      } else if (paymentMethod === 'installment') {
        paymentType = 'INSTALLMENT';
      }

      // Create order - map to backend format
      const orderData: any = {
        recipientName: formData.fullName,
        recipientPhone: formData.phoneNumber,
        shippingAddress: formData.address,
        paymentType: paymentMethod === 'installment' ? 'INSTALLMENT' : 'FULL',
      };

      // Only add packageId if payment method is installment
      if (paymentMethod === 'installment' && selectedPackage) {
        orderData.packageId = selectedPackage.packageId;
      }

      console.log('Creating order with data:', orderData);
      const order = await orderService.placeOrder(orderData);
      console.log('Order created:', order);

      // If payment method is bank transfer, redirect to VNPay
      if (paymentMethod === 'bank') {
        try {
          const payment = await paymentService.createPayment(order.orderId);
          
          if (!payment.paymentUrl) {
            throw new Error('Không nhận được link thanh toán từ server.');
          }

          // Clear cart before redirecting
          await clearCart();
          
          // Redirect to VNPay
          paymentService.redirectToPayment(payment.paymentUrl);
          return;
        } catch (paymentError: any) {
          console.error('Payment error:', paymentError);
          setIsProcessing(false);
          alert(paymentError.message || 'Đơn hàng đã được tạo nhưng không thể tạo link thanh toán. Vui lòng vào trang đơn hàng để thanh toán lại.');
          navigate(`/orders/${order.orderId}`);
          return;
        }
      }

      // Installment: giả lập thanh toán kỳ đầu thành công, không redirect VNPay
      if (paymentMethod === 'installment') {
        await clearCart();
        setIsProcessing(false);
        alert(`Đặt hàng trả góp thành công!\nKỳ đầu tiên sẽ được thanh toán theo lịch. Cảm ơn bạn đã mua sắm.`);
        navigate(`/orders/${order.orderId}`);
        return;
      }

      // For COD, just show success and redirect
      setIsProcessing(false);
      alert('Đơn hàng đã được đặt thành công! Cảm ơn bạn đã mua sắm.');
      await clearCart();
      navigate('/orders');
      
    } catch (error: any) {
      setIsProcessing(false);
      console.error('Order error:', error);
      alert(error.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 font-['Jost']">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Form */}
        <div className="flex-1">
          <h1 className="text-4xl font-light uppercase tracking-tight text-black mb-10">
            Thanh <span className="font-bold">Toán</span>
          </h1>

          <form onSubmit={handlePlaceOrder} className="space-y-12">
            {/* Shipping Info */}
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 border-b border-gray-100 pb-2">Thông tin giao hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Họ và tên</label>
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="w-full bg-gray-50 border-none p-4 text-sm rounded-xl focus:ring-1 focus:ring-black outline-none transition"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Số điện thoại</label>
                  <input 
                    type="tel" 
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                    className="w-full bg-gray-50 border-none p-4 text-sm rounded-xl focus:ring-1 focus:ring-black outline-none transition"
                    placeholder="0901 234 567"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Địa chỉ nhận hàng</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    className="w-full bg-gray-50 border-none p-4 text-sm rounded-xl focus:ring-1 focus:ring-black outline-none transition"
                    placeholder="Số nhà, tên đường, phường/xã..."
                  />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 border-b border-gray-100 pb-2">Phương thức thanh toán</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-3 ${paymentMethod === 'cod' ? 'border-black bg-black text-white' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <span className="material-symbols-outlined">local_shipping</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Khi nhận hàng (COD)</span>
                  <span className="text-[10px] opacity-60">Thanh toán khi nhận hàng</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-3 ${paymentMethod === 'bank' ? 'border-black bg-black text-white' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <span className="material-symbols-outlined">account_balance</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Chuyển khoản</span>
                  <span className="text-[10px] opacity-60">Thanh toán qua VNPay</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('installment')}
                  className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-3 ${paymentMethod === 'installment' ? 'border-black bg-black text-white' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <span className="material-symbols-outlined">credit_card</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Trả góp 0%</span>
                  <span className="text-[10px] opacity-60">Chia nhỏ theo tháng</span>
                </button>
              </div>

              {/* Bank transfer info */}
              {paymentMethod === 'bank' && (
                <div className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-500 mt-0.5">info</span>
                    <div>
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">Thanh toán qua VNPay</p>
                      <p className="text-sm text-blue-600">
                        Sau khi đặt hàng, bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao dịch.
                        Hỗ trợ thẻ ATM nội địa, thẻ Visa/Mastercard và QR Code.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Installment Options */}
              {paymentMethod === 'installment' && (
                <div className="mt-8 p-8 bg-gray-50 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-500">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Chọn kỳ hạn trả góp</h4>

                  {installmentPackages.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Không có gói trả góp khả dụng.</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        {installmentPackages.map((pkg) => (
                          <button
                            key={pkg.packageId}
                            type="button"
                            onClick={() => setSelectedPackage(pkg)}
                            className={`py-4 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                              selectedPackage?.packageId === pkg.packageId
                                ? 'bg-black text-white'
                                : 'bg-white text-gray-400 border border-gray-100'
                            }`}
                          >
                            {pkg.durationMonths} Tháng
                            {pkg.interestRate > 0 && (
                              <span className="block text-[9px] mt-0.5 opacity-70">{pkg.interestRate}% lãi</span>
                            )}
                          </button>
                        ))}
                      </div>

                      {selectedPackage && (
                        <div className="space-y-3">
                          {downPaymentPercent > 0 ? (
                            <>
                              {/* Có down payment: kỳ 1 = down payment, kỳ 2..N+1 = monthly */}
                              <div className="flex items-center justify-between p-4 bg-black rounded-2xl">
                                <div>
                                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">
                                    Kỳ 1 — Trả trước ({downPaymentPercent}%) — Ngay hôm nay
                                  </p>
                                  <p className="text-xl font-black text-white">${downPayment.toFixed(2)}</p>
                                </div>
                                <span className="material-symbols-outlined text-gray-400">payments</span>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    Kỳ 2–{selectedPackage.durationMonths + 1} — Mỗi tháng tiếp theo
                                  </p>
                                  <p className="text-xl font-black text-black">${monthlyPayment}</p>
                                </div>
                                <div className="text-right">
                                  <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedPackage.interestRate === 0 ? 'text-emerald-500' : 'text-orange-500'}`}>
                                    Lãi suất {selectedPackage.interestRate}%
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">
                                    Đơn tối thiểu ${selectedPackage.minOrderAmount.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Không có down payment: kỳ 1 = monthly, thanh toán ngay */}
                              <div className="flex items-center justify-between p-4 bg-black rounded-2xl">
                                <div>
                                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">
                                    Kỳ 1 — Thanh toán ngay sau đặt hàng
                                  </p>
                                  <p className="text-xl font-black text-white">${monthlyPayment}</p>
                                </div>
                                <span className="material-symbols-outlined text-gray-400">credit_card</span>
                              </div>
                              {selectedPackage.durationMonths > 1 && (
                                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                                  <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                      Kỳ 2–{selectedPackage.durationMonths} — Mỗi tháng tiếp theo
                                    </p>
                                    <p className="text-xl font-black text-black">${monthlyPayment}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedPackage.interestRate === 0 ? 'text-emerald-500' : 'text-orange-500'}`}>
                                      Lãi suất {selectedPackage.interestRate}%
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                      Đơn tối thiểu ${selectedPackage.minOrderAmount.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {/* Warning */}
                          {totalPrice < selectedPackage.minOrderAmount && (
                            <p className="text-xs text-red-500 px-1">
                              ⚠ Đơn hàng chưa đạt giá trị tối thiểu ${selectedPackage.minOrderAmount.toLocaleString()} để áp dụng gói này.
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </section>

            <button 
              type="submit"
              disabled={isProcessing}
              className="w-full bg-black text-white py-6 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition rounded-2xl shadow-2xl shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing
                ? 'Đang xử lý...'
                : paymentMethod === 'bank'
                  ? 'Đặt hàng & Thanh toán VNPay'
                  : 'Xác nhận đặt hàng'
              }
            </button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-96">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 sticky top-32 shadow-2xl shadow-black/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black mb-8 border-b border-gray-50 pb-4">Đơn hàng của bạn</h3>
            
            <div className="max-h-[300px] overflow-y-auto mb-8 space-y-4 pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-black truncate">{item.name}</h4>
                    <p className="text-[10px] text-gray-400">SL: {item.quantity}</p>
                  </div>
                  <p className="text-xs font-bold text-black">${(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-50">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tổng tiền hàng</span>
                <span className="font-bold text-black">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Phí vận chuyển</span>
                <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest">Miễn phí</span>
              </div>

              {/* Installment breakdown */}
              {paymentMethod === 'installment' && selectedPackage && (
                <div className="pt-3 border-t border-gray-50 space-y-2">
                  {downPaymentPercent > 0 ? (
                    <>
                      {/* Kỳ 1 = down payment, trả ngay */}
                      <div className="flex justify-between items-center py-2 px-3 bg-black rounded-xl">
                        <div>
                          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Kỳ 1 — Trả trước ({downPaymentPercent}%)</p>
                          <p className="text-[10px] text-gray-400">Thanh toán ngay hôm nay</p>
                        </div>
                        <span className="text-sm font-black text-white">${downPayment.toFixed(2)}</span>
                      </div>
                      {/* Kỳ 2..N+1 = monthly */}
                      <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Kỳ 2–{selectedPackage.durationMonths + 1} — Mỗi tháng
                          </p>
                          <p className="text-[10px] text-gray-400">Tháng tiếp theo trở đi</p>
                        </div>
                        <span className="text-sm font-black text-gray-700">${monthlyPayment}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Kỳ 1 = monthly, trả ngay */}
                      <div className="flex justify-between items-center py-2 px-3 bg-black rounded-xl">
                        <div>
                          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Kỳ 1 — Thanh toán ngay</p>
                          <p className="text-[10px] text-gray-400">Sau khi đặt hàng</p>
                        </div>
                        <span className="text-sm font-black text-white">${monthlyPayment}</span>
                      </div>
                      {selectedPackage.durationMonths > 1 && (
                        <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                              Kỳ 2–{selectedPackage.durationMonths} — Mỗi tháng
                            </p>
                            <p className="text-[10px] text-gray-400">Tháng tiếp theo trở đi</p>
                          </div>
                          <span className="text-sm font-black text-gray-700">${monthlyPayment}</span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="pt-2 border-t border-gray-100 flex justify-between items-end">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-black">Cần trả ngay</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {downPaymentPercent > 0
                          ? `Kỳ 1 — trả trước ${downPaymentPercent}%`
                          : `Kỳ 1 / ${selectedPackage.durationMonths} kỳ`}
                      </p>
                    </div>
                    <p className="text-2xl font-black text-amber-600 leading-none">${dueNow.toFixed(2)}</p>
                  </div>

                  {totalPrice < selectedPackage.minOrderAmount && (
                    <p className="text-xs text-red-500 px-1">
                      ⚠ Đơn chưa đạt tối thiểu ${selectedPackage.minOrderAmount.toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* COD / Bank full payment */}
              {paymentMethod !== 'installment' && (
                <div className="pt-4 border-t border-gray-50 flex justify-between items-end">
                  <span className="text-xs font-bold uppercase tracking-widest text-black">Tổng thanh toán</span>
                  <p className="text-2xl font-black text-black leading-none">${totalPrice.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
