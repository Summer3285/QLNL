import { Response, NextFunction } from 'express';
import { DepartmentService } from '../services/department.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export class DepartmentController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const departments = await DepartmentService.getAllDepartments();
      res.json({ success: true, data: departments });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const department = await DepartmentService.getDepartmentById(id);
      res.json({ success: true, data: department });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message || 'Không tìm thấy phòng ban.' });
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const department = await DepartmentService.createDepartment(req.body);
      res.status(201).json({
        success: true,
        message: 'Thêm mới phòng ban thành công.',
        data: department,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Lỗi khi tạo phòng ban.' });
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const department = await DepartmentService.updateDepartment(id, req.body);
      res.json({
        success: true,
        message: 'Cập nhật thông tin phòng ban thành công.',
        data: department,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Lỗi khi cập nhật phòng ban.' });
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await DepartmentService.deleteDepartment(id);
      res.json({
        success: true,
        message: 'Xóa phòng ban thành công.',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Không thể xóa phòng ban.' });
    }
  }

  static async getOrgChart(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const chart = await DepartmentService.getOrgChart();
      res.json({ success: true, data: chart });
    } catch (error) {
      next(error);
    }
  }
}
