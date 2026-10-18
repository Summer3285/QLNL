import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { prisma } from '../config/prisma.js';
import { RecruitmentService } from '../services/recruitment.service.js';

describe('Recruitment & One-Click Onboarding Service (Enterprise Unit Tests)', () => {
  let testPlanId: string;
  let testCandidateId: string;
  const testCandidateEmail = `test.candidate.${Date.now()}@nexnova.tech`;
  const testCandidateCode = `NV-TEST-${Date.now().toString().slice(-4)}`;

  before(async () => {
    // Tạo 1 kế hoạch tuyển dụng test
    const plan = await prisma.recruitmentPlan.create({
      data: {
        title: 'Tuyển Dụng Kỹ Sư DevOps Test 2026',
        department: 'Hạ Tầng & Cloud',
        position: 'Senior DevOps Cloud Engineer',
        quantity: 2,
        requirements: 'Kubernetes, Terraform, AWS/GCP',
        deadline: new Date('2026-12-31'),
        status: 'OPEN',
      },
    });
    testPlanId = plan.id;

    // Tạo 1 ứng viên test
    const candidate = await RecruitmentService.createCandidate({
      planId: testPlanId,
      fullName: 'Trần Văn Tuyển Dụng',
      email: testCandidateEmail,
      phone: '0988776655',
      status: 'OFFERED',
      notes: 'Ứng viên đạt 95/100 điểm phỏng vấn kỹ thuật vòng cuối.',
    });
    testCandidateId = candidate.id;
  });

  after(async () => {
    // Dọn dẹp dữ liệu test
    try {
      const user = await prisma.user.findUnique({ where: { email: testCandidateEmail.toLowerCase() } });
      if (user) {
        await prisma.user.delete({ where: { id: user.id } });
      }
      if (testCandidateId) {
        await prisma.candidate.deleteMany({ where: { id: testCandidateId } });
      }
      if (testPlanId) {
        await prisma.recruitmentPlan.deleteMany({ where: { id: testPlanId } });
      }
    } catch (e) {
      // Ignore cleanup error
    }
  });

  it('should generate a valid next employee code format (NV-xxx)', async () => {
    const code = await RecruitmentService.getNextEmployeeCode();
    assert.ok(code.startsWith('NV-'), 'Mã nhân viên phải bắt đầu bằng NV-');
    assert.ok(code.length >= 6, 'Mã nhân viên phải có độ dài tối thiểu 6 ký tự');
  });

  it('should successfully update candidate status through pipeline stages', async () => {
    const updated = await RecruitmentService.updateCandidateStatus(testCandidateId, {
      status: 'OFFERED',
      notes: 'Đã gửi thư mời nhận việc với mức lương thỏa thuận.',
    });
    assert.strictEqual(updated.status, 'OFFERED');
    assert.ok(updated.notes?.includes('thư mời nhận việc'));
  });

  it('should successfully convert an offered candidate into employee & create probation contract (One-Click Onboarding)', async () => {
    const result = await RecruitmentService.convertCandidateToEmployee({
      candidateId: testCandidateId,
      employeeCode: testCandidateCode,
      position: 'Senior DevOps Cloud Engineer',
      contractType: 'PROBATION',
      baseSalary: 25000000,
      salaryInsurance: 21250000, // 85% lương cơ sở theo luật
      joinDate: '2026-11-01',
      passwordPlain: 'CandidatePass123!',
      gender: 'Nam',
    });

    // 1. Kiểm tra User
    assert.ok(result.user.id);
    assert.strictEqual(result.user.email, testCandidateEmail.toLowerCase());
    assert.strictEqual(result.user.role, 'EMPLOYEE');

    // 2. Kiểm tra Profile
    assert.strictEqual(result.employee.employeeCode, testCandidateCode);
    assert.strictEqual(result.employee.fullName, 'Trần Văn Tuyển Dụng');
    assert.strictEqual(result.employee.baseSalary, 25000000);
    assert.strictEqual(result.employee.annualLeaveBalance, 12);
    assert.strictEqual(result.employee.cadreType, 'STAFF');

    // 3. Kiểm tra Contract
    assert.ok(result.contract.id);
    assert.strictEqual(result.contract.contractType, 'PROBATION');
    assert.strictEqual(result.contract.salaryInsurance, 21250000);
    assert.strictEqual(result.contract.status, 'ACTIVE');
    assert.ok(result.contract.contractNumber.startsWith('HĐLĐ-'));

    // 4. Kiểm tra Candidate cập nhật thành HIRED
    assert.strictEqual(result.candidate.status, 'HIRED');
    assert.ok(result.candidate.notes?.includes('[ONBOARDED]'));
  });

  it('should reject converting when email is already taken in the system', async () => {
    // Tạo thêm 1 ứng viên mới với email trùng với tài khoản vừa tạo
    const duplicateCandidate = await prisma.candidate.create({
      data: {
        planId: testPlanId,
        fullName: 'Người Trùng Email',
        email: testCandidateEmail, // Trùng
        phone: '0911223344',
        status: 'OFFERED',
      },
    });

    try {
      await assert.rejects(
        async () => {
          await RecruitmentService.convertCandidateToEmployee({
            candidateId: duplicateCandidate.id,
            employeeCode: `NV-DUP-${Date.now().toString().slice(-4)}`,
            baseSalary: 20000000,
          });
        },
        /Email.*đã được sử dụng/i
      );
    } finally {
      await prisma.candidate.deleteMany({ where: { id: duplicateCandidate.id } });
    }
  });

  it('should reject converting when employeeCode is already taken', async () => {
    const anotherCandidate = await prisma.candidate.create({
      data: {
        planId: testPlanId,
        fullName: 'Người Trùng Mã NV',
        email: `another.candidate.${Date.now()}@gmail.com`,
        phone: '0922334455',
        status: 'OFFERED',
      },
    });

    try {
      await assert.rejects(
        async () => {
          await RecruitmentService.convertCandidateToEmployee({
            candidateId: anotherCandidate.id,
            employeeCode: testCandidateCode, // Trùng mã đã tạo
            baseSalary: 20000000,
          });
        },
        /Mã nhân viên.*đã tồn tại/i
      );
    } finally {
      await prisma.candidate.deleteMany({ where: { id: anotherCandidate.id } });
    }
  });
});
