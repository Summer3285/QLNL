import { Router } from 'express';
import { z } from 'zod';
import { EmployeeController } from '../controllers/employee.controller.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';

const router = Router();

const createEmployeeSchema = z.object({
  email: z.string().email('Email không hợp lệ.'),
  passwordPlain: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự.'),
  role: z.enum(['ADMIN', 'HR_MANAGER', 'EMPLOYEE']),
  employeeCode: z.string().min(2, 'Mã nhân viên tối thiểu 2 ký tự.'),
  fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự.'),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  department: z.string().optional(),
  departmentId: z.string().optional(),
  cadreType: z.enum(['LEADERSHIP', 'MANAGEMENT', 'STAFF']).optional(),
  isCadre: z.boolean().optional(),
  appointmentDate: z.string().optional(),
  position: z.string().min(1, 'Vui lòng nhập chức vụ.'),
  baseSalary: z.number().min(0, 'Mức lương phải lớn hơn hoặc bằng 0.'),
  allowance: z.number().optional(),
  joinDate: z.string().optional(),
  idCardNumber: z.string().optional(),
  idCardIssueDate: z.string().optional(),
  idCardIssuePlace: z.string().optional(),
  taxCode: z.string().optional(),
  socialInsuranceNumber: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  lineManagerId: z.string().optional(),
  annualLeaveBalance: z.number().optional(),
});

const updateEmployeeSchema = z.object({
  fullName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  department: z.string().optional(),
  departmentId: z.string().optional(),
  cadreType: z.enum(['LEADERSHIP', 'MANAGEMENT', 'STAFF']).optional(),
  isCadre: z.boolean().optional(),
  appointmentDate: z.string().optional(),
  position: z.string().optional(),
  baseSalary: z.number().optional(),
  allowance: z.number().optional(),
  role: z.enum(['ADMIN', 'HR_MANAGER', 'EMPLOYEE']).optional(),
  isActive: z.boolean().optional(),
  idCardNumber: z.string().optional(),
  idCardIssueDate: z.string().optional(),
  idCardIssuePlace: z.string().optional(),
  taxCode: z.string().optional(),
  socialInsuranceNumber: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  lineManagerId: z.string().optional(),
  annualLeaveBalance: z.number().optional(),
});

// All employee routes require authentication
router.use(authenticateJWT);

// Employee Self-Service (ESS): Any authenticated employee can view and update their own profile
router.get('/me', EmployeeController.getMe);
router.put('/me', EmployeeController.updateMe);

router.get('/stats/departments', requireRoles(['ADMIN', 'HR_MANAGER']), EmployeeController.getDepartmentStats);
router.get('/', requireRoles(['ADMIN', 'HR_MANAGER']), EmployeeController.getAll);
router.get('/:id', EmployeeController.getById);

// Admin & HR Manager can create, update, delete employees
router.post(
  '/',
  requireRoles(['ADMIN', 'HR_MANAGER']),
  validateBody(createEmployeeSchema),
  EmployeeController.create
);

router.put(
  '/:id',
  requireRoles(['ADMIN', 'HR_MANAGER']),
  validateBody(updateEmployeeSchema),
  EmployeeController.update
);

router.delete('/:id', requireRoles(['ADMIN']), EmployeeController.delete);

export default router;
