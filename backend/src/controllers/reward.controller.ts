import { Request, Response, NextFunction } from 'express';
import { RewardService } from '../services/reward.service.js';

export class RewardController {
  static async getRewards(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId } = req.query;
      const rewards = await RewardService.getRewards(employeeId as string);
      res.json({ success: true, data: rewards });
    } catch (error) {
      next(error);
    }
  }

  static async createReward(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reward = await RewardService.createReward(req.body);
      res.status(201).json({ success: true, message: 'Lập quyết định khen thưởng thành công.', data: reward });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Lỗi khi tạo khen thưởng.' });
    }
  }

  static async deleteReward(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await RewardService.deleteReward(req.params.id);
      res.json({ success: true, message: 'Đã xóa quyết định khen thưởng.' });
    } catch (error) {
      next(error);
    }
  }

  static async getDisciplines(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId } = req.query;
      const disciplines = await RewardService.getDisciplines(employeeId as string);
      res.json({ success: true, data: disciplines });
    } catch (error) {
      next(error);
    }
  }

  static async createDiscipline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const discipline = await RewardService.createDiscipline(req.body);
      res.status(201).json({ success: true, message: 'Lập quyết định kỷ luật thành công.', data: discipline });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Lỗi khi tạo kỷ luật.' });
    }
  }

  static async deleteDiscipline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await RewardService.deleteDiscipline(req.params.id);
      res.json({ success: true, message: 'Đã xóa quyết định kỷ luật.' });
    } catch (error) {
      next(error);
    }
  }
}
