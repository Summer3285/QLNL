import { prisma } from '../config/prisma.js';

export class RewardService {
  // Rewards
  static async createReward(data: {
    employeeId: string;
    decisionNumber: string;
    title: string;
    rewardType?: string;
    amount?: number;
    decisionDate: string;
    reason: string;
  }) {
    return await prisma.reward.create({
      data: {
        employeeId: data.employeeId,
        decisionNumber: data.decisionNumber,
        title: data.title,
        rewardType: data.rewardType || 'Bằng khen',
        amount: data.amount || 0,
        decisionDate: new Date(data.decisionDate),
        reason: data.reason,
      },
      include: {
        employee: {
          select: { id: true, employeeCode: true, fullName: true, department: true },
        },
      },
    });
  }

  static async getRewards(employeeId?: string) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;

    return await prisma.reward.findMany({
      where,
      include: {
        employee: {
          select: { id: true, employeeCode: true, fullName: true, department: true, position: true },
        },
      },
      orderBy: { decisionDate: 'desc' },
    });
  }

  static async deleteReward(id: string) {
    return await prisma.reward.delete({ where: { id } });
  }

  // Disciplines
  static async createDiscipline(data: {
    employeeId: string;
    decisionNumber: string;
    form: string;
    penaltyAmount?: number;
    decisionDate: string;
    effectiveDate: string;
    reason: string;
  }) {
    return await prisma.discipline.create({
      data: {
        employeeId: data.employeeId,
        decisionNumber: data.decisionNumber,
        form: data.form,
        penaltyAmount: data.penaltyAmount || 0,
        decisionDate: new Date(data.decisionDate),
        effectiveDate: new Date(data.effectiveDate),
        reason: data.reason,
        status: 'ACTIVE',
      },
      include: {
        employee: {
          select: { id: true, employeeCode: true, fullName: true, department: true },
        },
      },
    });
  }

  static async getDisciplines(employeeId?: string) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;

    return await prisma.discipline.findMany({
      where,
      include: {
        employee: {
          select: { id: true, employeeCode: true, fullName: true, department: true, position: true },
        },
      },
      orderBy: { decisionDate: 'desc' },
    });
  }

  static async deleteDiscipline(id: string) {
    return await prisma.discipline.delete({ where: { id } });
  }
}
