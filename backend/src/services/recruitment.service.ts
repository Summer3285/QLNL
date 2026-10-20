import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';

export class RecruitmentService {
  // Plans
  static async createPlan(data: {
    title: string;
    department: string;
    departmentId?: string;
    position: string;
    quantity: number;
    requirements: string;
    deadline: string;
  }) {
    return await prisma.recruitmentPlan.create({
      data: {
        title: data.title,
        department: data.department,
        departmentId: data.departmentId,
        position: data.position,
        quantity: data.quantity,
        requirements: data.requirements,
        deadline: new Date(data.deadline),
        status: 'OPEN',
      },
    });
  }

  static async getPlans() {
    return await prisma.recruitmentPlan.findMany({
      include: {
        _count: { select: { candidates: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updatePlanStatus(id: string, status: string) {
    return await prisma.recruitmentPlan.update({
      where: { id },
      data: { status },
    });
  }

  // Candidates
  static async createCandidate(data: {
    planId: string;
    fullName: string;
    email: string;
    phone: string;
    status?: string;
    probationMonths?: number;
    notes?: string;
  }) {
    return await prisma.candidate.create({
      data: {
        planId: data.planId,
        fullName: data.fullName,
        email: data.email.trim(),
        phone: data.phone.trim(),
        notes: data.notes,
        status: data.status || 'APPLIED',
        probationMonths: data.probationMonths || 2,
      },
    });
  }

  static async getCandidates(planId?: string) {
    const where: any = {};
    if (planId && planId !== 'ALL') where.planId = planId;

    return await prisma.candidate.findMany({
      where,
      include: {
        plan: {
          select: { id: true, title: true, department: true, position: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateCandidateStatus(
    id: string,
    data: {
      status: string;
      probationMonths?: number;
      probationStartDate?: string;
      notes?: string;
    }
  ) {
    let probationEndDate: Date | undefined = undefined;

    if (data.status === 'PROBATION' && data.probationStartDate && data.probationMonths) {
      const start = new Date(data.probationStartDate);
      probationEndDate = new Date(start);
      probationEndDate.setMonth(probationEndDate.getMonth() + data.probationMonths);
    }

    const updateData: any = {
      status: data.status,
    };

    if (data.probationMonths !== undefined) {
      updateData.probationMonths = data.probationMonths;
    }
    if (data.probationStartDate) {
      updateData.probationStartDate = new Date(data.probationStartDate);
    }
    if (probationEndDate) {
      updateData.probationEndDate = probationEndDate;
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    return await prisma.candidate.update({
      where: { id },
      data: updateData,
    });
  }

  static getDeptCodePrefix(department?: string): string {
    if (!department) return 'ENG';
    const deptUpper = department.toUpperCase();
    if (deptUpper.includes('TECH') || deptUpper.includes('ENG') || deptUpper.includes('SOFTWARE') || deptUpper.includes('KỸ THUẬT')) return 'ENG';
    if (deptUpper.includes('AI') || deptUpper.includes('DATA')) return 'AI';
    if (deptUpper.includes('PROD') || deptUpper.includes('DESIGN') || deptUpper.includes('SẢN PHẨM') || deptUpper.includes('PRD')) return 'PRD';
    if (deptUpper.includes('HR') || deptUpper.includes('CULTURE') || deptUpper.includes('PEOPLE') || deptUpper.includes('NHÂN SỰ')) return 'HR';
    if (deptUpper.includes('FIN') || deptUpper.includes('TÀI CHÍNH') || deptUpper.includes('KẾ TOÁN')) return 'FIN';
    return 'ENG';
  }

  // Gợi ý mã nhân viên kế tiếp theo chuẩn NexNova: NN-[MÃ_PHÒNG]-[STT_3_CHỮ_SỐ]
  static async getNextEmployeeCode(department?: string): Promise<string> {
    const deptPrefix = this.getDeptCodePrefix(department);
    const prefix = `NN-${deptPrefix}-`;

    const profiles = await prisma.employeeProfile.findMany({
      where: {
        employeeCode: {
          startsWith: prefix,
        },
      },
      select: { employeeCode: true },
    });

    let maxNum = 0;
    for (const p of profiles) {
      const numPart = p.employeeCode.replace(prefix, '');
      const parsed = parseInt(numPart, 10);
      if (!isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    }

    const nextNum = maxNum + 1;
    let code = `${prefix}${String(nextNum).padStart(3, '0')}`;
    const exists = await prisma.employeeProfile.findUnique({ where: { employeeCode: code } });
    if (!exists) return code;
    return `${prefix}${String(nextNum + 1).padStart(3, '0')}`;
  }

  // Onboarding One-Click: Chuyển đổi ứng viên thành nhân viên chính thức
  static async convertCandidateToEmployee(data: {
    candidateId: string;
    employeeCode: string;
    departmentId?: string;
    departmentName?: string;
    position?: string;
    contractType?: string; // PROBATION | DEFINITE_1Y | DEFINITE_3Y | INDEFINITE
    baseSalary: number;
    salaryInsurance?: number;
    joinDate?: string;
    passwordPlain?: string;
    gender?: string;
  }) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: data.candidateId },
      include: { plan: true },
    });

    if (!candidate) {
      throw new Error('Không tìm thấy thông tin ứng viên.');
    }

    const email = candidate.email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error(`Email ${email} đã được sử dụng bởi một tài khoản khác trong hệ thống.`);
    }

    const code = data.employeeCode.trim().toUpperCase();
    const existingCode = await prisma.employeeProfile.findUnique({ where: { employeeCode: code } });
    if (existingCode) {
      throw new Error(`Mã nhân viên ${code} đã tồn tại trong hệ thống.`);
    }

    // Xác định tên phòng ban & ID phòng ban
    let departmentName = data.departmentName || candidate.plan.department || 'Phát Triển Phần Mềm';
    let departmentId = data.departmentId || candidate.plan.departmentId;

    if (departmentId && !data.departmentName) {
      const dept = await prisma.department.findUnique({ where: { id: departmentId } });
      if (dept) departmentName = dept.name;
    } else if (!departmentId && departmentName) {
      const dept = await prisma.department.findFirst({ where: { name: departmentName } });
      if (dept) departmentId = dept.id;
    }

    // Xác định thời hạn hợp đồng & bảo hiểm
    const joinDate = data.joinDate ? new Date(data.joinDate) : new Date();
    const contractType = data.contractType || 'PROBATION';
    let contractEndDate: Date | null = null;
    const probationMonths = candidate.probationMonths || 2;

    if (contractType === 'PROBATION') {
      contractEndDate = new Date(joinDate);
      contractEndDate.setMonth(contractEndDate.getMonth() + probationMonths);
    } else if (contractType === 'DEFINITE_1Y') {
      contractEndDate = new Date(joinDate);
      contractEndDate.setFullYear(contractEndDate.getFullYear() + 1);
    } else if (contractType === 'DEFINITE_3Y') {
      contractEndDate = new Date(joinDate);
      contractEndDate.setFullYear(contractEndDate.getFullYear() + 3);
    }

    // Mức lương đóng BHXH: Thử việc tối thiểu 85% mức lương chính thức theo Luật LĐ Việt Nam
    const defaultInsurance = contractType === 'PROBATION'
      ? Math.round(data.baseSalary * 0.85)
      : data.baseSalary;
    const salaryInsurance = data.salaryInsurance !== undefined ? data.salaryInsurance : defaultInsurance;

    // Số hợp đồng lao động chuẩn
    const year = new Date().getFullYear();
    const cleanCode = code.replace(/[^A-Z0-9]/gi, '');
    let contractNumber = `HĐLĐ-${year}/${cleanCode}`;
    const existingContract = await prisma.contract.findUnique({ where: { contractNumber } });
    if (existingContract) {
      contractNumber = `HĐLĐ-${year}/${cleanCode}-${Date.now().toString().slice(-4)}`;
    }

    const passwordHash = await bcrypt.hash(data.passwordPlain || 'password123', 12);

    return await prisma.$transaction(async (tx) => {
      // 1. Tạo tài khoản User
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: 'EMPLOYEE',
        },
      });

      // 2. Tạo Hồ sơ nhân viên EmployeeProfile
      const profile = await tx.employeeProfile.create({
        data: {
          userId: user.id,
          employeeCode: code,
          fullName: candidate.fullName,
          gender: data.gender || 'Nam',
          phone: candidate.phone,
          department: departmentName,
          departmentId: departmentId || null,
          position: data.position || candidate.plan.position,
          baseSalary: data.baseSalary,
          joinDate,
          annualLeaveBalance: 12,
          cadreType: 'STAFF',
          isCadre: false,
        },
        include: {
          departmentRef: true,
        },
      });

      // 3. Tạo Hợp đồng lao động khởi tạo (Contract)
      const contract = await tx.contract.create({
        data: {
          contractNumber,
          employeeId: profile.id,
          contractType,
          jobTitle: data.position || candidate.plan.position,
          startDate: joinDate,
          endDate: contractEndDate,
          signedDate: new Date(),
          salaryInsurance,
          status: 'ACTIVE',
          note: `Hợp đồng tạo tự động từ Onboarding ứng viên ${candidate.fullName} (Kế hoạch: ${candidate.plan.title})`,
        },
      });

      // 4. Cập nhật trạng thái Candidate thành HIRED
      const updatedCandidate = await tx.candidate.update({
        where: { id: candidate.id },
        data: {
          status: 'HIRED',
          probationStartDate: contractType === 'PROBATION' ? joinDate : null,
          probationEndDate: contractType === 'PROBATION' ? contractEndDate : null,
          notes: (candidate.notes ? `${candidate.notes}\n` : '') +
            `[ONBOARDED] Đã chuyển đổi thành nhân viên ${code} (${email}) vào ngày ${new Date().toLocaleDateString('vi-VN')}`,
        },
      });

      return {
        candidate: updatedCandidate,
        user: { id: user.id, email: user.email, role: user.role },
        employee: profile,
        contract,
      };
    });
  }

  // Probation Expiry Alerts
  static async getProbationAlerts() {
    const now = new Date();

    // 1. Candidates in PROBATION
    const candidates = await prisma.candidate.findMany({
      where: {
        status: 'PROBATION',
        probationEndDate: { not: null },
      },
      include: { plan: true },
      orderBy: { probationEndDate: 'asc' },
    });

    const candidateAlerts = candidates.map((c) => {
      const end = new Date(c.probationEndDate!);
      const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        status: c.status,
        probationMonths: c.probationMonths,
        probationStartDate: c.probationStartDate,
        probationEndDate: c.probationEndDate,
        notes: c.notes,
        plan: c.plan,
        daysRemaining: diffDays,
        isExpired: diffDays <= 0,
        isExpiringSoon: diffDays > 0 && diffDays <= 15,
      };
    });

    // 2. Active probation contracts of employees
    const probationContracts = await prisma.contract.findMany({
      where: {
        contractType: 'PROBATION',
        status: 'ACTIVE',
        endDate: { not: null },
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            position: true,
            department: true,
            user: { select: { email: true } },
          },
        },
      },
      orderBy: { endDate: 'asc' },
    });

    const candidateEmails = new Set(candidateAlerts.map((c) => c.email.toLowerCase()));
    const employeeAlerts = probationContracts
      .filter((ct) => ct.employee?.user?.email && !candidateEmails.has(ct.employee.user.email.toLowerCase()))
      .map((ct) => {
        const end = new Date(ct.endDate!);
        const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: ct.id,
          fullName: ct.employee.fullName,
          email: ct.employee.user?.email || '',
          phone: ct.employee.phone || '',
          status: 'PROBATION',
          probationMonths: 2,
          probationStartDate: ct.startDate,
          probationEndDate: ct.endDate,
          notes: ct.note || `Hợp đồng thử việc ${ct.contractNumber}`,
          plan: {
            id: ct.id,
            title: `HĐ ${ct.contractNumber}`,
            department: ct.employee.department,
            position: ct.employee.position || ct.jobTitle || 'Nhân sự',
          },
          daysRemaining: diffDays,
          isExpired: diffDays <= 0,
          isExpiringSoon: diffDays > 0 && diffDays <= 15,
        };
      });

    return [...candidateAlerts, ...employeeAlerts];
  }
}

