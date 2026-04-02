import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { QUERY_KEYS } from '../queryKeys';

export interface DashboardStats {
  overview: {
    totalApplications: number;
    totalSeats: number;
    admitted: number;
    allocated: number;
    notAllocated: number;
    cancelled: number;
    remainingSeats: number;
  };
  quotaStats: {
    quota: string;
    total: number;
    filled: number;
    remaining: number;
  }[];
  pendingDocApplicants: {
    applicationId: string;
    admissionNo: string | null;
    name: string;
    seatStatus: string;
    docCount: number;
    pendingCount: number;
    submittedCount: number;
    verifiedCount: number;
  }[];
  feePendingList: {
    applicationId: string;
    admissionNo: string | null;
    name: string;
    seatStatus: string;
    quota: string;
    department: string;
    feeAmount: number;
  }[];
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.dashboardStats,
    queryFn: async (): Promise<DashboardStats> => {
      const response = await apiClient.get('/dashboard/stats');
      return response.data;
    },
    refetchInterval: 30000, // auto-refresh every 30s
  });
};
