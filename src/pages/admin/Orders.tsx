import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { orderService } from '../../api/services/orderService';
import { OrderResponse } from '../../api/types/order';
import { PagedResponse } from '../../api/types/common';
import Pagination from '../../components/ui/Pagination';

const fmt = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const PAGE_SIZE = 10;

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Chờ xác nhận', color: 'bg-orange-100 text-orange-600' },
  CONFIRMED: { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-600' },
  DELIVERED: { label: 'Đang giao',    color: 'bg-indigo-100 text-indigo-600' },
  COMPLETED: { label: 'Hoàn thành',   color: 'bg-green-100 text-green-600' },
  CANCELLED: { label: 'Đã hủy',       color: 'bg-red-100 text-red-600' },
  PAID:      { label: 'Đã thanh toán',color: 'bg-emerald-100 text-emerald-600' },
  FAILED:    { label: 'Thất bại',     color: 'bg-red-100 text-red-600' },
};

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const [pagedData, setPagedData] = useState<PagedResponse<OrderResponse> | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'FULL' | 'INSTALLMENT'>('ALL');

  const fetchOrders = async (page = currentPage) => {
    setLoading(true);
    setError(null);
    try {
      try {
        const data = await orderService.getAllOrdersPaged({ page, size: PAGE_SIZE });
        setPagedData(data);
        setOrders(data.content);
        return;
      } catch { /* fallback */ }

      const all = await orderService.getAllOrders();
      const start = page * PAGE_SIZE;
      const content = all.slice(start, start + PAGE_SIZE);
      setOrders(content);
      setPagedData({
        content,
        number: page,
        size: PAGE_SIZE,
        totalElements: all.length,
        totalPages: Math.ceil(all.length / PAGE_SIZE),
      });
    } catch {
      setError('Không thể tải danh sách đơn hàng. Vui lòng kiểm tra quyền truy cập.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(currentPage); }, [currentPage]);

  const updateStatus = async (orderId: number, status: string) => {
    try {
      await orderService.updateOrderStatus(orderId, { status });
      fetchOrders(currentPage);
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '-';
  const filtered = filter === 'ALL'
    ? orders
    : filter === 'FULL'
      ? orders.filter(o => o.paymentMode === 'FULL' || o.paymentMethod === 'COD' || o.paymentType === 'FULL' || o.paymentType === 'COD')
      : orders.filter(o => o.paymentMode === 'INSTALLMENT' || o.paymentType === 'INSTALLMENT');

  return (
    <AdminLayout
      title="Quản Lý Đơn Hàng"
      subtitle="Theo dõi và cập nhật trạng thái đơn hàng của khách hàng."
      requiredRole="staff"
    >
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['ALL', 'FULL', 'INSTALLMENT'] as const).map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setCurrentPage(0); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-300'
            }`}
          >
            {f === 'ALL' ? 'Tất cả' : f === 'FULL' ? 'Thanh toán đủ' : 'Trả góp'}
            <span className="ml-1.5 opacity-70">
              ({f === 'ALL'
                ? orders.length
                : f === 'FULL'
                  ? orders.filter(o => o.paymentMode === 'FULL' || o.paymentMethod === 'COD' || o.paymentType === 'FULL' || o.paymentType === 'COD').length
                  : orders.filter(o => o.paymentMode === 'INSTALLMENT' || o.paymentType === 'INSTALLMENT').length
              })
            </span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => fetchOrders(currentPage)} className="text-xs underline mt-2">Thử lại</button>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Mã đơn</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Khách hàng</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Ngày đặt</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Giá trị đơn</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Thanh toán</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Trạng thái</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order) => {
                const st = statusConfig[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600' };
                const isInstallment =
                  order.paymentType === 'INSTALLMENT' || (order as any).paymentMode === 'INSTALLMENT';

                return (
                  <tr key={order.orderId} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <span className="text-xs font-bold text-blue-600">#{order.orderId}</span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-900">{order.username || order.userName || 'N/A'}</p>
                      <p className="text-xs text-gray-400">ID: {order.userId}</p>
                    </td>
                    <td className="p-4 text-xs text-gray-500">{formatDate(order.orderDate || order.createdAt)}</td>

                    <td className="p-4">
                      <p className="text-sm font-black text-gray-900">{fmt(order.totalAmount)}</p>
                    </td>

                    <td className="p-4">
                      {isInstallment ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[9px] font-bold uppercase tracking-widest mb-1">
                            <span className="material-symbols-outlined text-xs">credit_card</span>
                            Trả góp
                          </span>
                          <p className="text-xs text-gray-400">Đang trả góp</p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[9px] font-bold uppercase tracking-widest">
                          <span className="material-symbols-outlined text-xs">payments</span>
                          Đầy đủ
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.orderId, e.target.value)}
                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border-none focus:ring-0 cursor-pointer ${st.color}`}
                      >
                        <option value="PENDING">Chờ xác nhận</option>
                        <option value="CONFIRMED">Đã xác nhận</option>
                        <option value="DELIVERED">Đang giao</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="CANCELLED">Đã hủy</option>
                        <option value="PAID">Đã thanh toán</option>
                        <option value="FAILED">Thất bại</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => navigate(`/staff/orders/${order.orderId}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Xem chi tiết"
                      >
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-200 block mb-4">shopping_cart</span>
                    <p className="text-gray-500 text-sm">Chưa có đơn hàng nào.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {pagedData && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Tổng {pagedData.totalElements} đơn hàng
              </p>
              <Pagination
                currentPage={currentPage}
                totalPages={pagedData.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
