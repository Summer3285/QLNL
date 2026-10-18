import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from '../services/employee.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export class EmployeeController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { department, departmentId, cadreType, isCadre, search, role } = req.query;
      const employees = await EmployeeService.getAllEmployees({
        department: department as string,
        departmentId: departmentId as string,
        cadreType: cadreType as string,
        isCadre: isCadre !== undefined ? isCadre === 'true' : undefined,
        search: search as string,
        role: role as any,
      });
      res.json({
        success: true,
        data: employees,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.user?.employeeId;
      if (!employeeId) {
        res.status(404).json({ success: false, message: 'Tài khoản chưa liên kết hồ sơ nhân sự.' });
        return;
      }
      const employee = await EmployeeService.getEmployeeById(employeeId);
      res.json({ success: true, data: employee });
    } catch (error: any) {
      next(error);
    }
  }

  static async updateMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.user?.employeeId;
      if (!employeeId) {
        res.status(404).json({ success: false, message: 'Tài khoản chưa liên kết hồ sơ nhân sự.' });
        return;
      }
      const { phone, address, bankAccountNumber, bankName, bankBranch } = req.body;
      const updated = await EmployeeService.updateEmployee(employeeId, {
        phone,
        address,
        bankAccountNumber,
        bankName,
        bankBranch,
      });
      res.json({
        success: true,
        message: 'Cập nhật thông tin liên hệ và ngân hàng thành công.',
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi cập nhật hồ sơ.',
      });
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await EmployeeService.getEmployeeById(req.params.id);
      res.json({
        success: true,
        data: employee,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Không tìm thấy nhân viên.',
      });
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const newEmployee = await EmployeeService.createEmployee(req.body);
      res.status(201).json({
        success: true,
        message: 'Tạo hồ sơ nhân viên thành công.',
        data: newEmployee,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi tạo nhân viên.',
      });
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await EmployeeService.updateEmployee(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Cập nhật hồ sơ nhân viên thành công.',
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi cập nhật nhân viên.',
      });
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await EmployeeService.deleteEmployee(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi xóa nhân viên.',
      });
    }
  }

  static async getDepartmentStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await EmployeeService.getDepartmentStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
