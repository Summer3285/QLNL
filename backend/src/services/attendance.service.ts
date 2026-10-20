import { prisma } from '../config/prisma.js';
import { LeaveType, LeaveStatus } from '../types/index.js';

export class AttendanceService {
  static getTodayRange() {
    const now = new Date();
    // Start and end of day in local time
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    // UTC normalized date (midnight UTC) to prevent negative day shift when stored in database
    const todayDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
    return { startOfDay, endOfDay, todayDate };
  }

  static async checkIn(employeeId: string, notes?: string) {
    const { startOfDay, endOfDay, todayDate } = this.getTodayRange();

    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const now = new Date();
    // Check if after 8:45 AM => LATE
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 45);
    const status = isLate ? 'LATE' : 'PRESENT';

    if (existing) {
      if (existing.checkIn) {
        throw new Error('Bạn đã điểm danh check-in ngày hôm nay rồi.');
      }
      return await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          checkIn: now,
          status,
          notes: notes || existing.notes,
        },
      });
    }

    return await prisma.attendance.create({
      data: {
        employeeId,
        date: todayDate,
        checkIn: now,
        status,
        notes,
      },
    });
  }

  static async checkOut(employeeId: string, notes?: string) {
    const { startOfDay, endOfDay } = this.getTodayRange();

    const record = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (!record || !record.checkIn) {
      throw new Error('Bạn chưa thực hiện Check-in cho ngày hôm nay.');
    }

    if (record.checkOut) {
      throw new Error('Bạn đã thực hiện Check-out ngày hôm nay rồi.');
    }

    const now = new Date();
    const diffMs = now.getTime() - new Date(record.checkIn).getTime();
    const workHours = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);

    let status = record.status;
    if (workHours < 4) {
      status = 'HALF_DAY';
    } else if (now.getHours() < 17) {
      status = 'EARLY_LEAVE';
    }

    return await prisma.attendance.update({
      where: { id: record.id },
      data: {
        checkOut: now,
        workHours,
        status,
        notes: notes ? (record.notes ? `${record.notes} | ${notes}` : notes) : record.notes,
      },
    });
  }

  static async getEmployeeAttendance(employeeId: string, month?: number, year?: number) {
    const targetMonth = month !== undefined ? month : new Date().getMonth() + 1;
    const targetYear = year !== undefined ? year : new Date().getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const records = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    });

    const totalDaysPresent = records.filter(
      (r) => r.status === 'PRESENT' || r.status === 'LATE'
    ).length;
    const totalLate = records.filter((r) => r.status === 'LATE').length;
    const totalWorkHours = records.reduce((acc, curr) => acc + curr.workHours, 0);

    return {
      month: targetMonth,
      year: targetYear,
      records,
      summary: {
        totalDaysPresent,
        totalLate,
        totalWorkHours: Math.round(totalWorkHours * 10) / 10,
      },
    };
  }

  static async getAllTodayAttendance() {
    const { startOfDay, endOfDay } = this.getTodayRange();

    return await prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            department: true,
            position: true,
          },
        },
      },
      orderBy: { checkIn: 'desc' },
    });
  }

  // Helper to count working days (Mon-Fri)
  static countBusinessDays(startDate: Date | string, endDate: Date | string): number {
    let count = 0;
    const cur = new Date(startDate);
    cur.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    while (cur <= end) {
      const dayOfWeek = cur.getDay();
      // 0: Sunday, 6: Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }

  // Leave Requests
  static async createLeaveRequest(
    employeeId: string,
    data: {
      leaveType: LeaveType;
      startDate: string;
      endDate: string;
      reason: string;
    }
  ) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (end < start) {
      throw new Error('Ngày kết thúc không thể trước ngày bắt đầu.');
    }

    const businessDays = this.countBusinessDays(start, end);
    if (businessDays === 0) {
      throw new Error('Khoảng thời gian đã chọn rơi vào ngày nghỉ cuối tuần (Thứ 7 - CN), không có ngày làm việc nào cần xin nghỉ.');
    }

    // If Annual Leave, verify available balance
    if (data.leaveType === 'ANNUAL') {
      const employee = await prisma.employeeProfile.findUnique({
        where: { id: employeeId },
      });
      if (!employee) {
        throw new Error('Không tìm thấy thông tin nhân sự.');
      }
      if (employee.annualLeaveBalance < businessDays) {
        throw new Error(
          `Số ngày phép năm còn lại không đủ (còn ${employee.annualLeaveBalance} ngày, đơn yêu cầu ${businessDays} ngày).`
        );
      }
    }

    return await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveType: data.leaveType,
        startDate: start,
        endDate: end,
        reason: data.reason,
        status: LeaveStatus.PENDING,
      },
    });
  }

  static async getLeaveRequests(filters: {
    employeeId?: string;
    status?: LeaveStatus;
  }) {
    const where: any = {};
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status;

    return await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            department: true,
            position: true,
            annualLeaveBalance: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateLeaveStatus(
    id: string,
    status: LeaveStatus,
    approvedBy: string,
    reviewComment?: string,
    reviewerEmployeeId?: string
  ) {
    const request = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!request) {
      throw new Error('Không tìm thấy đơn xin nghỉ phép.');
    }

    if (reviewerEmployeeId && request.employeeId === reviewerEmployeeId) {
      throw new Error('Bạn không thể tự phê duyệt hoặc từ chối đơn xin nghỉ phép của chính mình.');
    }

    const businessDays = this.countBusinessDays(request.startDate, request.endDate);

    return await prisma.$transaction(async (tx) => {
      // 1. If newly APPROVED and was not APPROVED before: deduct from annualLeaveBalance
      if (status === LeaveStatus.APPROVED && request.status !== LeaveStatus.APPROVED) {
        if (request.leaveType === 'ANNUAL') {
          const emp = await tx.employeeProfile.findUnique({ where: { id: request.employeeId } });
          if (emp) {
            await tx.employeeProfile.update({
              where: { id: request.employeeId },
              data: {
                annualLeaveBalance: Math.max(0, emp.annualLeaveBalance - businessDays),
              },
            });
          }
        }
      }

      // 2. If was APPROVED before and now REJECTED/CANCELLED: refund leave days
      if (request.status === LeaveStatus.APPROVED && status === LeaveStatus.REJECTED) {
        if (request.leaveType === 'ANNUAL') {
          const emp = await tx.employeeProfile.findUnique({ where: { id: request.employeeId } });
          if (emp) {
            await tx.employeeProfile.update({
              where: { id: request.employeeId },
              data: {
                annualLeaveBalance: emp.annualLeaveBalance + businessDays,
              },
            });
          }
        }
      }

      return await tx.leaveRequest.update({
        where: { id },
        data: {
          status,
          approvedBy,
          reviewComment,
        },
      });
    });
  }

  static async cancelLeaveRequest(id: string, employeeId: string, role?: string) {
    const request = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!request) {
      throw new Error('Không tìm thấy đơn xin nghỉ phép.');
    }

    if (request.employeeId !== employeeId && role !== 'ADMIN' && role !== 'HR_MANAGER') {
      throw new Error('Bạn không có quyền thu hồi đơn này.');
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new Error('Chỉ có thể thu hồi đơn khi đang ở trạng thái chờ duyệt (PENDING).');
    }

    return await prisma.leaveRequest.delete({
      where: { id },
    });
  }

  static async getLeaveSummary(employeeId: string) {
    const employee = await prisma.employeeProfile.findUnique({
      where: { id: employeeId },
      select: { annualLeaveBalance: true },
    });

    const approvedAnnualLeaves = await prisma.leaveRequest.findMany({
      where: {
        employeeId,
        leaveType: 'ANNUAL',
        status: LeaveStatus.APPROVED,
      },
    });

    const pendingLeaves = await prisma.leaveRequest.findMany({
      where: {
        employeeId,
        status: LeaveStatus.PENDING,
      },
    });

    const usedDays = approvedAnnualLeaves.reduce(
      (acc, l) => acc + this.countBusinessDays(l.startDate, l.endDate),
      0
    );

    const pendingDays = pendingLeaves.reduce(
      (acc, l) => acc + this.countBusinessDays(l.startDate, l.endDate),
      0
    );

    const totalStandard = 12;
    const remainingDays = employee?.annualLeaveBalance ?? Math.max(0, totalStandard - usedDays);

    return {
      totalStandard,
      usedDays,
      pendingDays,
      remainingDays,
    };
  }
}
