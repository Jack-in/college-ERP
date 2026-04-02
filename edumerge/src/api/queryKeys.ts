export const QUERY_KEYS = {
  // Admin Hierarchy
  institutions: ['institutions'] as const,
  academicYears: (institutionId: number) => ['academicYears', institutionId] as const,
  campuses: (institutionId: number) => ['campuses', institutionId] as const,
  departments: (campusId: number) => ['departments', campusId] as const,
  branches: (departmentId: number) => ['branches', departmentId] as const,

  // Admin Programs
  programs: (filters?: Record<string, any>) => ['programs', filters || {}] as const,

  // Applications
  applications: ['applications'] as const,
  application: (id: string) => ['application', id] as const,

  // Management Dashboard
  dashboardStats: ['dashboard', 'stats'] as const,

  // Quotas
  quotas: ['quotas'] as const,
};
