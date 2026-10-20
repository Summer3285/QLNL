export type UserRole = 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  isActive: boolean;
  createdAt: string;
  employeeId?: string;
  profile?: EmployeeProfile;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  location?: string;
  budget?: number;
  managerId?: string;
  manager?: {
    id: string;
    employeeCode: string;
    fullName: string;
    position: string;
    phone?: string;
    avatarUrl?: string;
  };
  deputyId?: string;
  deputy?: {
    id: string;
    employeeCode: string;
    fullName: string;
    position: string;
    phone?: string;
    avatarUrl?: string;
  };
  sortOrder: number;
  totalEmployees?: number;
  leadershipCount?: number;
  staffCount?: number;
  totalSalaryMonthly?: number;
  leadership?: EmployeeProfile[];
  staff?: EmployeeProfile[];
  employees?: EmployeeProfile[];
}

export interface Contract {
  id: string;
  contractNumber: string;
  employeeId: string;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
    department?: string;
    position?: string;
    phone?: string;
    avatarUrl?: string;
  };
  contractType: 'PROBATION' | 'DEFINITE_1Y' | 'DEFINITE_3Y' | 'INDEFINITE' | 'SEASONAL' | string;
  jobTitle?: string;
  startDate: string;
  endDate?: string | null;
  signedDate: string;
  salaryInsurance: number;
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | string;
  workingTime?: string;
  note?: string;
  daysRemaining?: number | null;
  isExpiringSoon?: boolean;
  createdAt?: string;
}

export interface EmployeeProfile {
  id: string;
  userId: string;
  email?: string;
  employeeCode: string;
  fullName: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  department: string;
  departmentId?: string;
  departmentRef?: Department;
  cadreType?: 'LEADERSHIP' | 'MANAGEMENT' | 'STAFF';
  isCadre?: boolean;
  appointmentDate?: string;
  appointmentFormatted?: string;
  position: string;
  baseSalary: number;
  allowance: number;
  joinDate: string;
  avatarUrl?: string;
  // Pháp lý & Tài chính
  idCardNumber?: string;
  idCardIssueDate?: string;
  idCardIssuePlace?: string;
  taxCode?: string;
  socialInsuranceNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankBranch?: string;
  lineManagerId?: string;
  lineManager?: {
    id: string;
    fullName: string;
    employeeCode: string;
    position: string;
  };
  subordinates?: {
    id: string;
    fullName: string;
    employeeCode: string;
    position: string;
  }[];
  annualLeaveBalance?: number;
  contracts?: Contract[];
  rewards?: any[];
  disciplines?: any[];
  transfers?: any[];
  user?: {
    id: string;
    email: string;
    role: UserRole;
    isActive: boolean;
  };
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  workHours: number;
  status: 'PRESENT' | 'LATE' | 'EARLY_LEAVE' | 'HALF_DAY' | 'ABSENT';
  notes?: string;
  employee?: {
    employeeCode: string;
    fullName: string;
    department: string;
    position: string;
  };
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: 'ANNUAL' | 'SICK' | 'UNPAID' | 'MATERNITY' | 'COMPASSIONATE';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  reviewComment?: string;
  createdAt: string;
  employee?: {
    id?: string;
    employeeCode: string;
    fullName: string;
    department: string;
    position: string;
    annualLeaveBalance?: number;
  };
}

export interface TaxBracketBreakdown {
  tier: number;
  bracketName: string;
  taxableRange: string;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  standardDays: number;
  actualWorkDays: number;
  baseSalary: number;
  allowance: number;
  rewardAmount?: number;
  insuranceSalary?: number;
  bhxh?: number;
  bhyt?: number;
  bhtn?: number;
  deductions: number;
  taxableIncome?: number;
  tax: number;
  netSalary: number;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
  employee: {
    id: string;
    employeeCode: string;
    fullName: string;
    department: string;
    position: string;
    bankAccountNumber?: string;
    bankName?: string;
    bankBranch?: string;
    user: { email: string };
  };
  breakdown?: {
    standardDays: number;
    actualWorkDays: number;
    baseSalary: number;
    baseSalaryEarned: number;
    allowance: number;
    rewardAmount: number;
    grossSalary: number;
    insuranceSalary: number;
    bhxh: number;
    bhyt: number;
    bhtn: number;
    insuranceDeduction: number;
    personalRelief: number;
    dependentsRelief: number;
    totalRelief: number;
    taxableIncome: number;
    personalIncomeTax: number;
    taxBrackets: TaxBracketBreakdown[];
    netSalary: number;
  };
}

export interface KpiCriteria {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  weight: number;
  sortOrder: number;
}

export interface KpiCategory {
  id: string;
  templateId: string;
  name: string;
  weight: number;
  sortOrder: number;
  criteria: KpiCriteria[];
}

export interface KpiTemplate {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  targetDepartment?: string;
  targetRole?: string;
  categories: KpiCategory[];
  _count?: { cycles: number };
}

export interface ReviewScore {
  id: string;
  reviewId: string;
  criteriaId: string;
  criteria?: KpiCriteria;
  selfScore?: number;
  selfNote?: string;
  mgrScore?: number;
  mgrNote?: string;
}

export interface PerformanceCycle {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  templateId?: string;
  template?: KpiTemplate;
  _count?: { reviews: number };
}

export interface PerformanceReview {
  id: string;
  cycleId: string;
  cycle?: PerformanceCycle;
  employeeId: string;
  employee?: EmployeeProfile;
  reviewerId?: string;
  reviewer?: EmployeeProfile;
  templateId?: string;
  template?: KpiTemplate;
  selfScore?: number;
  selfComment?: string;
  mgrScore?: number;
  mgrComment?: string;
  totalSelfScore?: number;
  totalMgrScore?: number;
  totalWeightedScore?: number;
  autoRating?: string;
  finalRating?: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT' | 'UNSATISFACTORY';
  status: 'DRAFT' | 'SUBMITTED' | 'COMPLETED' | 'CALIBRATED';
  scores?: ReviewScore[];
  autoMetrics?: AutoPerformanceMetrics | null;
}

export interface ActiveDisciplineSummary {
  id: string;
  decisionNumber: string;
  form: string;
  penaltyAmount: number;
  decisionDate: string;
  reason: string;
}

export interface AutoPerformanceMetrics {
  cycleId?: string;
  employeeId: string;
  totalCheckIns: number;
  lateOrEarlyCount: number;
  halfDayCount: number;
  unpaidLeaveDays: number;
  violationIndex: number;
  suggestedAttendanceScore: number;
  attendanceEvidence: string;
  activeDisciplinesCount: number;
  activeDisciplines: ActiveDisciplineSummary[];
  suggestedDisciplineScore: number;
  disciplineEvidence: string;
  suggestedScore: number;
  suggestedRating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT' | 'UNSATISFACTORY';
  evidenceSummary: string;
  hasActiveDiscipline: boolean;
}



export interface DepartmentStat {
  department: string;
  count: number;
  totalSalary: number;
  averageSalary: number;
}
