import { Response, NextFunction } from 'express';
import { PerformanceService } from '../services/performance.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export class PerformanceController {
  // --- Templates ---
  static async getTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const templates = await PerformanceService.getTemplates();
      res.json({ success: true, data: templates });
    } catch (error) {
      next(error);
    }
  }

  static async getTemplateById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const template = await PerformanceService.getTemplateById(id);
      if (!template) {
        res.status(404).json({ success: false, message: 'Không tìm thấy bộ tiêu chí.' });
        return;
      }
      res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }

  static async createTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const template = await PerformanceService.createTemplate(req.body);
      res.status(201).json({
        success: true,
        message: 'Tạo bộ tiêu chí đánh giá KPI thành công.',
        data: template,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể tạo bộ tiêu chí.',
      });
    }
  }

  // --- Cycles ---
  static async getCycles(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cycles = await PerformanceService.getCycles();
      res.json({ success: true, data: cycles });
    } catch (error) {
      next(error);
    }
  }

  static async createCycle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cycle = await PerformanceService.createCycle(req.body);
      res.status(201).json({
        success: true,
        message: 'Tạo kỳ đánh giá hiệu suất thành công.',
        data: cycle,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể tạo kỳ đánh giá.',
      });
    }
  }

  static async getReviewsByCycle(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { cycleId } = req.params;
      const reviews = await PerformanceService.getReviewsByCycle(cycleId);
      res.json({ success: true, data: reviews });
    } catch (error) {
      next(error);
    }
  }

  static async getMyReview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const employeeId = req.user!.employeeId;
      if (!employeeId) {
        res.status(400).json({ success: false, message: 'Chưa liên kết hồ sơ nhân viên.' });
        return;
      }
      const { cycleId } = req.params;
      const review = await PerformanceService.getEmployeeReview(employeeId, cycleId);
      res.json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  }

  static async submitSelfReview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const employeeId = req.user!.employeeId;
      if (!employeeId) {
        res.status(400).json({ success: false, message: 'Chưa liên kết hồ sơ nhân viên.' });
        return;
      }
      const { cycleId } = req.params;
      const result = await PerformanceService.submitSelfReview(
        employeeId,
        cycleId,
        req.body
      );
      res.json({
        success: true,
        message: 'Nộp bản tự đánh giá KPIs thành công.',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể nộp tự đánh giá.',
      });
    }
  }

  static async submitManagerReview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const reviewerId = req.user!.employeeId;
      const { reviewId } = req.params;
      const result = await PerformanceService.submitManagerReview(
        reviewId,
        reviewerId || '',
        req.body
      );
      res.json({
        success: true,
        message: 'Hoàn tất đánh giá của quản lý/HR.',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi lưu kết quả đánh giá của quản lý.',
      });
    }
  }

  // --- Summary & Calibration ---
  static async getCycleSummary(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { cycleId } = req.params;
      const summary = await PerformanceService.getCycleSummary(cycleId);
      res.json({ success: true, data: summary });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể tải báo cáo hiệu chỉnh kỳ đánh giá.',
      });
    }
  }

  static async calibrateReview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { reviewId } = req.params;
      const result = await PerformanceService.calibrateReview(reviewId, req.body);
      res.json({
        success: true,
        message: 'Hiệu chỉnh xếp loại đánh giá thành công.',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi hiệu chỉnh xếp loại.',
      });
    }
  }

  static async getAutoMetrics(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { cycleId, employeeId } = req.params;
      const metrics = await PerformanceService.calculateAttendanceAndDisciplineMetrics(
        employeeId,
        cycleId
      );
      if (!metrics) {
        res.status(404).json({ success: false, message: 'Không tìm thấy kỳ đánh giá hoặc thông tin nhân sự.' });
        return;
      }
      res.json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  }
}

