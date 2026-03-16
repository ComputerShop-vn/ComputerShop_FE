// Payment Service
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { PaymentDTO } from '../types/payment';

export const paymentService = {
  // Create VNPay payment
  createPayment: async (orderId: number, bankCode?: string): Promise<PaymentDTO> => {
    const params = new URLSearchParams();
    params.append('orderId', orderId.toString());
    if (bankCode) {
      params.append('bankCode', bankCode);
    }

    const response = await apiClient.get<PaymentDTO>(
      `${API_ENDPOINTS.PAYMENT_CREATE}?${params.toString()}`,
      true
    );
    
    if (!response.result) {
      throw new Error('Failed to create payment');
    }
    return response.result;
  },

  // Redirect to VNPay payment URL
  redirectToPayment: (paymentUrl: string) => {
    window.location.href = paymentUrl;
  },
};
