import { prisma } from '../config/prisma.js';

export class DepartmentService {
  static async getAllDepartments() {
    const departments = await prisma.department.findMany({
      include: {
        manager: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            position: true,
            phone: true,
            avatarUrl: true,
          },
        },
        deputy: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            position: true,
            phone: true,
            avatarUrl: true,
          },
        },
        employees: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            position: true,
            cadreType: true,
            isCadre: true,
            baseSalary: true,
            joinDate: true,
            appointmentDate: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { employees: true, recruitmentPlans: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return departments.map((dept) => {
      const leadership = dept.employees.filter((e) => e.isCadre || e.cadreType === 'LEADERSHIP' || e.cadreType === 'MANAGEMENT');
      const staff = dept.employees.filter((e) => !e.isCadre && e.cadreType === 'STAFF');
      const totalSalaryMonthly = dept.employees.reduce((sum, e) => sum + (e.baseSalary || 0), 0);

      return {
        ...dept,
        totalEmployees: dept.employees.length,
        leadershipCount: leadership.length,
        staffCount: staff.length,
        totalSalaryMonthly,
        leadership,
        staff,
      };
    });
  }

  static async getDepartmentById(id: string) {
    const dept = await prisma.department.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            position: true,
            phone: true,
            avatarUrl: true,
          },
        },
        deputy: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            position: true,
            phone: true,
            avatarUrl: true,
          },
        },
        employees: {
          include: {
            user: { select: { email: true, role: true, isActive: true } },
          },
          orderBy: [{ isCadre: 'desc' }, { employeeCode: 'asc' }],
        },
      },
    });

    if (!dept) {
      throw new Error('Không tìm thấy phòng ban.');
    }

    const leadership = dept.employees.filter((e) => e.isCadre || e.cadreType !== 'STAFF');
    const staff = dept.employees.filter((e) => !e.isCadre && e.cadreType === 'STAFF');
    const totalSalaryMonthly = dept.employees.reduce((sum, e) => sum + (e.baseSalary || 0), 0);

    return {
      ...dept,
      totalEmployees: dept.employees.length,
      leadershipCount: leadership.length,
      staffCount: staff.length,
      totalSalaryMonthly,
      leadership,
      staff,
    };
  }

  static async createDepartment(data: {
    code: string;
    name: string;
    description?: string;
    location?: string;
    budget?: number;
    managerId?: string;
    deputyId?: string;
    sortOrder?: number;
  }) {
    const existing = await prisma.department.findUnique({
      where: { code: data.code.toUpperCase() },
    });
    if (existing) {
      throw new Error(`Mã phòng ban ${data.code} đã tồn tại.`);
    }

    return await prisma.department.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description,
        location: data.location,
        budget: data.budget || 0,
        managerId: data.managerId || null,
        deputyId: data.deputyId || null,
        sortOrder: data.sortOrder || 0,
      },
      include: {
        manager: true,
        deputy: true,
      },
    });
  }

  static async updateDepartment(
    id: string,
    data: {
      name?: string;
      description?: string;
      location?: string;
      budget?: number;
      managerId?: string | null;
      deputyId?: string | null;
      sortOrder?: number;
    }
  ) {
    const dept = await prisma.department.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        budget: data.budget,
        managerId: data.managerId,
        deputyId: data.deputyId,
        sortOrder: data.sortOrder,
      },
      include: {
        manager: true,
        deputy: true,
      },
    });

    // If manager changed, ensure their departmentId matches and cadreType is LEADERSHIP
    if (data.managerId) {
      await prisma.employeeProfile.update({
        where: { id: data.managerId },
        data: {
          departmentId: id,
          department: dept.name,
          cadreType: 'LEADERSHIP',
          isCadre: true,
        },
      });
    }

    if (data.deputyId) {
      await prisma.employeeProfile.update({
        where: { id: data.deputyId },
        data: {
          departmentId: id,
          department: dept.name,
          cadreType: 'LEADERSHIP',
          isCadre: true,
        },
      });
    }

    return dept;
  }

  static async deleteDepartment(id: string) {
    const count = await prisma.employeeProfile.count({ where: { departmentId: id } });
    if (count > 0) {
      throw new Error(`Không thể xóa phòng ban đang có ${count} nhân sự trực thuộc.`);
    }

    return await prisma.department.delete({ where: { id } });
  }

  static async getOrgChart() {
    const departments = await this.getAllDepartments();

    return {
      companyName: 'NexNova Technologies JSC',
      executives: [
        {
          title: 'Ban Tổng Giám Đốc',
          members: [
            {
              role: 'Tổng Giám Đốc & Chủ Tịch HĐQT',
              name: 'Trần Quang Huy (Quyền TGĐ)',
              code: 'NN-ADM-001',
            },
          ],
        },
      ],
      departments: departments.map((d) => ({
        id: d.id,
        code: d.code,
        name: d.name,
        location: d.location,
        manager: d.manager,
        deputy: d.deputy,
        leadership: d.leadership,
        staff: d.staff,
        totalEmployees: d.totalEmployees,
        budget: d.budget,
      })),
    };
  }
}
