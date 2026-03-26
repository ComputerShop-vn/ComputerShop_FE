import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../api/services/orderService';
import { OrderResponse } from '../../api/types/order';
import { PagedResponse } from '../../api/types/common';
import Pagination from '../../components/ui/Pagination';

const fmt = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const PAGE_SIZE = 10;

const statusLabel: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-700' },
  DELIVERED: { label: 'Đang giao',    color: 'bg-purple-100 text-purple-700' },
  COMPLETED: { label: 'Hoàn thành',   color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Đã hủy',       color: 'bg-red-100 text-red-700' },
  PAID:      { label: 'Đã thanh toán',color: 'bg-emerald-100 text-emerald-700' },
  FAILED:    { label: 'Thất bại',     color: 'bg-gray-100 text-gray-500' },
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
    const load = async () => {
      try {
        try {
          const data = await orderService.getMyOrdersPaged({ page: currentPage, size: PAGE_SIZE });
          setPagedData(data);
          setOrders(data.content);
        } catch {
          const data = await orderService.getMyOrders();
          setOrders(data);
          setPagedData({ content: data, totalElements: data.length, totalPages: 1, size: data.length, number: 0 });
        }
      } catch {
        setError('Không thể tải danh sách đơn hàng.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, navigate, currentPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-['Jost']">
      <h1 className="text-4xl font-light uppercase tracking-tight text-black mb-10">
        Đơn hàng <span className="font-bold">của tôi</span>
      </h1>

      {error && <p className="text-red-500 mb-6">{error}</p>}

      {orders.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <span className="material-symbols-outlined text-6xl mb-4 block">receipt_long</span>
          <p className="text-sm uppercase tracking-widest">Bạn chưa có đơn hàng nào</p>
          <button
            onClick={() => navigate('/shop')}
            className="mt-8 px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition"
          >
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const st = statusLabel[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-500' };
            const date = order.orderDate || order.createdAt;
            const isInstallmentOrder =
              order.paymentType === 'INSTALLMENT' || (order as any).paymentMode === 'INSTALLMENT';
            return (
              <div
                key={order.orderId}
                onClick={() => navigate(`/orders/${order.orderId}`)}
                className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Đơn #{order.orderId}
                  </p>
                  {date && (
                    <p className="text-sm text-gray-500">
                      {new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    {isInstallmentOrder ? 'Trả góp' : 'Thanh toán đầy đủ'}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <p className="text-lg font-black text-black">
                    {fmt(order.totalAmount)}
                  </p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${st.color}`}>
                    {st.label}
                  </span>
                  <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                </div>
              </div>
            );
          })}
          {pagedData && pagedData.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagedData.totalPages}
              onPageChange={setCurrentPage}
              className="pt-4"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default OrderList;
