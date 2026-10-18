import { Response, NextFunction } from 'express';
import { PayrollService } from '../services/payroll.service.js';
import { PdfService } from '../services/pdf.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export class PayrollController {
  static async calculateMonthly(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const month = req.body.month ? parseInt(req.body.month, 10) : new Date().getMonth() + 1;
      const year = req.body.year ? parseInt(req.body.year, 10) : new Date().getFullYear();

      const results = await PayrollService.runMonthlyPayroll(month, year);
      res.json({
        success: true,
        message: `Đã tính lương tự động cho ${results.length} nhân viên tháng ${month}/${year}.`,
        data: results,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi tính toán bảng lương tự động.',
      });
    }
  }

  static async getAll(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;

      let employeeId = req.query.employeeId as string | undefined;
      // Normal employee can only see their own payslips
      if (req.user?.role === 'EMPLOYEE') {
        employeeId = req.user.employeeId;
      }

      const payrolls = await PayrollService.getPayrolls({
        month,
        year,
        employeeId,
      });

      res.json({ success: true, data: payrolls });
    } catch (error) {
      next(error);
    }
  }

  static async getById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payroll = await PayrollService.getPayrollById(req.params.id);

      // Security check: Employee can only view their own
      if (
        req.user?.role === 'EMPLOYEE' &&
        req.user.employeeId !== payroll.employeeId
      ) {
        res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem bảng lương của người khác.',
        });
        return;
      }

      res.json({ success: true, data: payroll });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Không tìm thấy bảng lương.',
      });
    }
  }

  static async markAsPaid(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const updated = await PayrollService.markAsPaid(req.params.id);
      res.json({
        success: true,
        message: 'Đã xác nhận thanh toán lương thành công.',
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi cập nhật trạng thái thanh toán.',
      });
    }
  }

  static async downloadPdf(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payroll = await PayrollService.getPayrollById(req.params.id);

      if (
        req.user?.role === 'EMPLOYEE' &&
        req.user.employeeId !== payroll.employeeId
      ) {
        res.status(403).json({
          success: false,
          message: 'Bạn không có quyền tải phiếu lương này.',
        });
        return;
      }

      const pdfBuffer = await PdfService.generatePayslipPdf({
        companyName: 'NexNova Technologies JSC',
        taxCode: '0108992834',
        address: 'NexNova Tower, High-Tech Park, District 9, HCMC, Vietnam',
        month: payroll.month,
        year: payroll.year,
        employeeCode: payroll.employee.employeeCode,
        fullName: payroll.employee.fullName,
        department: payroll.employee.department,
        position: payroll.employee.position,
        email: payroll.employee.user.email,
        bankAccount: payroll.employee.bankAccountNumber || undefined,
        bankName: payroll.employee.bankName || undefined,
        standardDays: payroll.standardDays,
        actualWorkDays: payroll.actualWorkDays,
        baseSalary: payroll.baseSalary,
        allowance: payroll.allowance,
        rewardAmount: payroll.rewardAmount,
        insuranceSalary: payroll.insuranceSalary || undefined,
        bhxh: payroll.bhxh,
        bhyt: payroll.bhyt,
        bhtn: payroll.bhtn,
        deductions: payroll.deductions,
        taxableIncome: payroll.taxableIncome,
        tax: payroll.tax,
        netSalary: payroll.netSalary,
        isPaid: payroll.isPaid,
      });

      const filename = `Payslip_${payroll.employee.employeeCode}_${payroll.month}_${payroll.year}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi tạo file PDF phiếu lương.',
      });
    }
  }
}
