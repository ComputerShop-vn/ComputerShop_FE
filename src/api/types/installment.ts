// Installment Package API Types

export interface InstallmentPackageResponse {
  packageId: number;
  name: string;
  durationMonths: number;
  interestRate: number;
  minOrderAmount: number;
  maxOrderAmount?: number;
  downPaymentPercent?: number; // % trả trước (0 nếu không có)
  description?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InstallmentPackageRequest {
  name: string;
  durationMonths: number;
  interestRate: number;
  minOrderAmount: number;
  maxOrderAmount?: number;
  downPaymentPercent?: number;
  description?: string;
  isActive?: boolean;
}
