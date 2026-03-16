import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { orderService } from '../../api/services/orderService';
import { OrderResponse } from '../../api/types/order';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrderById(Number(id));
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load order details');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!order) return;
    try {
      await orderService.updateOrderStatus(order.orderId, { status });
      fetchOrderDetail();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'bg-orange-100 text-orange-600';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-600';
      case 'DELIVERED': return 'bg-indigo-100 text-indigo-600';
      case 'COMPLETED': return 'bg-green-100 text-green-600';
      case 'CANCELLED': return 'bg-red-100 text-red-600';
      case 'PAID': return 'bg-emerald-100 text-emerald-600';
      case 'FAILED': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID': return 'bg-green-100 text-green-600';
      case 'PENDING': return 'bg-yellow-100 text-yellow-600';
      case 'UNPAID': return 'bg-orange-100 text-orange-600';
      case 'OVERDUE': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (loading) {
    return (
      <AdminLayout title="Chi Tiết Đơn Hàng" requiredRole="staff">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout title="Chi Tiết Đơn Hàng" requiredRole="staff">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm font-medium">{error || 'Order not found'}</p>
          <button onClick={() => navigate('/admin/orders')} className="text-xs underline mt-2 hover:text-red-800">
            Quay lại danh sách
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title={`Đơn Hàng #${order.orderId}`}
      subtitle="Chi tiết thông tin đơn hàng"
      requiredRole="staff"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Quay lại</span>
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Trạng thái:</span>
            <select 
              value={order.status}
              onChange={(e) => updateStatus(e.target.value)}
              className={`text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-full border-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${getStatusColor(order.status)}`}
            >
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="DELIVERED">Đang giao</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="FAILED">Thất bại</option>
            </select>
          </div>
        </div>

        {/* Order Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Thông tin khách hàng</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Tên khách hàng</p>
                <p className="text-sm font-bold text-gray-900">{order.username || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">User ID</p>
                <p className="text-sm font-bold text-gray-900">{order.userId}</p>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Thông tin đơn hàng</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Ngày đặt</p>
                <p className="text-sm font-bold text-gray-900">{formatDate(order.orderDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Hình thức thanh toán</p>
                <p className="text-sm font-bold text-gray-900">{order.paymentType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tổng tiền</p>
                <p className="text-lg font-black text-blue-600">{formatCurrency(order.totalAmount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        {order.items && order.items.length > 0 && order.items[0].recipientName && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Thông tin giao hàng</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Người nhận</p>
                <p className="text-sm font-bold text-gray-900">{order.items[0].recipientName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Số điện thoại</p>
                <p className="text-sm font-bold text-gray-900">{order.items[0].recipientPhone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Địa chỉ</p>
                <p className="text-sm font-bold text-gray-900">{order.items[0].shippingAddress}</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Sản phẩm</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Sản phẩm</th>
                <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">SKU</th>
                <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Serial</th>
                <th className="p-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Đơn giá</th>
                <th className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">SL</th>
                <th className="p-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {order.items?.map((item) => (
                <tr key={item.orderItemId} className="hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {item.thumbnailUrl && (
                        <img 
                          src={item.thumbnailUrl} 
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                        />
                      )}
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.productName}</p>
                        <p className="text-xs text-gray-500">{item.variantName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-gray-600">{item.sku || '-'}</td>
                  <td className="p-4 text-xs text-gray-600">{item.serialNumber || '-'}</td>
                  <td className="p-4 text-sm font-bold text-gray-900 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="p-4 text-sm font-bold text-gray-900 text-center">{item.quantity}</td>
                  <td className="p-4 text-sm font-black text-blue-600 text-right">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Schedule (for INSTALLMENT) */}
        {order.paymentType === 'INSTALLMENT' && order.payments && order.payments.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Lịch thanh toán trả góp</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Kỳ</th>
                  <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Ngày đến hạn</th>
                  <th className="p-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Số tiền</th>
                  <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Trạng thái</th>
                  <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Ngày thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {order.payments.map((payment, index) => (
                  <tr key={payment.scheduleId} className="hover:bg-gray-50/50">
                    <td className="p-4 text-sm font-bold text-gray-900">Kỳ {index + 1}</td>
                    <td className="p-4 text-sm text-gray-600">{formatDate(payment.dueDate)}</td>
                    <td className="p-4 text-sm font-black text-gray-900 text-right">{formatCurrency(payment.amount)}</td>
                    <td className="p-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${getPaymentStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{formatDate(payment.paidDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrderDetail;
