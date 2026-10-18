import { prisma } from '../config/prisma.js';

export class ReportsService {
  // 1. Cán bộ đến kỳ xét nâng lương (niên hạn 24 hoặc 36 tháng)
  static async getSalaryRaiseDue() {
    const employees = await prisma.employeeProfile.findMany({
      include: {
        user: { select: { email: true } },
      },
      orderBy: { lastSalaryRaise: 'asc' },
    });

    const now = new Date();

    return employees.map((emp) => {
      const lastRaise = emp.lastSalaryRaise ? new Date(emp.lastSalaryRaise) : new Date(emp.joinDate);
      const diffMonths = Math.floor(
        (now.getTime() - lastRaise.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );

      const isEligible = diffMonths >= 24; // Quá 2 năm chưa nâng lương

      return {
        id: emp.id,
        employeeCode: emp.employeeCode,
        fullName: emp.fullName,
        department: emp.department,
        position: emp.position,
        currentSalary: emp.baseSalary,
        baseSalary: emp.baseSalary,
        lastSalaryRaise: lastRaise.toISOString().split('T')[0],
        monthsSinceLastRaise: diffMonths,
        isDue: isEligible,
        eligible: isEligible,
      };
    });
  }

  // 2. Cán bộ đến tuổi nghỉ hưu (Nam 62, Nữ 60)
  static async getRetirementDue() {
    const employees = await prisma.employeeProfile.findMany({
      where: { dateOfBirth: { not: null } },
      include: { user: { select: { email: true } } },
    });

    const now = new Date();
    const currentYear = now.getFullYear();

    return employees
      .map((emp) => {
        const birthDateObj = new Date(emp.dateOfBirth!);
        const birthYear = birthDateObj.getFullYear();
        const age = currentYear - birthYear;
        const retirementAge = emp.gender === 'Nữ' ? 60 : 62;
        const yearsToRetire = retirementAge - age;
        const monthsRemaining = Math.max(0, Math.floor(yearsToRetire * 12));

        return {
          id: emp.id,
          employeeCode: emp.employeeCode,
          fullName: emp.fullName,
          gender: emp.gender || 'Nam',
          dateOfBirth: emp.dateOfBirth,
          birthDate: birthDateObj.toISOString().split('T')[0],
          department: emp.department,
          position: emp.position,
          age,
          retirementAge,
          retireAge: retirementAge,
          yearsToRetire,
          monthsRemaining,
          isDueSoon: yearsToRetire <= 2, // Còn dưới 2 năm nghỉ hưu
        };
      })
      .sort((a, b) => a.yearsToRetire - b.yearsToRetire);
  }

  // 3. Báo cáo cơ cấu nhân lực đa chiều
  static async getDemographics() {
    const employees = await prisma.employeeProfile.findMany();
    const currentYear = new Date().getFullYear();

    // Gender breakdown
    const genderCount: Record<string, number> = { Nam: 0, Nữ: 0 };
    // Age groups
    const ageGroups: Record<string, number> = { 'Dưới 30 tuổi': 0, '30 - 39 tuổi': 0, '40 - 49 tuổi': 0, 'Từ 50 tuổi trở lên': 0 };
    // Education breakdown
    const educationCount: Record<string, number> = {};
    // Department breakdown
    const departmentCount: Record<string, number> = {};

    for (const emp of employees) {
      // Gender
      const g = emp.gender || 'Nam';
      genderCount[g] = (genderCount[g] || 0) + 1;

      // Age
      if (emp.dateOfBirth) {
        const age = currentYear - new Date(emp.dateOfBirth).getFullYear();
        if (age < 30) ageGroups['Dưới 30 tuổi']++;
        else if (age < 40) ageGroups['30 - 39 tuổi']++;
        else if (age < 50) ageGroups['40 - 49 tuổi']++;
        else ageGroups['Từ 50 tuổi trở lên']++;
      } else {
        ageGroups['30 - 39 tuổi']++;
      }

      // Education
      const edu = emp.educationLevel || 'Đại học';
      educationCount[edu] = (educationCount[edu] || 0) + 1;

      // Department
      const dept = emp.department || 'Khác';
      departmentCount[dept] = (departmentCount[dept] || 0) + 1;
    }

    const genderStats = Object.entries(genderCount).map(([gender, count]) => ({ gender, count }));
    const educationStats = Object.entries(educationCount).map(([educationLevel, count]) => ({ educationLevel, count }));
    const departmentStats = Object.entries(departmentCount).map(([department, count]) => ({ department, count }));
    const ageStats = Object.entries(ageGroups).map(([range, count]) => ({ range, count }));

    return {
      total: employees.length,
      totalEmployees: employees.length,
      genderStats,
      educationStats,
      departmentStats,
      ageStats,
      gender: genderCount,
      age: ageGroups,
      education: educationCount,
      departments: departmentCount,
    };
  }

  // 4. Trích xuất sơ yếu lý lịch chuẩn in ấn
  static async getResumeData(id: string) {
    const emp = await prisma.employeeProfile.findUnique({
      where: { id },
      include: {
        user: true,
        rewards: { orderBy: { decisionDate: 'desc' } },
        disciplines: { orderBy: { decisionDate: 'desc' } },
        transfers: { orderBy: { transferDate: 'desc' } },
        payrolls: { take: 1, orderBy: { year: 'desc' } },
      },
    });

    if (!emp) {
      throw new Error('Không tìm thấy cán bộ.');
    }

    return emp;
  }
}
