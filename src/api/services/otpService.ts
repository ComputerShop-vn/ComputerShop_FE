import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

export const otpService = {
  sendOtp: async (email: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.OTP_SEND, { email });
  },

  verifyOtp: async (email: string, otp: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.OTP_VERIFY, { email, otp: parseInt(otp) });
  },
};
