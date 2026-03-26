import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { paymentService } from '../api/services/paymentService';

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const orderIdQuery = searchParams.get('orderId');
    const installmentNoQuery = searchParams.get('installmentNo');

    const isSuccessPath = location.pathname.includes('payment-success');
    const isFailedPath = location.pathname.includes('payment-failed');

    const orderIdFromPath = orderIdQuery ? Number(orderIdQuery) : null;
    const installmentNo =
      installmentNoQuery !== null && installmentNoQuery !== '' ? Number(installmentNoQuery) : undefined;

    const isPaymentSuccess = (s: unknown): boolean => {
      const v = String(s ?? '').trim().toLowerCase();
      return ['success', 'paid', 'completed', 'ok', '00', 'true', '1'].includes(v);
    };

    if (orderIdFromPath) {
      setOrderId(String(orderIdFromPath));
      (async () => {
        try {
          setStatus('processing');
          // BE cập nhật trạng thái qua IPN, có thể trễ so với callback redirect.
          for (let attempt = 1; attempt <= 6; attempt++) {
            const result = await paymentService.getPaymentResult(orderIdFromPath, installmentNo);
            if (isPaymentSuccess(result.status)) {
              setStatus('success');
              await clearCart().catch(console.error);
              setTimeout(() => {
                navigate(`/orders/${orderIdFromPath}`, { replace: true });
              }, 1200);
              return;
            }
            if (attempt < 6) {
              await new Promise(res => setTimeout(res, 1500));
            }
          }
          setStatus('failed');
          setTimeout(() => navigate('/cart', { replace: true }), 1200);
        } catch (err) {
          // Fallback if payment-result endpoint fails unexpectedly.
          if (isSuccessPath) {
            setStatus('success');
            clearCart().catch(console.error);
            setTimeout(() => navigate(`/orders/${orderIdFromPath}`, { replace: true }), 1500);
          } else {
            setStatus('failed');
            setTimeout(() => navigate('/cart', { replace: true }), 1500);
          }
        }
      })();
      return;
    }

    if (isSuccessPath) {
      setStatus('success');
      clearCart().catch(console.error);
      setTimeout(() => navigate('/orders', { replace: true }), 1500);
    } else if (isFailedPath) {
      setStatus('failed');
      setTimeout(() => navigate('/cart', { replace: true }), 1500);
    }
  }, [searchParams, location.pathname, navigate, clearCart]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-['Jost']">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-6" />
            <h2 className="text-xl font-light uppercase tracking-widest text-black mb-2">Đang xử lý</h2>
            <p className="text-gray-400 text-sm">Vui lòng chờ...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
            </div>
            <h2 className="text-xl font-light uppercase tracking-widest text-black mb-2">Thanh toán thành công</h2>
            <p className="text-gray-400 text-sm mb-6">Cảm ơn bạn đã mua hàng!</p>
            <p className="text-xs text-gray-300 uppercase tracking-widest">Đang chuyển đến đơn hàng...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl text-red-500">cancel</span>
            </div>
            <h2 className="text-xl font-light uppercase tracking-widest text-black mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-400 text-sm mb-6">Giao dịch không thành công. Vui lòng thử lại.</p>
            <p className="text-xs text-gray-300 uppercase tracking-widest">Đang quay về giỏ hàng...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
