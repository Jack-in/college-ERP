export interface Institution {
  id: number;
  name: string;
}

export interface AcademicYear {
  id: number;
  year: string;
}

export interface Campus {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface Branch {
  id: number;
  name: string;
}

export interface ProgramQuota {
  id: number;
  quotaName: string;
  totalSeats: number;
  occupiedSeats: number;
  feeAmount: number;
  programId: number;
}

export interface Program {
  id: number;
  courseType: string;
  entryType: string;
  campusId: number;
  departmentId: number;
  branchId: number;
  academicYearId: number;
  quotas: ProgramQuota[];
  campus?: Campus & {
    institution?: Institution;
  };
  department?: Department;
  branch?: Branch;
  academicYear?: AcademicYear;
}

export interface CreateProgramParams {
  institutionName: string;
  academicYear: string;
  campusName: string;
  departmentName: string;
  branchName: string;
  courseType: string;
  entryType: string;
  quotas: {
    quotaName: string;
    totalSeats: number;
    feeAmount: number;
  }[];
}
