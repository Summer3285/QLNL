import { Request, Response, NextFunction } from 'express';
import { ReportsService } from '../services/reports.service.js';

export class ReportsController {
  static async getSalaryRaiseDue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ReportsService.getSalaryRaiseDue();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getRetirementDue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ReportsService.getRetirementDue();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getDemographics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ReportsService.getDemographics();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getResumeData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ReportsService.getResumeData(req.params.id);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message || 'Không tìm thấy hồ sơ.' });
    }
  }
}
