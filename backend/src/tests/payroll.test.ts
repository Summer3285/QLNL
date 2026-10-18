import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { PayrollService } from '../services/payroll.service.js';

describe('Payroll Calculation Service (Enterprise Unit Tests)', () => {
  it('should correctly calculate full salary for 22/22 working days with statutory deductions', () => {
    const input = {
      baseSalary: 20000000, // 20,000,000 VND
      allowance: 2000000,   // 2,000,000 VND
      standardDays: 22,
      actualWorkDays: 22,
    };

    const result = PayrollService.calculateSalary(input);

    // 1. Base salary earned should be full
    assert.strictEqual(result.baseSalaryEarned, 20000000);

    // 2. Gross salary = 20M + 2M = 22M
    assert.strictEqual(result.grossSalary, 22000000);

    // 3. Insurance breakdown: BHXH 8% (1.6M) + BHYT 1.5% (300k) + BHTN 1% (200k) = 2.1M (10.5%)
    assert.strictEqual(result.bhxh, 1600000);
    assert.strictEqual(result.bhyt, 300000);
    assert.strictEqual(result.bhtn, 200000);
    assert.strictEqual(result.insuranceDeduction, 2100000);

    // 4. Taxable income = Gross (22M) - Insurance (2.1M) - Personal Relief (11M) = 8,900,000 VND
    assert.strictEqual(result.taxableIncome, 8900000);

    // 5. PIT Tax (7-tier progressive):
    // Tier 1 (first 5M @ 5% = 250,000)
    // Tier 2 (remaining 3.9M @ 10% = 390,000)
    // Total Tax = 640,000 VND
    assert.strictEqual(result.personalIncomeTax, 640000);

    // 6. Net salary = Gross (22M) - Insurance (2.1M) - Tax (640,000) = 19,260,000 VND
    assert.strictEqual(result.netSalary, 19260000);
  });

  it('should accurately cap insurance salary at statutory limits for high earners', () => {
    // 60,000,000 VND base salary
    // BHXH & BHYT ceiling is 46,800,000 VND (20 * 2,340,000)
    // BHTN ceiling is 99,200,000 VND (20 * 4,960,000)
    const input = {
      baseSalary: 60000000,
      allowance: 5000000,
      standardDays: 22,
      actualWorkDays: 22,
    };

    const result = PayrollService.calculateSalary(input);

    // BHXH: 46,800,000 * 8% = 3,744,000
    assert.strictEqual(result.bhxh, 3744000);
    // BHYT: 46,800,000 * 1.5% = 702,000
    assert.strictEqual(result.bhyt, 702000);
    // BHTN: 60,000,000 * 1% = 600,000 (below 99.2M cap)
    assert.strictEqual(result.bhtn, 600000);
    // Total Insurance: 3,744,000 + 702,000 + 600,000 = 5,046,000 VND
    assert.strictEqual(result.insuranceDeduction, 5046000);
  });

  it('should accurately calculate progressive tax across tiers 1 to 5', () => {
    // Gross = 50M, Insurance = 10.5% * 46.8M/50M -> Taxable ~ 34M (Tier 4 & 5)
    const input = {
      baseSalary: 40000000,
      allowance: 10000000,
      standardDays: 22,
      actualWorkDays: 22,
    };

    const result = PayrollService.calculateSalary(input);

    // Gross = 50,000,000
    // Insurance = 40M * 10.5% = 4,200,000
    // Personal Relief = 11,000,000
    // Taxable = 50,000,000 - 4,200,000 - 11,000,000 = 34,800,000 VND
    assert.strictEqual(result.taxableIncome, 34800000);

    // Tier 1 (5M @ 5%): 250,000
    // Tier 2 (5M @ 10%): 500,000
    // Tier 3 (8M @ 15%): 1,200,000
    // Tier 4 (14M @ 20%): 2,800,000
    // Tier 5 (2.8M @ 25%): 700,000
    // Total Tax: 250k + 500k + 1.2M + 2.8M + 700k = 5,450,000 VND
    assert.strictEqual(result.personalIncomeTax, 5450000);
    assert.strictEqual(result.taxBrackets.length, 7);
  });

  it('should reduce taxable income and tax when employee has dependents', () => {
    const inputWithoutDependents = {
      baseSalary: 30000000,
      allowance: 0,
      standardDays: 22,
      actualWorkDays: 22,
      dependentsCount: 0,
    };

    const inputWithDependents = {
      baseSalary: 30000000,
      allowance: 0,
      standardDays: 22,
      actualWorkDays: 22,
      dependentsCount: 2, // 2 dependents = 8,800,000 VND relief
    };

    const res0 = PayrollService.calculateSalary(inputWithoutDependents);
    const res2 = PayrollService.calculateSalary(inputWithDependents);

    // Relief difference must be 8,800,000
    assert.strictEqual(res2.dependentsRelief, 8800000);
    assert.strictEqual(res0.taxableIncome - res2.taxableIncome, 8800000);
    // Tax with dependents must be significantly lower
    assert.ok(res2.personalIncomeTax < res0.personalIncomeTax);
  });

  it('should prorate base salary accurately when employee works partial days (11/22 days)', () => {
    const input = {
      baseSalary: 30000000, // 30,000,000 VND
      allowance: 3000000,   // 3,000,000 VND
      standardDays: 22,
      actualWorkDays: 11,   // 50% working days
    };

    const result = PayrollService.calculateSalary(input);

    // Earned base salary = (30M / 22) * 11 = 15,000,000 VND
    assert.strictEqual(result.baseSalaryEarned, 15000000);
    assert.strictEqual(result.grossSalary, 18000000);
    assert.strictEqual(result.actualWorkDays, 11);
  });

  it('should include approved paid leaves into counted work days', () => {
    const input = {
      baseSalary: 44000000, // 44,000,000 VND
      allowance: 4000000,
      standardDays: 22,
      actualWorkDays: 18,   // 18 days worked
      paidLeaveDays: 4,     // 4 days approved annual leave
    };

    const result = PayrollService.calculateSalary(input);

    // Total counted days = 18 + 4 = 22 days (100% full base salary)
    assert.strictEqual(result.actualWorkDays, 22);
    assert.strictEqual(result.baseSalaryEarned, 44000000);
  });

  it('should cap counted working days at standardDays even if attendance + leaves exceed', () => {
    const input = {
      baseSalary: 22000000,
      allowance: 0,
      standardDays: 22,
      actualWorkDays: 22,
      paidLeaveDays: 3,
    };

    const result = PayrollService.calculateSalary(input);

    // Should be capped at standard 22 days
    assert.strictEqual(result.actualWorkDays, 22);
    assert.strictEqual(result.baseSalaryEarned, 22000000);
  });
});
