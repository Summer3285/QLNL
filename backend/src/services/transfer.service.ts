import { prisma } from '../config/prisma.js';

export class TransferService {
  static async createTransfer(data: {
    employeeId: string;
    decisionNumber: string;
    toDepartment: string;
    toPosition: string;
    newSalary: number;
    transferDate: string;
    note?: string;
  }) {
    const employee = await prisma.employeeProfile.findUnique({
      where: { id: data.employeeId },
    });

    if (!employee) {
      throw new Error('Không tìm thấy thông tin cán bộ.');
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Create transfer history entry
      const history = await tx.transferHistory.create({
        data: {
          employeeId: data.employeeId,
          decisionNumber: data.decisionNumber,
          fromDepartment: employee.department,
          toDepartment: data.toDepartment,
          fromPosition: employee.position,
          toPosition: data.toPosition,
          oldSalary: employee.baseSalary,
          newSalary: data.newSalary,
          transferDate: new Date(data.transferDate),
          note: data.note,
        },
      });

      // 2. Update employee's active department, position, and baseSalary
      await tx.employeeProfile.update({
        where: { id: data.employeeId },
        data: {
          department: data.toDepartment,
          position: data.toPosition,
          baseSalary: data.newSalary,
        },
      });

      return history;
    });
  }

  static async getTransfers(employeeId?: string) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;

    return await prisma.transferHistory.findMany({
      where,
      include: {
        employee: {
          select: { id: true, employeeCode: true, fullName: true },
        },
      },
      orderBy: { transferDate: 'desc' },
    });
  }
}
