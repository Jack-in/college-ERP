import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { QUERY_KEYS } from '../queryKeys';
import type {
  Institution,
  AcademicYear,
  Campus,
  Department,
  Branch,
  Program,
  CreateProgramParams
} from '../types/admin';

export const useInstitutions = () => {
  return useQuery({
    queryKey: QUERY_KEYS.institutions,
    queryFn: async (): Promise<Institution[]> => {
      const response = await apiClient.get('/institutions');
      return response.data;
    },
  });
};

export const useAcademicYears = (institutionId: number | null = null) => {
  return useQuery({
    queryKey: QUERY_KEYS.academicYears(institutionId!),
    queryFn: async (): Promise<AcademicYear[]> => {
      const response = await apiClient.get(`/academic-years/${institutionId}/academic-years`);
      return response.data;
    },
    enabled: !!institutionId,
  });
};

export const useCampuses = (institutionId: number | null = null) => {
  return useQuery({
    queryKey: QUERY_KEYS.campuses(institutionId!),
    queryFn: async (): Promise<Campus[]> => {
      const response = await apiClient.get(`/campuses/${institutionId}/campuses`);
      return response.data;
    },
    enabled: !!institutionId,
  });
};

export const useDepartments = (campusId: number | null = null) => {
  return useQuery({
    queryKey: QUERY_KEYS.departments(campusId!),
    queryFn: async (): Promise<Department[]> => {
      const response = await apiClient.get(`/departments/${campusId}/departments`);
      return response.data;
    },
    enabled: !!campusId,
  });
};

export const useBranches = (departmentId: number | null = null) => {
  return useQuery({
    queryKey: QUERY_KEYS.branches(departmentId!),
    queryFn: async (): Promise<Branch[]> => {
      const response = await apiClient.get(`/branches/${departmentId}/branches`);
      return response.data;
    },
    enabled: !!departmentId,
  });
};

export const useAllAcademicYears = () => {
  return useQuery({
    queryKey: ['academicYears', 'all'],
    queryFn: async (): Promise<AcademicYear[]> => {
      const response = await apiClient.get('/academic-years/all/academic-years');
      return response.data;
    },
  });
};

export const useAllCampuses = () => {
  return useQuery({
    queryKey: ['campuses', 'all'],
    queryFn: async (): Promise<Campus[]> => {
      const response = await apiClient.get('/campuses/all/campuses');
      return response.data;
    },
  });
};

export const useAllDepartments = () => {
  return useQuery({
    queryKey: ['departments', 'all'],
    queryFn: async (): Promise<Department[]> => {
      const response = await apiClient.get('/departments/all/departments');
      return response.data;
    },
  });
};

export const useAllBranches = () => {
  return useQuery({
    queryKey: ['branches', 'all'],
    queryFn: async (): Promise<Branch[]> => {
      const response = await apiClient.get('/branches/all/branches');
      return response.data;
    },
  });
};

export const useQuotas = () => {
  return useQuery({
    queryKey: QUERY_KEYS.quotas,
    queryFn: async (): Promise<{ id: string, name: string }[]> => {
      const response = await apiClient.get('/quotas');
      return response.data;
    },
  });
};


// Hierarchy Mutations
export const useCreateInstitution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string): Promise<Institution> => {
      const response = await apiClient.post('/institutions', { name });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.institutions }),
  });
};

export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { year: string; institutionId: number }): Promise<AcademicYear> => {
      const response = await apiClient.post('/academic-years/academic-years', params);
      return response.data;
    },
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.academicYears(variables.institutionId) }),
  });
};

export const useCreateCampus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { name: string; institutionId: number }): Promise<Campus> => {
      const response = await apiClient.post('/campuses/campuses', params);
      return response.data;
    },
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campuses(variables.institutionId) }),
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { name: string; campusId: number }): Promise<Department> => {
      const response = await apiClient.post('/departments/departments', params);
      return response.data;
    },
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.departments(variables.campusId) }),
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { name: string; departmentId: number }): Promise<Branch> => {
      const response = await apiClient.post('/branches/branches', params);
      return response.data;
    },
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.branches(variables.departmentId) }),
  });
};

// Programs
export const usePrograms = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: QUERY_KEYS.programs(filters),
    queryFn: async (): Promise<Program[]> => {
      const response = await apiClient.get('/programs', { params: filters });
      return response.data;
    },
  });
};

export const useCreateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateProgramParams): Promise<Program> => {
      const response = await apiClient.post('/programs', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.programs() });
    },
  });
};
