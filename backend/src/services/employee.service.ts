import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { Role } from '../types/index.js';

export class EmployeeService {
  static async getAllEmployees(filters: {
    department?: string;
    departmentId?: string;
    cadreType?: string;
    isCadre?: boolean;
    search?: string;
    role?: Role;
  }) {
    const { department, departmentId, cadreType, isCadre, search, role } = filters;

    const where: any = {};

    if (departmentId && departmentId !== 'ALL') {
      where.departmentId = departmentId;
    } else if (department && department !== 'ALL') {
      where.department = department;
    }

    if (cadreType && cadreType !== 'ALL') {
      where.cadreType = cadreType;
    }

    if (isCadre !== undefined) {
      where.isCadre = isCadre;
    }

    if (role) {
      where.user = { role };
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { employeeCode: { contains: search } },
        { position: { contains: search } },
        { user: { email: { contains: search } } },
      ];
    }

    const employees = await prisma.employeeProfile.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, role: true, isActive: true, createdAt: true },
        },
        departmentRef: {
          select: { id: true, code: true, name: true, location: true },
        },
      },
      orderBy: [{ isCadre: 'desc' }, { employeeCode: 'asc' }],
    });

    return employees.map((emp) => ({
      ...emp,
      email: emp.user?.email || '',
      startDate: emp.joinDate ? emp.joinDate.toISOString().split('T')[0] : '',
      birthDate: emp.dateOfBirth ? emp.dateOfBirth.toISOString().split('T')[0] : '',
      appointmentFormatted: emp.appointmentDate ? emp.appointmentDate.toISOString().split('T')[0] : '',
    }));
  }

  static async getEmployeeById(id: string) {
    const employee = await prisma.employeeProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, role: true, isActive: true, createdAt: true },
        },
        departmentRef: true,
        managedDepartments: true,
        deputyDepartments: true,
        contracts: {
          orderBy: { createdAt: 'desc' },
        },
        lineManager: {
          select: { id: true, fullName: true, employeeCode: true, position: true },
        },
        subordinates: {
          select: { id: true, fullName: true, employeeCode: true, position: true },
        },
        rewards: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        disciplines: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        transfers: {
          take: 5,
          orderBy: { transferDate: 'desc' },
        },
        attendances: {
          take: 10,
          orderBy: { date: 'desc' },
        },
        leaveRequests: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        payrolls: {
          take: 6,
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
        },
      },
    });

    if (!employee) {
      throw new Error('Không tìm thấy nhân viên.');
    }

    return {
      ...employee,
      email: employee.user?.email || '',
      startDate: employee.joinDate ? employee.joinDate.toISOString().split('T')[0] : '',
      birthDate: employee.dateOfBirth ? employee.dateOfBirth.toISOString().split('T')[0] : '',
      appointmentFormatted: employee.appointmentDate ? employee.appointmentDate.toISOString().split('T')[0] : '',
    };
  }

  static async createEmployee(data: {
    email: string;
    passwordPlain: string;
    role: Role;
    employeeCode: string;
    fullName: string;
    dateOfBirth?: string;
    phone?: string;
    address?: string;
    department?: string;
    departmentId?: string;
    cadreType?: string;
    isCadre?: boolean;
    appointmentDate?: string;
    position: string;
    baseSalary: number;
    allowance?: number;
    joinDate?: string;
    idCardNumber?: string;
    idCardIssueDate?: string;
    idCardIssuePlace?: string;
    taxCode?: string;
    socialInsuranceNumber?: string;
    bankAccountNumber?: string;
    bankName?: string;
    bankBranch?: string;
    lineManagerId?: string;
    annualLeaveBalance?: number;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existingUser) {
      throw new Error('Email này đã được sử dụng trong hệ thống.');
    }

    const existingCode = await prisma.employeeProfile.findUnique({
      where: { employeeCode: data.employeeCode.toUpperCase() },
    });
    if (existingCode) {
      throw new Error('Mã nhân viên đã tồn tại.');
    }

    // Resolve department name and ID
    let departmentName = data.department || 'Software Engineering';
    let departmentId = data.departmentId;

    if (departmentId && !data.department) {
      const d = await prisma.department.findUnique({ where: { id: departmentId } });
      if (d) departmentName = d.name;
    } else if (!departmentId && departmentName) {
      const d = await prisma.department.findFirst({ where: { name: departmentName } });
      if (d) departmentId = d.id;
    }

    const cadreType = data.cadreType || (data.isCadre ? 'LEADERSHIP' : 'STAFF');
    const isCadre = data.isCadre ?? (cadreType !== 'STAFF');

    const passwordHash = await bcrypt.hash(data.passwordPlain, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          role: data.role,
        },
      });

      const profile = await tx.employeeProfile.create({
        data: {
          userId: user.id,
          employeeCode: data.employeeCode.toUpperCase(),
          fullName: data.fullName,
          dateOfBirth: data.dateOfBirth && data.dateOfBirth.trim() !== '' ? new Date(data.dateOfBirth) : null,
          phone: data.phone?.trim() || null,
          address: data.address?.trim() || null,
          department: departmentName,
          departmentId: departmentId || null,
          cadreType,
          isCadre,
          appointmentDate: data.appointmentDate && data.appointmentDate.trim() !== '' ? new Date(data.appointmentDate) : null,
          position: data.position,
          baseSalary: data.baseSalary,
          allowance: data.allowance || 0,
          joinDate: data.joinDate && data.joinDate.trim() !== '' ? new Date(data.joinDate) : new Date(),
          idCardNumber: data.idCardNumber?.trim() || null,
          idCardIssueDate: data.idCardIssueDate && data.idCardIssueDate.trim() !== '' ? new Date(data.idCardIssueDate) : null,
          idCardIssuePlace: data.idCardIssuePlace?.trim() || null,
          taxCode: data.taxCode?.trim() || null,
          socialInsuranceNumber: data.socialInsuranceNumber?.trim() || null,
          bankAccountNumber: data.bankAccountNumber?.trim() || null,
          bankName: data.bankName?.trim() || null,
          bankBranch: data.bankBranch?.trim() || null,
          lineManagerId: data.lineManagerId?.trim() || null,
          annualLeaveBalance: data.annualLeaveBalance ?? 12,
        },
        include: {
          departmentRef: true,
        },
      });

      return { user, profile };
    });

    return result;
  }

  static async updateEmployee(
    id: string,
    data: {
      fullName?: string;
      phone?: string;
      address?: string;
      department?: string;
      departmentId?: string;
      cadreType?: string;
      isCadre?: boolean;
      appointmentDate?: string;
      position?: string;
      baseSalary?: number;
      allowance?: number;
      role?: Role;
      isActive?: boolean;
      idCardNumber?: string;
      idCardIssueDate?: string;
      idCardIssuePlace?: string;
      taxCode?: string;
      socialInsuranceNumber?: string;
      bankAccountNumber?: string;
      bankName?: string;
      bankBranch?: string;
      lineManagerId?: string;
      annualLeaveBalance?: number;
    }
  ) {
    const employee = await prisma.employeeProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!employee) {
      throw new Error('Không tìm thấy nhân viên.');
    }

    let departmentName = data.department;
    let departmentId = data.departmentId;

    if (departmentId && !departmentName) {
      const d = await prisma.department.findUnique({ where: { id: departmentId } });
      if (d) departmentName = d.name;
    } else if (departmentName && !departmentId) {
      const d = await prisma.department.findFirst({ where: { name: departmentName } });
      if (d) departmentId = d.id;
    }

    let isCadre = data.isCadre;
    if (data.cadreType && isCadre === undefined) {
      isCadre = data.cadreType !== 'STAFF';
    }

    return await prisma.$transaction(async (tx) => {
      if (data.role || data.isActive !== undefined) {
        await tx.user.update({
          where: { id: employee.userId },
          data: {
            role: data.role !== undefined ? data.role : undefined,
            isActive: data.isActive !== undefined ? data.isActive : undefined,
          },
        });
      }

      const updateData: any = {
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        department: departmentName,
        departmentId,
        cadreType: data.cadreType,
        isCadre,
        appointmentDate: data.appointmentDate && data.appointmentDate.trim() !== '' ? new Date(data.appointmentDate) : (data.appointmentDate === '' ? null : undefined),
        position: data.position,
        baseSalary: data.baseSalary,
        allowance: data.allowance,
      };

      if (data.idCardNumber !== undefined) updateData.idCardNumber = data.idCardNumber?.trim() || null;
      if (data.idCardIssueDate !== undefined) {
        updateData.idCardIssueDate = data.idCardIssueDate && data.idCardIssueDate.trim() !== '' ? new Date(data.idCardIssueDate) : null;
      }
      if (data.idCardIssuePlace !== undefined) updateData.idCardIssuePlace = data.idCardIssuePlace?.trim() || null;
      if (data.taxCode !== undefined) updateData.taxCode = data.taxCode?.trim() || null;
      if (data.socialInsuranceNumber !== undefined) updateData.socialInsuranceNumber = data.socialInsuranceNumber?.trim() || null;
      if (data.bankAccountNumber !== undefined) updateData.bankAccountNumber = data.bankAccountNumber?.trim() || null;
      if (data.bankName !== undefined) updateData.bankName = data.bankName?.trim() || null;
      if (data.bankBranch !== undefined) updateData.bankBranch = data.bankBranch?.trim() || null;
      if (data.lineManagerId !== undefined) updateData.lineManagerId = data.lineManagerId?.trim() || null;
      if (data.annualLeaveBalance !== undefined) updateData.annualLeaveBalance = data.annualLeaveBalance;

      const updatedProfile = await tx.employeeProfile.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: { id: true, email: true, role: true, isActive: true },
          },
          departmentRef: true,
          contracts: true,
          lineManager: true,
        },
      });

      return updatedProfile;
    });
  }

  static async deleteEmployee(id: string) {
    const employee = await prisma.employeeProfile.findUnique({ where: { id } });
    if (!employee) {
      throw new Error('Không tìm thấy nhân viên.');
    }

    // Cascade delete user deletes profile and related data
    await prisma.user.delete({ where: { id: employee.userId } });
    return { success: true, message: 'Đã xóa hồ sơ nhân sự thành công.' };
  }

  static async getDepartmentStats() {
    const totalEmployees = await prisma.employeeProfile.count();
    const totalCadres = await prisma.employeeProfile.count({ where: { isCadre: true } });
    const activeUsers = await prisma.user.count({ where: { isActive: true } });

    // Official departments with manager & counts
    const officialDepts = await prisma.department.findMany({
      include: {
        manager: {
          select: { id: true, fullName: true, employeeCode: true, position: true },
        },
        employees: {
          select: { id: true, baseSalary: true, isCadre: true, cadreType: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const recentEmployees = await prisma.employeeProfile.findMany({
      take: 5,
      orderBy: { joinDate: 'desc' },
      select: {
        id: true,
        employeeCode: true,
        fullName: true,
        department: true,
        position: true,
        isCadre: true,
        cadreType: true,
        joinDate: true,
      },
    });

    const departments = officialDepts.map((d) => {
      const totalSalary = d.employees.reduce((acc, curr) => acc + (curr.baseSalary || 0), 0);
      const count = d.employees.length;
      const leadershipCount = d.employees.filter((e) => e.isCadre).length;
      return {
        id: d.id,
        code: d.code,
        department: d.name,
        manager: d.manager,
        count,
        leadershipCount,
        staffCount: count - leadershipCount,
        totalSalary,
        averageSalary: count > 0 ? Math.round(totalSalary / count) : 0,
      };
    });

    const totalSalaryBudget = departments.reduce((acc, curr) => acc + curr.totalSalary, 0);

    return {
      totalEmployees,
      totalCadres,
      activeUsers,
      totalSalaryBudget,
      departments,
      recentEmployees,
    };
  }
}
