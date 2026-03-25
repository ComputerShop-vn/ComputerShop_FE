import { apiClient } from '../client';
import { API_ENDPOINTS, API_VERSION } from '../config';
import { GroupBy, RevenueTimeResponse, RevenueProductResponse, RevenueInstallmentResponse } from '../types/report';

export interface RevenueTimeParams {
  fromDate?: string;
  toDate?: string;
  groupBy?: GroupBy;
}

export interface RevenueProductParams {
  fromDate?: string;
  toDate?: string;
  limit?: number;
}

export const reportService = {
  getRevenueTime: async (params: RevenueTimeParams = {}): Promise<RevenueTimeResponse> => {
    const q = new URLSearchParams();
    if (params.fromDate) q.set('fromDate', params.fromDate);
    if (params.toDate) q.set('toDate', params.toDate);
    if (params.groupBy) q.set('groupBy', params.groupBy);
    const url = `${API_ENDPOINTS.REPORTS_REVENUE_TIME}${q.toString() ? '?' + q : ''}`;
    const res = await apiClient.get<RevenueTimeResponse>(url, true);
    return res.result!;
  },

  getRevenueProduct: async (params: RevenueProductParams = {}): Promise<RevenueProductResponse> => {
    const q = new URLSearchParams();
    if (params.fromDate) q.set('fromDate', params.fromDate);
    if (params.toDate) q.set('toDate', params.toDate);
    if (params.limit) q.set('limit', String(params.limit));
    const url = `${API_ENDPOINTS.REPORTS_REVENUE_PRODUCT}${q.toString() ? '?' + q : ''}`;
    const res = await apiClient.get<RevenueProductResponse>(url, true);
    return res.result!;
  },

  getRevenueInstallment: async (): Promise<RevenueInstallmentResponse> => {
    const res = await apiClient.get<RevenueInstallmentResponse>(API_ENDPOINTS.REPORTS_REVENUE_INSTALLMENT, true);
    return res.result!;
  },

  exportRevenueTime: (params: RevenueTimeParams = {}) => {
    const q = new URLSearchParams();
    if (params.fromDate) q.set('fromDate', params.fromDate);
    if (params.toDate) q.set('toDate', params.toDate);
    if (params.groupBy) q.set('groupBy', params.groupBy);
    window.open(`${API_VERSION}/reports/revenue/time/export${q.toString() ? '?' + q : ''}`, '_blank');
  },

  exportRevenueProduct: (params: RevenueProductParams = {}) => {
    const q = new URLSearchParams();
    if (params.fromDate) q.set('fromDate', params.fromDate);
    if (params.toDate) q.set('toDate', params.toDate);
    if (params.limit) q.set('limit', String(params.limit));
    window.open(`${API_VERSION}/reports/revenue/product/export${q.toString() ? '?' + q : ''}`, '_blank');
  },

  exportRevenueInstallment: () => {
    window.open(`${API_VERSION}/reports/revenue/installment/export`, '_blank');
  },
};
