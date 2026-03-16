import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // HashRouter puts query params after the hash: /#/payment-callback?vnp_...
    // useSearchParams handles this correctly in react-router v6 with HashRouter
    const responseCode = searchParams.get('vnp_ResponseCode');
    const transactionStatus = searchParams.get('vnp_TransactionStatus');
    const txnRef = searchParams.get('vnp_TxnRef');

    // Extract orderId from txnRef — BE format: "XXXXXXXX_orderId"
    let extractedOrderId: string | null = null;
    if (txnRef) {
      const parts = txnRef.split('_');
      if (parts.length >= 2) {
        extractedOrderId = parts[parts.length - 1];
        setOrderId(extractedOrderId);
      }
    }

    const isSuccessPath = location.pathname.includes('payment-success');
    const isFailedPath = location.pathname.includes('payment-failed');
    // VNPay success: responseCode === '00' AND transactionStatus === '00'
    const isVnPaySuccess = responseCode === '00' && transactionStatus === '00';
    const isVnPayFailed = responseCode !== null && responseCode !== '00';

    if (isSuccessPath || isVnPaySuccess) {
      setStatus('success');
      clearCart().catch(console.error);
      setTimeout(() => {
        navigate(extractedOrderId ? `/orders/${extractedOrderId}` : '/orders', { replace: true });
      }, 3000);
    } else if (isFailedPath || isVnPayFailed) {
      setStatus('failed');
      setTimeout(() => {
        navigate('/cart', { replace: true });
      }, 3000);
    }
    // If no VNPay params yet, stay in 'processing' briefly then check again
  }, [searchParams, location.pathname]);

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
