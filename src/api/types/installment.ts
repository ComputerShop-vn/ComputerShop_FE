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

export interface InstallmentCalculateRequest {
  packageId: number;
  orderAmount: number;
}

export interface InstallmentScheduleItem {
  installmentNo: number;
  dueDate: string;
  amount: number;
  status?: string;
}

export interface InstallmentPreviewResponse {
  packageId: number;
  durationMonths: number;
  interestRate: number;
  downPaymentPercentage: number;
  downPaymentAmount: number;
  monthlyInstallmentAmount: number;
  totalPayableAmount: number;
  schedule: InstallmentScheduleItem[];
}
