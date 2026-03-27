import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { orderService } from '../../api/services/orderService';
import { OrderResponse } from '../../api/types/order';
import Pagination from '../../components/ui/Pagination';
import { showToast } from '../../components/ui/Toast';
import { PagedResponse } from '../../api/types/common';

const fmt = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
const fmtDate = (d?: string) => d ? new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
const PAGE_SIZE = 10;

const STATUS_TABS = [
  { key: 'ALL',        label: 'Tất cả' },
  { key: 'PENDING',    label: 'Chờ xác nhận' },
  { key: 'CONFIRMED',  label: 'Đã xác nhận' },
  { key: 'PROCESSING', label: 'Đang xử lý' },
  { key: 'DELIVERED',  label: 'Đang giao' },
  { key: 'COMPLETED',  label: 'Hoàn thành' },
  { key: 'CANCELLED',  label: 'Đã hủy' },
] as const;

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  PENDING:    { label: 'Chờ xác nhận', color: 'bg-orange-100 text-orange-600' },
  CONFIRMED:  { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-600' },
  PROCESSING: { label: 'Đang xử lý',   color: 'bg-cyan-100 text-cyan-700' },
  DELIVERED:  { label: 'Đang giao',    color: 'bg-indigo-100 text-indigo-600' },
  COMPLETED:  { label: 'Hoàn thành',   color: 'bg-green-100 text-green-600' },
  CANCELLED:  { label: 'Đã hủy',       color: 'bg-red-100 text-red-600' },
};

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [pagedData, setPagedData] = useState<PagedResponse<OrderResponse> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

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
      setPagedData({ content, number: page, size: PAGE_SIZE, totalElements: all.length, totalPages: Math.ceil(all.length / PAGE_SIZE) });
    } catch {
      setError('Không thể tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(currentPage); }, [currentPage]);

  const updateStatus = async (orderId: number, status: string) => {
    try {
      await orderService.updateOrderStatus(orderId, { status });
      showToast('Cập nhật trạng thái đơn hàng thành công', 'success');
      fetchOrders(currentPage);
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
      alert(err.message || 'Không thể cập nhật trạng thái');
    }
  };

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || String(o.orderId).includes(q) ||
      (o.username || '').toLowerCase().includes(q) ||
      (o.items?.[0]?.recipientName || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const countByStatus = (key: string) => key === 'ALL' ? orders.length : orders.filter(o => o.status === key).length;

  return (
    <AdminLayout title="Quản Lý Đơn Hàng" subtitle="Theo dõi và cập nhật trạng thái đơn hàng của khách hàng." requiredRole="staff">
      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 mb-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-gray-300">search</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
          className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-300"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setCurrentPage(0); }}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition ${
              statusFilter === tab.key
                ? 'bg-green-500 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 opacity-70">({countByStatus(tab.key)})</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
          {error}
          <button onClick={() => fetchOrders(currentPage)} className="ml-3 underline text-xs">Thử lại</button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-200 block mb-3">shopping_cart</span>
              <p className="text-gray-400 text-sm">Không có đơn hàng nào.</p>
            </div>
          ) : filtered.map(order => {
            const st = STATUS_CFG[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-500' };
            const isInstallment = order.paymentMode === 'INSTALLMENT' || order.paymentType === 'INSTALLMENT';
            const firstItem = order.items?.[0] as any;
            const recipientName = order.recipientName || firstItem?.recipientName;
            const recipientPhone = order.recipientPhone || firstItem?.recipientPhone;
            const shippingAddress = order.shippingAddress || firstItem?.shippingAddress;

            return (
              <div key={order.orderId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
                {/* Card header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-gray-400 text-lg">receipt_long</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-blue-600">Đơn hàng #{order.orderId}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${st.color}`}>
                          {st.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Đặt lúc: {fmtDate(order.orderDate || order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Tổng tiền</p>
                      <p className="text-base font-black text-green-600">{fmt(order.totalAmount)}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/staff/orders/${order.orderId}`)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                      title="Xem chi tiết"
                    >
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shipping */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Thông tin giao hàng</p>
                    {recipientName ? (
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-gray-900">{recipientName}</p>
                        <p className="text-xs text-gray-500">{recipientPhone}</p>
                        <p className="text-xs text-gray-400">{shippingAddress}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-300 italic">Chưa có thông tin</p>
                    )}
                  </div>

                  {/* Products */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      Sản phẩm ({order.items?.length ?? 0})
                    </p>
                    <div className="space-y-1">
                      {(order.items ?? []).slice(0, 2).map(item => (
                        <div key={item.orderItemId} className="flex justify-between text-xs">
                          <span className="text-gray-700 truncate max-w-[200px]">{item.productName} x{item.quantity}</span>
                          <span className="font-bold text-gray-900 flex-shrink-0 ml-2">{fmt(item.subtotal)}</span>
                        </div>
                      ))}
                      {(order.items?.length ?? 0) > 2 && (
                        <p className="text-xs text-gray-400">+{(order.items?.length ?? 0) - 2} sản phẩm khác</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-50 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${isInstallment ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {isInstallment ? 'Trả góp' : 'Đầy đủ'}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                      {order.paymentMethod === 'COD' ? 'COD' : 'VNPay'}
                    </span>
                    <span className="text-xs text-gray-400">KH: {order.username || `ID ${order.userId}`}</span>
                  </div>
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order.orderId, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-gray-200 bg-white outline-none focus:ring-1 focus:ring-green-400 cursor-pointer text-gray-600"
                  >
                    <option value="PENDING">Chờ xác nhận</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="PROCESSING">Đang xử lý</option>
                    <option value="DELIVERED">Đang giao</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>
              </div>
            );
          })}

          {pagedData && pagedData.totalPages > 1 && (
            <div className="pt-4">
              <Pagination currentPage={currentPage} totalPages={pagedData.totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
