import { Request, Response, NextFunction } from 'express';
import { ContractService } from '../services/contract.service.js';

export class ContractController {
  static async getContracts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId, status, contractType, search } = req.query;
      const list = await ContractService.getContracts({
        employeeId: employeeId as string,
        status: status as string,
        contractType: contractType as string,
        search: search as string,
      });
      res.json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  static async getExpiring(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const list = await ContractService.getExpiringContracts(days);
      res.json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await ContractService.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  static async getContractById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const contract = await ContractService.getContractById(id);
      res.json({ success: true, data: contract });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message || 'Không tìm thấy hợp đồng.' });
    }
  }

  static async createContract(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contract = await ContractService.createContract(req.body);
      res.status(201).json({
        success: true,
        message: 'Ký kết và tạo hợp đồng lao động thành công.',
        data: contract,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Lỗi khi tạo hợp đồng.' });
    }
  }

  static async updateContract(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await ContractService.updateContract(id, req.body);
      res.json({
        success: true,
        message: 'Cập nhật thông tin hợp đồng thành công.',
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Lỗi khi cập nhật hợp đồng.' });
    }
  }

  static async deleteContract(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await ContractService.deleteContract(id);
      res.json({
        success: true,
        message: 'Đã xóa hợp đồng thành công.',
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Lỗi khi xóa hợp đồng.' });
    }
  }
}
