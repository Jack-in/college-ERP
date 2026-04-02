import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { QUERY_KEYS } from '../queryKeys';
import type {
  Application,
  AllocateSeatPayload
} from '../types/admission';

// Fetch all applications
export const useApplications = (filters?: { search?: string; department?: string; quota?: string; academicYear?: string; docStatus?: string; seatStatus?: string }) => {
  return useQuery({
    queryKey: [QUERY_KEYS.applications, filters],
    queryFn: async (): Promise<Application[]> => {
      const response = await apiClient.get('/applications', { params: filters });
      return response.data;
    },
  });
};

// Fetch a single application by ID
export const useApplication = (applicationId: string | null) => {
  return useQuery({
    queryKey: QUERY_KEYS.application(applicationId as string),
    queryFn: async (): Promise<Application> => {
      const response = await apiClient.get(`/applications/${applicationId}`);
      return response.data;
    },
    enabled: !!applicationId,
  });
};

// Create a new application (Start stepper)
export const useCreateApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<Application> => {
      const response = await apiClient.post('/applications');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.applications });
    }
  });
};

// Update draft data (intermediate steps)
export const useUpdateDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ applicationId, currentStep, draftData }: { applicationId: string; currentStep: string; draftData: any }): Promise<Application> => {
      const response = await apiClient.patch(`/applications/${applicationId}/draft`, { currentStep, draftData });
      return response.data;
    },
    onSuccess: (data, { applicationId }) => {
      queryClient.setQueryData(QUERY_KEYS.application(applicationId), data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.application(applicationId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.applications });
    },
  });
};

// Allocate a seat (Step 3)
export const useAllocateSeat = (applicationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AllocateSeatPayload): Promise<Application> => {
      const response = await apiClient.post(`/applications/${applicationId}/allocate-seat`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.application(applicationId), data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.application(applicationId) });
    },
  });
};

// Cancel allocation
export const useCancelAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string): Promise<{ success: boolean; message: string }> => {
      const response = await apiClient.patch(`/applications/${applicationId}/cancel-allocation`);
      return response.data;
    },
    onSuccess: (_, applicationId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.application(applicationId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.applications });
    },
  });
};

// Record Fee Payment (Step 4)
export const useRecordFee = (applicationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { amount: number }): Promise<Application> => {
      const response = await apiClient.post(`/applications/${applicationId}/fee`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.application(applicationId), data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.application(applicationId) });
    },
  });
};

// Update Documents (Step 5)
export const useUpdateDocuments = (applicationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (docStatuses: Record<string, string>): Promise<any[]> => {
      const response = await apiClient.patch(`/applications/${applicationId}/documents`, { docStatuses });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.application(applicationId) });
    },
  });
};
