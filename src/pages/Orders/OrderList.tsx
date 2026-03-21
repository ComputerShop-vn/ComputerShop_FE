import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../api/services/orderService';
import { OrderResponse } from '../../api/types/order';
import { PagedResponse } from '../../api/types/common';
import Pagination from '../../components/ui/Pagination';

const fmt = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
const PAGE_SIZE = 10;

const statusLabel: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:   { label: 'Chờ xác nhận', bg: 'bg-yellow-100',  color: 'text-yellow-700' },
  CONFIRMED: { label: 'Đã xác nhận',  bg: 'bg-blue-100',    color: 'text-blue-700' },
  DELIVERED: { label: 'Đang giao',    bg: 'bg-purple-100',  color: 'text-purple-700' },
  COMPLETED: { label: 'Hoàn thành',   bg: 'bg-green-100',   color: 'text-green-700' },
  CANCELLED: { label: 'Đã hủy',       bg: 'bg-red-100',     color: 'text-red-600' },
  PAID:      { label: 'Đã thanh toán',bg: 'bg-emerald-100', color: 'text-emerald-700' },
  FAILED:    { label: 'Thất bại',     bg: 'bg-gray-100',    color: 'text-gray-500' },
};

const OrderList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pagedData, setPagedData] = useState<PagedResponse<OrderResponse> | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    orderService.getMyOrdersPaged({ page: currentPage, size: PAGE_SIZE })
      .then(data => { setPagedData(data); setOrders(data.content); })
      .catch(() => {
        orderService.getMyOrders()
          .then(data => {
            setOrders(data);
            setPagedData({ content: data, totalElements: data.length, totalPages: 1, size: data.length, number: 0 });
          })
          .catch(() => setError('Không thể tải danh sách đơn hàng.'));
      })
      .finally(() => setLoading(false));
  }, [user, navigate, currentPage]);

  if (loading) {
    return (
      <div className="bg-white min-h-[40vh] flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-['Jost']">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-light uppercase tracking-tight mb-10 text-black">
          Đơn hàng <span className="font-bold">của tôi</span>
        </h1>

        {error && <p className="mb-6 text-sm text-red-500">{error}</p>}

        {orders.length === 0 ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-6xl mb-4 block text-gray-200">receipt_long</span>
            <p className="text-sm uppercase tracking-widest text-gray-400">Bạn chưa có đơn hàng nào</p>
            <button onClick={() => navigate('/shop')}
              className="mt-8 px-8 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition text-white bg-black hover:bg-gray-800"
            >
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const st = statusLabel[order.status] ?? { label: order.status, bg: 'bg-gray-100', color: 'text-gray-500' };
              const date = order.orderDate || order.createdAt;
              return (
                <div key={order.orderId} onClick={() => navigate(`/orders/${order.orderId}`)}
                  className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 bg-white cursor-pointer transition-all hover:border-gray-300 hover:shadow-sm"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Đơn #{order.orderId}</p>
                    {date && (
                      <p className="text-sm text-gray-600">
                        {new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {order.paymentType === 'INSTALLMENT' ? 'Trả góp' : 'Thanh toán đầy đủ'}
                    </p>
                  </div>
                  <div className="flex items-center gap-5">
                    <p className="text-lg font-black text-black">{fmt(order.totalAmount)}</p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${st.bg} ${st.color}`}>
                      {st.label}
                    </span>
                    <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                  </div>
                </div>
              );
            })}
            {pagedData && pagedData.totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={pagedData.totalPages} onPageChange={setCurrentPage} className="pt-4" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
