import { Request } from 'express';

export type UserRole = 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE';

export const Role = {
  ADMIN: 'ADMIN',
  HR_MANAGER: 'HR_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const LeaveType = {
  ANNUAL: 'ANNUAL',
  SICK: 'SICK',
  UNPAID: 'UNPAID',
  MATERNITY: 'MATERNITY',
} as const;
export type LeaveType = (typeof LeaveType)[keyof typeof LeaveType];

export const LeaveStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type LeaveStatus = (typeof LeaveStatus)[keyof typeof LeaveStatus];

export const ReviewStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  COMPLETED: 'COMPLETED',
} as const;
export type ReviewStatus = (typeof ReviewStatus)[keyof typeof ReviewStatus];

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  fullName?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}
