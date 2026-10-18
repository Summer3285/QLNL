import { Request, Response, NextFunction } from 'express';
import { TransferService } from '../services/transfer.service.js';

export class TransferController {
  static async getTransfers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId } = req.query;
      const list = await TransferService.getTransfers(employeeId as string);
      res.json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  static async createTransfer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const transfer = await TransferService.createTransfer(req.body);
      res.status(201).json({
        success: true,
        message: 'Lập quyết định điều động / thuyên chuyển và cập nhật hồ sơ thành công.',
        data: transfer,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Lỗi khi thuyên chuyển.' });
    }
  }
}
