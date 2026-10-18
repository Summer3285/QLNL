import { Router } from 'express';
import { z } from 'zod';
import { AttendanceController } from '../controllers/attendance.controller.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';

const router = Router();

const checkInSchema = z.object({
  notes: z.string().optional(),
});

const createLeaveSchema = z.object({
  leaveType: z.enum(['ANNUAL', 'SICK', 'UNPAID', 'MATERNITY', 'COMPASSIONATE']),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu.'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc.'),
  reason: z.string().min(3, 'Vui lòng nhập lý do nghỉ.'),
});

const updateLeaveStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewComment: z.string().optional(),
});

router.use(authenticateJWT);

// Attendance routes
router.post('/check-in', validateBody(checkInSchema), AttendanceController.checkIn);
router.post('/check-out', validateBody(checkInSchema), AttendanceController.checkOut);
router.get('/my-logs', AttendanceController.getMyAttendance);
router.get(
  '/today-overview',
  requireRoles(['ADMIN', 'HR_MANAGER']),
  AttendanceController.getTodayOverview
);

// Leave Requests routes
router.post('/leaves', validateBody(createLeaveSchema), AttendanceController.createLeave);
router.get('/leaves', AttendanceController.getLeaveRequests);
router.get('/leave-balance', AttendanceController.getMyLeaveBalance);
router.put(
  '/leaves/:id/status',
  requireRoles(['ADMIN', 'HR_MANAGER']),
  validateBody(updateLeaveStatusSchema),
  AttendanceController.updateLeaveStatus
);
router.delete('/leaves/:id', AttendanceController.cancelLeave);

export default router;
