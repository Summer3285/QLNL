import { Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendance.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export class AttendanceController {
  static async checkIn(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.user!.employeeId;
      if (!employeeId) {
        res.status(400).json({ success: false, message: 'Tài khoản chưa liên kết hồ sơ nhân viên.' });
        return;
      }

      const result = await AttendanceService.checkIn(employeeId, req.body.notes);
      res.json({
        success: true,
        message: 'Điểm danh Check-in thành công.',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi check-in.',
      });
    }
  }

  static async checkOut(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.user!.employeeId;
      if (!employeeId) {
        res.status(400).json({ success: false, message: 'Tài khoản chưa liên kết hồ sơ nhân viên.' });
        return;
      }

      const result = await AttendanceService.checkOut(employeeId, req.body.notes);
      res.json({
        success: true,
        message: 'Điểm danh Check-out thành công.',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi check-out.',
      });
    }
  }

  static async getMyAttendance(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const employeeId = req.user!.employeeId;
      if (!employeeId) {
        res.status(400).json({ success: false, message: 'Tài khoản chưa liên kết hồ sơ nhân viên.' });
        return;
      }

      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;

      const data = await AttendanceService.getEmployeeAttendance(employeeId, month, year);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getTodayOverview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const attendances = await AttendanceService.getAllTodayAttendance();
      res.json({ success: true, data: attendances });
    } catch (error) {
      next(error);
    }
  }

  // Leave Requests
  static async createLeave(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.user!.employeeId;
      if (!employeeId) {
        res.status(400).json({ success: false, message: 'Tài khoản chưa liên kết hồ sơ nhân viên.' });
        return;
      }

      const leave = await AttendanceService.createLeaveRequest(employeeId, req.body);
      res.status(201).json({
        success: true,
        message: 'Nộp đơn xin nghỉ phép thành công.',
        data: leave,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể tạo đơn xin nghỉ phép.',
      });
    }
  }

  static async getLeaveRequests(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { status, employeeId } = req.query;

      // If normal employee, only return their own leave requests
      let targetEmployeeId = employeeId as string | undefined;
      if (req.user?.role === 'EMPLOYEE') {
        targetEmployeeId = req.user.employeeId;
      }

      const leaves = await AttendanceService.getLeaveRequests({
        employeeId: targetEmployeeId,
        status: status as any,
      });

      res.json({ success: true, data: leaves });
    } catch (error) {
      next(error);
    }
  }

  static async updateLeaveStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status, reviewComment } = req.body;
      const approvedBy = req.user!.fullName || req.user!.email;

      const updated = await AttendanceService.updateLeaveStatus(
        id,
        status,
        approvedBy,
        reviewComment,
        req.user?.employeeId
      );

      res.json({
        success: true,
        message: `Đã cập nhật trạng thái đơn xin nghỉ phép sang ${status}.`,
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi cập nhật trạng thái nghỉ phép.',
      });
    }
  }

  static async getMyLeaveBalance(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const employeeId = req.user!.employeeId;
      if (!employeeId) {
        res.status(400).json({ success: false, message: 'Tài khoản chưa liên kết hồ sơ nhân viên.' });
        return;
      }

      const balance = await AttendanceService.getLeaveSummary(employeeId);
      res.json({ success: true, data: balance });
    } catch (error) {
      next(error);
    }
  }

  static async cancelLeave(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const employeeId = req.user!.employeeId;
      if (!employeeId) {
        res.status(400).json({ success: false, message: 'Tài khoản chưa liên kết hồ sơ nhân viên.' });
        return;
      }

      await AttendanceService.cancelLeaveRequest(id, employeeId, req.user?.role);
      res.json({ success: true, message: 'Thu hồi đơn xin nghỉ phép thành công.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Lỗi khi thu hồi đơn.' });
    }
  }
}
