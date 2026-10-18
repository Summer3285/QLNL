import { prisma } from '../config/prisma.js';

export interface PayrollCalculationInput {
  baseSalary: number;
  allowance: number;
  rewardAmount?: number;
  standardDays?: number;
  actualWorkDays: number;
  paidLeaveDays?: number;
  insuranceSalary?: number;
  dependentsCount?: number;
}

export interface TaxBracketBreakdown {
  tier: number;
  bracketName: string;
  taxableRange: string;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
}

export interface PayrollCalculationResult {
  standardDays: number;
  actualWorkDays: number;
  baseSalary: number;
  baseSalaryEarned: number;
  allowance: number;
  rewardAmount: number;
  grossSalary: number;

  // Statutory Insurance (Người lao động trích đóng 10.5%)
  insuranceSalary: number;
  bhxh: number; // 8%
  bhyt: number; // 1.5%
  bhtn: number; // 1%
  insuranceDeduction: number; // 10.5% (bhxh + bhyt + bhtn)

  // Reliefs (Giảm trừ gia cảnh theo Luật Thuế TNCN)
  personalRelief: number; // 11,000,000 VND/tháng
  dependentsRelief: number; // 4,400,000 VND/người/tháng
  totalRelief: number;

  // Taxable Income & Progressive 7-Tier PIT
  taxableIncome: number;
  personalIncomeTax: number;
  taxBrackets: TaxBracketBreakdown[];

  // Final Net Salary
  netSalary: number;
}

export class PayrollService {
  /**
   * Pure statutory payroll calculation function - Compliant with Vietnam Labor Law & PIT Law
   */
  static calculateSalary(input: PayrollCalculationInput): PayrollCalculationResult {
    const standardDays = input.standardDays || 22;
    const paidLeaveDays = input.paidLeaveDays || 0;
    const totalCountedDays = Math.min(
      standardDays,
      Math.max(0, input.actualWorkDays + paidLeaveDays)
    );

    // 1. Prorated base salary based on working days
    const baseSalary = input.baseSalary || 0;
    const baseSalaryEarned = Math.round((baseSalary / standardDays) * totalCountedDays);
    const allowance = input.allowance || 0;
    const rewardAmount = input.rewardAmount || 0;
    const grossSalary = baseSalaryEarned + allowance + rewardAmount;

    // 2. Statutory Insurance Deduction: 10.5% (BHXH 8%, BHYT 1.5%, BHTN 1%)
    const insBase =
      input.insuranceSalary && input.insuranceSalary > 0
        ? input.insuranceSalary
        : baseSalary;

    // Ceiling caps (Trần đóng bảo hiểm):
    // BHXH & BHYT: Max 20 times Base Salary (Mức lương cơ sở 2,340,000 * 20 = 46,800,000 VND)
    const cappedBhxhBase = Math.min(insBase, 46800000);
    // BHTN: Max 20 times Region I Min Wage (4,960,000 * 20 = 99,200,000 VND)
    const cappedBhtnBase = Math.min(insBase, 99200000);

    const bhxh = Math.round(cappedBhxhBase * 0.08);
    const bhyt = Math.round(cappedBhxhBase * 0.015);
    const bhtn = Math.round(cappedBhtnBase * 0.01);
    const insuranceDeduction = bhxh + bhyt + bhtn;

    // 3. Family Reliefs (Giảm trừ gia cảnh - Nghị quyết 954/2020/UBTVQH14)
    const personalRelief = 11000000; // 11,000,000 VND/month
    const dependentsCount = Math.max(0, input.dependentsCount || 0);
    const dependentsRelief = dependentsCount * 4400000; // 4,400,000 VND/person/month
    const totalRelief = personalRelief + dependentsRelief;

    // 4. Taxable Income (Thu nhập tính thuế)
    const taxableIncome = Math.max(0, grossSalary - insuranceDeduction - totalRelief);

    // 5. Progressive PIT 7-Tier Brackets (Điều 22 Luật Thuế TNCN & Thông tư 111/2013/TT-BTC)
    const tiers = [
      { tier: 1, bracketName: 'Bậc 1', taxableRange: 'Đến 5 triệu', maxSpan: 5000000, rate: 0.05 },
      { tier: 2, bracketName: 'Bậc 2', taxableRange: 'Trên 5 - 10 triệu', maxSpan: 5000000, rate: 0.10 },
      { tier: 3, bracketName: 'Bậc 3', taxableRange: 'Trên 10 - 18 triệu', maxSpan: 8000000, rate: 0.15 },
      { tier: 4, bracketName: 'Bậc 4', taxableRange: 'Trên 18 - 32 triệu', maxSpan: 14000000, rate: 0.20 },
      { tier: 5, bracketName: 'Bậc 5', taxableRange: 'Trên 32 - 52 triệu', maxSpan: 20000000, rate: 0.25 },
      { tier: 6, bracketName: 'Bậc 6', taxableRange: 'Trên 52 - 80 triệu', maxSpan: 28000000, rate: 0.30 },
      { tier: 7, bracketName: 'Bậc 7', taxableRange: 'Trên 80 triệu', maxSpan: Infinity, rate: 0.35 },
    ];

    let remainingTaxable = taxableIncome;
    const taxBrackets: TaxBracketBreakdown[] = [];
    let personalIncomeTax = 0;

    for (const t of tiers) {
      if (remainingTaxable <= 0) {
        taxBrackets.push({
          tier: t.tier,
          bracketName: t.bracketName,
          taxableRange: t.taxableRange,
          rate: t.rate,
          taxableAmount: 0,
          taxAmount: 0,
        });
        continue;
      }

      const taxableInThisTier = Math.min(remainingTaxable, t.maxSpan);
      const taxInThisTier = Math.round(taxableInThisTier * t.rate);
      personalIncomeTax += taxInThisTier;
      remainingTaxable -= taxableInThisTier;

      taxBrackets.push({
        tier: t.tier,
        bracketName: t.bracketName,
        taxableRange: t.taxableRange,
        rate: t.rate,
        taxableAmount: taxableInThisTier,
        taxAmount: taxInThisTier,
      });
    }

    // 6. Net Take-Home Salary
    const netSalary = Math.max(0, grossSalary - insuranceDeduction - personalIncomeTax);

    return {
      standardDays,
      actualWorkDays: totalCountedDays,
      baseSalary,
      baseSalaryEarned,
      allowance,
      rewardAmount,
      grossSalary,
      insuranceSalary: insBase,
      bhxh,
      bhyt,
      bhtn,
      insuranceDeduction,
      personalRelief,
      dependentsRelief,
      totalRelief,
      taxableIncome,
      personalIncomeTax,
      taxBrackets,
      netSalary,
    };
  }

