import type { ProgramQuota } from './admin';

export interface Student {
  id: number;
  name: string;
  dob: string;
  age: number;
  sex: string;
  category: string;
  fatherName: string;
  email: string;
  phone: string;
  tenthPercentage: number;
  twelfthPercentage: number;
}

export interface FeePayment {
  id: number;
  amount: number;
  paid: boolean;
  paidAt: string;
}

export interface DocumentInfo {
  id: number;
  docType: string;
  status: 'pending' | 'submitted' | 'verified';
}

export interface Application {
  id: number;
  applicationId: string;
  admissionNo: string | null;
  currentStep: string;
  seatStatus: 'not_allocated' | 'allocated' | 'confirmed' | 'cancelled';
  draftData: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Relations dynamically populated based on currentStep progress
  programQuotaId: number | null;
  programQuota?: ProgramQuota & {
    program?: any; 
  };
  studentId: number | null;
  student?: Student;
  feePayment?: FeePayment;
  documents?: DocumentInfo[];
}

export interface AllocateSeatPayload {
  programQuotaId: number;
  studentDetails: {
    studentName: string;
    dob: string;
    age: string;
    sex: string;
    category: string;
    fatherName: string;
    email: string;
    phone: string;
    tenthPercentage: string;
    twelfthPercentage: string;
  };
}
