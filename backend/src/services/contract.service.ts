import { prisma } from '../config/prisma.js';

export class ContractService {
  /**
   * Lấy danh sách hợp đồng với các bộ lọc
   */
  static async getContracts(filters?: {
    employeeId?: string;
    status?: string;
    contractType?: string;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    if (filters?.contractType && filters.contractType !== 'ALL') {
      where.contractType = filters.contractType;
    }

    if (filters?.search) {
      where.OR = [
        { contractNumber: { contains: filters.search } },
        { employee: { fullName: { contains: filters.search } } },
        { employee: { employeeCode: { contains: filters.search } } },
      ];
    }

    const contracts = await prisma.contract.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            department: true,
            position: true,
            baseSalary: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    return contracts.map((c) => {
      let isExpiringSoon = false;
      let daysRemaining: number | null = null;

      if (c.endDate && c.status === 'ACTIVE') {
        const end = new Date(c.endDate);
        const diffTime = end.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        isExpiringSoon = daysRemaining >= 0 && daysRemaining <= 30;
      }

      return {
        ...c,
        isExpiringSoon,
        daysRemaining,
      };
    });
  }

  /**
   * Lấy danh sách hợp đồng sắp hết hạn trong ngưỡng số ngày quy định
   */
  static async getExpiringContracts(daysThreshold = 30) {
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    const contracts = await prisma.contract.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: now,
          lte: thresholdDate,
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
            phone: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { endDate: 'asc' },
    });

    return contracts.map((c) => {
      const end = new Date(c.endDate!);
      const diffTime = end.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...c,
        daysRemaining,
        isExpiringSoon: true,
      };
    });
  }

  /**
   * Thống kê tổng quan hợp đồng
   */
  static async getStats() {
    const now = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const total = await prisma.contract.count();
    const active = await prisma.contract.count({ where: { status: 'ACTIVE' } });
    const probation = await prisma.contract.count({
      where: { contractType: 'PROBATION', status: 'ACTIVE' },
    });
    const indefinite = await prisma.contract.count({
      where: { contractType: 'INDEFINITE', status: 'ACTIVE' },
    });
    const expiringSoon = await prisma.contract.count({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: now,
          lte: thirtyDaysLater,
        },
      },
    });

    return {
      total,
      active,
      probation,
      indefinite,
      expiringSoon,
    };
  }

  /**
   * Chi tiết hợp đồng theo ID
   */
  static async getContractById(id: string) {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: {
              select: { email: true, role: true },
            },
          },
        },
      },
    });

    if (!contract) {
      throw new Error('Không tìm thấy hợp đồng lao động.');
    }

    return contract;
  }

  /**
   * Tạo mới hợp đồng lao động
   */
  static async createContract(data: {
    contractNumber: string;
    employeeId: string;
    contractType: string;
    jobTitle?: string;
    startDate: string;
    endDate?: string | null;
    signedDate?: string;
    salaryInsurance: number;
    status?: string;
    workingTime?: string;
    note?: string;
  }) {
    const existing = await prisma.contract.findUnique({
      where: { contractNumber: data.contractNumber },
    });

    if (existing) {
      throw new Error(`Số hợp đồng ${data.contractNumber} đã tồn tại trong hệ thống.`);
    }

    const employee = await prisma.employeeProfile.findUnique({
      where: { id: data.employeeId },
    });

    if (!employee) {
      throw new Error('Không tìm thấy nhân viên tương ứng.');
    }

    return await prisma.contract.create({
      data: {
        contractNumber: data.contractNumber,
        employeeId: data.employeeId,
        contractType: data.contractType,
        jobTitle: data.jobTitle || employee.position,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        signedDate: data.signedDate ? new Date(data.signedDate) : new Date(),
        salaryInsurance: Number(data.salaryInsurance),
        status: data.status || 'ACTIVE',
        workingTime: data.workingTime || 'Toàn thời gian (40h/tuần)',
        note: data.note,
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
    });
  }

  /**
   * Cập nhật hợp đồng
   */
  static async updateContract(
    id: string,
    data: {
      contractNumber?: string;
      contractType?: string;
      jobTitle?: string;
      startDate?: string;
      endDate?: string | null;
      signedDate?: string;
      salaryInsurance?: number;
      status?: string;
      workingTime?: string;
      note?: string;
    }
  ) {
    const existing = await prisma.contract.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Hợp đồng không tồn tại.');
    }

    const updateData: any = {};
    if (data.contractNumber) updateData.contractNumber = data.contractNumber;
    if (data.contractType) updateData.contractType = data.contractType;
    if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    }
    if (data.signedDate) updateData.signedDate = new Date(data.signedDate);
    if (data.salaryInsurance !== undefined) updateData.salaryInsurance = Number(data.salaryInsurance);
    if (data.status) updateData.status = data.status;
    if (data.workingTime !== undefined) updateData.workingTime = data.workingTime;
    if (data.note !== undefined) updateData.note = data.note;

    return await prisma.contract.update({
      where: { id },
      data: updateData,
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
    });
  }

  /**
   * Xóa hợp đồng
   */
  static async deleteContract(id: string) {
    return await prisma.contract.delete({
      where: { id },
    });
  }
}