  /**
   * Helper to count business days (Monday - Friday) within the intersection of a date range and the payroll month
   */
  private static countBusinessDaysInMonth(
    leaveStart: Date,
    leaveEnd: Date,
    monthStart: Date,
    monthEnd: Date
  ): number {
    const effectiveStart = new Date(Math.max(leaveStart.getTime(), monthStart.getTime()));
    const effectiveEnd = new Date(Math.min(leaveEnd.getTime(), monthEnd.getTime()));
    if (effectiveStart > effectiveEnd) return 0;

    let count = 0;
    const cur = new Date(effectiveStart);
    cur.setHours(0, 0, 0, 0);
    const targetEnd = new Date(effectiveEnd);
    targetEnd.setHours(23, 59, 59, 999);

    while (cur <= targetEnd) {
      const day = cur.getDay();
      // 0: Sunday, 6: Saturday
      if (day !== 0 && day !== 6) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }

  /**
   * Run payroll calculation for all active employees for a given month/year
   */
  static async runMonthlyPayroll(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const employees = await prisma.employeeProfile.findMany({
      include: {
        user: true,
        contracts: {
          where: { status: 'ACTIVE' },
          orderBy: { startDate: 'desc' },
          take: 1,
        },
        attendances: {
          where: {
            date: { gte: startDate, lte: endDate },
          },
        },
        leaveRequests: {
          where: {
            status: 'APPROVED',
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        },
        rewards: {
          where: {
            decisionDate: { gte: startDate, lte: endDate },
          },
        },
      },
    });

    const results = [];

    for (const emp of employees) {
      // 1. Calculate actual work days from attendance
      let actualDays = 0;
      for (const att of emp.attendances) {
        if (att.status === 'PRESENT' || att.status === 'LATE') {
          actualDays += 1;
        } else if (att.status === 'HALF_DAY') {
          actualDays += 0.5;
        }
      }

      // 2. Count paid leaves (ANNUAL, MATERNITY, COMPASSIONATE) strictly for working days within this month
      let paidLeaveDays = 0;
      for (const leave of emp.leaveRequests) {
        if (
          leave.leaveType === 'ANNUAL' ||
          leave.leaveType === 'MATERNITY' ||
          leave.leaveType === 'COMPASSIONATE'
        ) {
          paidLeaveDays += this.countBusinessDaysInMonth(
            leave.startDate,
            leave.endDate,
            startDate,
            endDate
          );
        }
      }

      // If no attendance was logged yet (e.g. demonstration run), default to 22 standard days
      if (actualDays === 0 && emp.attendances.length === 0) {
        actualDays = 22;
      }

      // 3. Sum reward amounts for decisions issued in this month
      const rewardAmount = emp.rewards?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

      const activeContract = emp.contracts?.[0];
      const insuranceSalary = activeContract?.salaryInsurance || emp.baseSalary;

      const calc = this.calculateSalary({
        baseSalary: emp.baseSalary,
        allowance: emp.allowance,
        rewardAmount,
        standardDays: 22,
        actualWorkDays: actualDays,
        paidLeaveDays,
        insuranceSalary,
      });

      // Upsert payroll record
      const payroll = await prisma.payroll.upsert({
        where: {
          employeeId_month_year: {
            employeeId: emp.id,
            month,
            year,
          },
        },
        update: {
          standardDays: calc.standardDays,
          actualWorkDays: calc.actualWorkDays,
          baseSalary: emp.baseSalary,
          allowance: calc.allowance,
          rewardAmount: calc.rewardAmount,
          insuranceSalary: calc.insuranceSalary,
          bhxh: calc.bhxh,
          bhyt: calc.bhyt,
          bhtn: calc.bhtn,
          deductions: calc.insuranceDeduction,
          taxableIncome: calc.taxableIncome,
          tax: calc.personalIncomeTax,
          netSalary: calc.netSalary,
        },
        create: {
          employeeId: emp.id,
          month,
          year,
          standardDays: calc.standardDays,
          actualWorkDays: calc.actualWorkDays,
          baseSalary: emp.baseSalary,
          allowance: calc.allowance,
          rewardAmount: calc.rewardAmount,
          insuranceSalary: calc.insuranceSalary,
          bhxh: calc.bhxh,
          bhyt: calc.bhyt,
          bhtn: calc.bhtn,
          deductions: calc.insuranceDeduction,
          taxableIncome: calc.taxableIncome,
          tax: calc.personalIncomeTax,
          netSalary: calc.netSalary,
          isPaid: false,
        },
      });

      results.push(payroll);
    }

    return results;
  }

  static async getPayrolls(filters: {
    month?: number;
    year?: number;
    employeeId?: string;
  }) {
    const where: any = {};
    if (filters.month) where.month = filters.month;
    if (filters.year) where.year = filters.year;
    if (filters.employeeId) where.employeeId = filters.employeeId;

    return await prisma.payroll.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            department: true,
            position: true,
            bankAccountNumber: true,
            bankName: true,
            bankBranch: true,
            annualLeaveBalance: true,
            user: { select: { email: true } },
          },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  static async getPayrollById(id: string) {
    const payroll = await prisma.payroll.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: { select: { email: true } },
            contracts: {
              where: { status: 'ACTIVE' },
              orderBy: { startDate: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!payroll) {
      throw new Error('Không tìm thấy bản ghi lương.');
    }

    // Attach calculated breakdown details
    const breakdown = this.calculateSalary({
      baseSalary: payroll.baseSalary,
      allowance: payroll.allowance,
      rewardAmount: payroll.rewardAmount,
      standardDays: payroll.standardDays,
      actualWorkDays: payroll.actualWorkDays,
      insuranceSalary: payroll.insuranceSalary || payroll.baseSalary,
    });

    return {
      ...payroll,
      breakdown,
    };
  }

  static async markAsPaid(id: string) {
    return await prisma.payroll.update({
      where: { id },
      data: {
        isPaid: true,
        paidAt: new Date(),
      },
    });
  }
}
