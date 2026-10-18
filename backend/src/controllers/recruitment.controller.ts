import { Request, Response, NextFunction } from 'express';
import { RecruitmentService } from '../services/recruitment.service.js';

export class RecruitmentController {
  // Plans
  static async getPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plans = await RecruitmentService.getPlans();
      res.json({ success: true, data: plans });
    } catch (error) {
      next(error);
    }
  }

  static async createPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await RecruitmentService.createPlan(req.body);
      res.status(201).json({ success: true, message: 'Tạo kế hoạch tuyển dụng thành công.', data: plan });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Lỗi tạo kế hoạch.' });
    }
  }

  static async updatePlanStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await RecruitmentService.updatePlanStatus(req.params.id, req.body.status);
      res.json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  }

  // Candidates
  static async getCandidates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { planId } = req.query;
      const candidates = await RecruitmentService.getCandidates(planId as string);
      res.json({ success: true, data: candidates });
    } catch (error) {
      next(error);
    }
  }

  static async createCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const candidate = await RecruitmentService.createCandidate(req.body);
      res.status(201).json({ success: true, message: 'Thêm ứng viên thành công.', data: candidate });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Lỗi thêm ứng viên.' });
    }
  }

  static async updateCandidateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const candidate = await RecruitmentService.updateCandidateStatus(req.params.id, req.body);
      res.json({ success: true, message: 'Cập nhật trạng thái ứng viên thành công.', data: candidate });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Lỗi cập nhật ứng viên.' });
    }
  }

  static async getNextCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const nextCode = await RecruitmentService.getNextEmployeeCode();
      res.json({ success: true, data: { nextCode } });
    } catch (error) {
      next(error);
    }
  }

  static async convertCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await RecruitmentService.convertCandidateToEmployee({
        candidateId: id,
        ...req.body,
      });
      res.status(201).json({
        success: true,
        message: `Đã tiếp nhận thành công ứng viên thành nhân viên chính thức (${result.employee.employeeCode})!`,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Lỗi khi chuyển đổi ứng viên thành nhân viên.' });
    }
  }

  // Probation Alerts
  static async getProbationAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const alerts = await RecruitmentService.getProbationAlerts();
      res.json({ success: true, data: alerts });
    } catch (error) {
      next(error);
    }
  }
}

