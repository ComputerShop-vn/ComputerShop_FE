// Order API Types

export interface OrderItemResponse {
  orderItemId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  // Variant info
  variantId: number;
  variantName?: string;
  sku?: string;
  // Product info
  productId: number;
  productName?: string;
  thumbnailUrl?: string;
  // Shipping info
  recipientName?: string;
  recipientPhone?: string;
  shippingAddress?: string;
  // ProductItem info
  serialNumber?: string;
}

export interface PaymentScheduleResponse {
  scheduleId: number;
  installmentNo?: number;
  dueDate: string;
  amount: number;
  status: string; // PENDING, UNPAID, PAID, OVERDUE
  paidDate?: string;
  vnpTransactionNo?: string;
}

export interface OrderResponse {
  orderId: number;
  userId: number;
  username?: string;
  totalAmount: number;
  status: string; // PENDING, CONFIRMED, DELIVERED, COMPLETED, CANCELLED, PAID, FAILED
  paymentType: string; // FULL, INSTALLMENT
  orderDate?: string;
  items?: OrderItemResponse[];
  payments?: PaymentScheduleResponse[];
  paymentUrl?: string;
  // Backward compatibility
  userName?: string;
  userEmail?: string;
  createdAt?: string;
  recipientName?: string;
  recipientPhone?: string;
  shippingAddress?: string;
  notes?: string;
  updatedAt?: string;
}

export interface PlaceOrderRequest {
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  paymentType: 'FULL' | 'INSTALLMENT';
  packageId?: number; // Only for INSTALLMENT
}

export interface UpdateOrderStatusRequest {
  status: string; // PENDING, CONFIRMED, DELIVERED, COMPLETED, CANCELLED, PAID, FAILED
}
