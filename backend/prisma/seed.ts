import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const Role = { ADMIN: 'ADMIN', HR_MANAGER: 'HR_MANAGER', EMPLOYEE: 'EMPLOYEE' } as const;
const LeaveType = { ANNUAL: 'ANNUAL', SICK: 'SICK', UNPAID: 'UNPAID', MATERNITY: 'MATERNITY' } as const;
const LeaveStatus = { PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED' } as const;
const ReviewStatus = { DRAFT: 'DRAFT', SUBMITTED: 'SUBMITTED', COMPLETED: 'COMPLETED' } as const;

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu gieo mầm dữ liệu (Seeding) cho NexNova Technologies...');

  // Clean old data in safe foreign-key order
  await prisma.reviewScore.deleteMany();
  await prisma.performanceReview.deleteMany();
  await prisma.performanceCycle.deleteMany();
  await prisma.kpiCriteria.deleteMany();
  await prisma.kpiCategory.deleteMany();
  await prisma.kpiTemplate.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.recruitmentPlan.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.discipline.deleteMany();
  await prisma.transferHistory.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.department.deleteMany();
  await prisma.employeeProfile.deleteMany();
  await prisma.user.deleteMany();

  const saltRounds = 12;
  const adminPass = await bcrypt.hash('Admin@123', saltRounds);
  const hrPass = await bcrypt.hash('HR@123', saltRounds);
  const empPass = await bcrypt.hash('Emp@123', saltRounds);

  // 1. Create Core Users & Profiles
  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@nexnova.tech',
      passwordHash: adminPass,
      role: Role.ADMIN,
      profile: {
        create: {
          employeeCode: 'NN-ADM-001',
          fullName: 'Trần Quang Huy',
          gender: 'Nam',
          educationLevel: 'Thạc sĩ',
          dateOfBirth: new Date('1988-04-15'),
          phone: '0901234567',
          address: 'Tầng 18, Tòa nhà NexNova Tower, Cầu Giấy, Hà Nội',
          department: 'Software Engineering',
          position: 'Head of IT & System Administration',
          baseSalary: 65000000,
          allowance: 8000000,
          joinDate: new Date('2021-03-01'),
          lastSalaryRaise: new Date('2022-03-01'),
        },
      },
    },
    include: { profile: true },
  });

  // HR Manager User
  const hrUser = await prisma.user.create({
    data: {
      email: 'hr@nexnova.tech',
      passwordHash: hrPass,
      role: Role.HR_MANAGER,
      profile: {
        create: {
          employeeCode: 'NN-HR-002',
          fullName: 'Nguyễn Thu Hà',
          gender: 'Nữ',
          educationLevel: 'Thạc sĩ',
          dateOfBirth: new Date('1992-08-20'),
          phone: '0912345678',
          address: 'Số 45 Tràng Thi, Hoàn Kiếm, Hà Nội',
          department: 'People & Culture',
          position: 'People & Culture Director',
          baseSalary: 48000000,
          allowance: 5000000,
          joinDate: new Date('2022-01-15'),
          lastSalaryRaise: new Date('2023-01-15'),
        },
      },
    },
    include: { profile: true },
  });

  // Employee 1: Senior Full-stack Engineer
  const empUser1 = await prisma.user.create({
    data: {
      email: 'employee@nexnova.tech',
      passwordHash: empPass,
      role: Role.EMPLOYEE,
      profile: {
        create: {
          employeeCode: 'NN-ENG-003',
          fullName: 'Lê Hoàng Nam',
          gender: 'Nam',
          educationLevel: 'Đại học',
          dateOfBirth: new Date('1995-11-10'),
          phone: '0987654321',
          address: 'Khu Đô thị Sala, TP. Thủ Đức, TP. Hồ Chí Minh',
          department: 'Software Engineering',
          position: 'Senior Full-stack Engineer',
          baseSalary: 38000000,
          allowance: 4000000,
          joinDate: new Date('2023-04-01'),
          lastSalaryRaise: new Date('2023-04-01'),
        },
      },
    },
    include: { profile: true },
  });

  // Employee 2: Lead AI Researcher
  const empUser2 = await prisma.user.create({
    data: {
      email: 'data.ai@nexnova.tech',
      passwordHash: empPass,
      role: Role.EMPLOYEE,
      profile: {
        create: {
          employeeCode: 'NN-AI-004',
          fullName: 'Đặng Minh Tuấn',
          gender: 'Nam',
          educationLevel: 'Tiến sĩ',
          dateOfBirth: new Date('1994-02-18'),
          phone: '0971122334',
          address: 'Vinhomes Central Park, Bình Thạnh, TP. Hồ Chí Minh',
          department: 'AI & Data Intelligence',
          position: 'Lead AI Researcher',
          baseSalary: 52000000,
          allowance: 6000000,
          joinDate: new Date('2022-09-01'),
          lastSalaryRaise: new Date('2022-09-01'),
        },
      },
    },
    include: { profile: true },
  });

  // Employee 3: Senior Product Manager
  const empUser3 = await prisma.user.create({
    data: {
      email: 'product@nexnova.tech',
      passwordHash: empPass,
      role: Role.EMPLOYEE,
      profile: {
        create: {
          employeeCode: 'NN-PRD-005',
          fullName: 'Phạm Mai Lan',
          gender: 'Nữ',
          educationLevel: 'Đại học',
          dateOfBirth: new Date('1996-06-25'),
          phone: '0933445566',
          address: 'Số 12 Kim Mã, Ba Đình, Hà Nội',
          department: 'Product & Design',
          position: 'Senior Product Manager',
          baseSalary: 42000000,
          allowance: 4500000,
          joinDate: new Date('2023-08-15'),
          lastSalaryRaise: new Date('2023-08-15'),
        },
      },
    },
    include: { profile: true },
  });

  // Employee 4: Chief Financial Officer
  const empUser4 = await prisma.user.create({
    data: {
      email: 'finance@nexnova.tech',
      passwordHash: empPass,
      role: Role.EMPLOYEE,
      profile: {
        create: {
          employeeCode: 'NN-FIN-006',
          fullName: 'Hoàng Quốc Bảo',
          gender: 'Nam',
          educationLevel: 'Thạc sĩ',
          dateOfBirth: new Date('1990-12-05'),
          phone: '0966778899',
          address: 'Thảo Điền, Quận 2, TP. Hồ Chí Minh',
          department: 'Finance & Operations',
          position: 'Chief Financial Officer',
          baseSalary: 55000000,
          allowance: 7000000,
          joinDate: new Date('2021-11-01'),
          lastSalaryRaise: new Date('2021-11-01'),
        },
      },
    },
    include: { profile: true },
  });

  // Employee 5: Senior Strategic Advisor (near retirement age, born 1964 -> 62 years old, due for retirement in <= 1 year)
  const empUser5 = await prisma.user.create({
    data: {
      email: 'advisor@nexnova.tech',
      passwordHash: empPass,
      role: Role.EMPLOYEE,
      profile: {
        create: {
          employeeCode: 'NN-ADV-007',
          fullName: 'Bùi Đức Trọng',
          gender: 'Nam',
          educationLevel: 'Tiến sĩ',
          dateOfBirth: new Date('1964-08-10'),
          phone: '0918889999',
          address: 'Liễu Giai, Ba Đình, Hà Nội',
          department: 'Software Engineering',
          position: 'Senior Technology Fellow & Advisor',
          baseSalary: 68000000,
          allowance: 9000000,
          joinDate: new Date('2020-01-10'),
          lastSalaryRaise: new Date('2022-01-10'),
        },
      },
    },
    include: { profile: true },
  });

  console.log('✅ Đã tạo 7 tài khoản nhân sự chuẩn cấp Doanh nghiệp.');

  // 2. Attendance Data for current month
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const allProfiles = [
    adminUser.profile!,
    hrUser.profile!,
    empUser1.profile!,
    empUser2.profile!,
    empUser3.profile!,
    empUser4.profile!,
    empUser5.profile!,
  ];

  for (const prof of allProfiles) {
    // Check-in today
    const checkInTime = new Date();
    checkInTime.setHours(8, 20, 0, 0);
    const checkOutTime = new Date();
    checkOutTime.setHours(17, 35, 0, 0);

    const todayAttendanceDate = new Date(currentYear, currentMonth - 1, today.getDate());

    await prisma.attendance.create({
      data: {
        employeeId: prof.id,
        date: todayAttendanceDate,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        workHours: 8.5,
        status: 'PRESENT',
        notes: 'Điểm danh thẻ điện tử chuẩn giờ',
      },
    });
  }

  // 3. Leave Requests
  await prisma.leaveRequest.create({
    data: {
      employeeId: empUser1.profile!.id,
      leaveType: LeaveType.ANNUAL,
      startDate: new Date(currentYear, currentMonth - 1, 24),
      endDate: new Date(currentYear, currentMonth - 1, 25),
      reason: 'Nghỉ phép gia đình thường niên',
      status: LeaveStatus.APPROVED,
      approvedBy: hrUser.profile!.fullName,
      reviewComment: 'Đã duyệt ngày phép thường niên theo quy chế công ty.',
    },
  });

  await prisma.leaveRequest.create({
    data: {
      employeeId: empUser2.profile!.id,
      leaveType: LeaveType.SICK,
      startDate: new Date(currentYear, currentMonth - 1, 28),
      endDate: new Date(currentYear, currentMonth - 1, 28),
      reason: 'Nghỉ khám sức khỏe định kỳ',
      status: LeaveStatus.PENDING,
    },
  });

  // 4. Payroll Records (Current & Previous month)
  for (const prof of allProfiles) {
    const standardDays = 22;
    const actualWorkDays = 22;
    const baseSalary = prof.baseSalary;
    const allowance = prof.allowance;
    const deductions = Math.round(baseSalary * 0.105);
    const taxable = Math.max(0, baseSalary + allowance - deductions - 11000000);
    const tax = Math.round(taxable * 0.1);
    const netSalary = baseSalary + allowance - deductions - tax;

    await prisma.payroll.create({
      data: {
        employeeId: prof.id,
        month: currentMonth,
        year: currentYear,
        standardDays,
        actualWorkDays,
        baseSalary,
        allowance,
        deductions,
        tax,
        netSalary,
        isPaid: true,
        paidAt: new Date(),
      },
    });
  }

  // 5. Performance Review Cycle
  const cycle = await prisma.performanceCycle.create({
    data: {
      title: `Kỳ Đánh Giá Hiệu Suất Quý 1 / ${currentYear} (Q1 Excellence Review)`,
      startDate: new Date(currentYear, 0, 1),
      endDate: new Date(currentYear, 2, 31),
      isActive: true,
    },
  });

  await prisma.performanceReview.create({
    data: {
      cycleId: cycle.id,
      employeeId: empUser1.profile!.id,
      reviewerId: hrUser.profile!.id,
      finalRating: 'EXCELLENT',
      status: ReviewStatus.COMPLETED,
    },
  });

  // 6. Rewards & Disciplines
  await prisma.reward.create({
    data: {
      employeeId: empUser1.profile!.id,
      decisionNumber: 'QD-KT-2026-001',
      title: 'Chiến sĩ thi đua cấp cơ sở',
      rewardType: 'Bằng khen',
      amount: 5000000,
      decisionDate: new Date(currentYear, 1, 15),
      reason: 'Đạt thành tích đặc biệt xuất sắc trong quý 4 năm 2025, tối ưu hóa hệ thống Cloud.',
    },
  });

  await prisma.reward.create({
    data: {
      employeeId: empUser2.profile!.id,
      decisionNumber: 'QD-KT-2026-002',
      title: 'Thưởng sáng kiến kỹ thuật AI',
      rewardType: 'Thưởng nóng',
      amount: 8000000,
      decisionDate: new Date(currentYear, 2, 10),
      reason: 'Công bố mô hình học sâu NLP tiếng Việt chính xác cao phục vụ chuyển đổi số.',
    },
  });

  await prisma.discipline.create({
    data: {
      employeeId: empUser3.profile!.id,
      decisionNumber: 'QD-KL-2026-001',
      form: 'Khiển trách',
      penaltyAmount: 500000,
      decisionDate: new Date(currentYear, 0, 20),
      effectiveDate: new Date(currentYear, 0, 20),
      reason: 'Vi phạm quy định bàn giao tài liệu mật dự án ra bên ngoài không xin phép.',
      status: 'ACTIVE',
    },
  });

  // 7. Transfer History
  await prisma.transferHistory.create({
    data: {
      employeeId: empUser1.profile!.id,
      decisionNumber: 'QD-TC-2025-089',
      fromDepartment: 'Software Engineering',
      toDepartment: 'Software Engineering',
      fromPosition: 'Software Engineer',
      toPosition: 'Senior Full-stack Engineer',
      oldSalary: 30000000,
      newSalary: 38000000,
      transferDate: new Date(currentYear - 1, 11, 1),
      note: 'Bổ nhiệm thăng cấp bậc Senior sau kỳ đánh giá năng lực vượt trội.',
    },
  });

  // 8. Recruitment Plans & Candidates
  const planAI = await prisma.recruitmentPlan.create({
    data: {
      title: 'Tuyển dụng Kỹ sư Nghiên cứu Trí tuệ Nhân tạo (Senior AI Engineer)',
      department: 'AI & Data Intelligence',
      position: 'Senior AI Engineer',
      quantity: 2,
      requirements: 'Tối thiểu 3 năm kinh nghiệm PyTorch/TensorFlow, LLM fine-tuning, bằng Thạc sĩ trở lên.',
      status: 'IN_PROGRESS',
      deadline: new Date(currentYear, 4, 30),
    },
  });

  const planUX = await prisma.recruitmentPlan.create({
    data: {
      title: 'Tuyển dụng Chuyên viên Thiết kế Giao diện Trải nghiệm (UI/UX Designer)',
      department: 'Product & Design',
      position: 'Senior UI/UX Designer',
      quantity: 1,
      requirements: 'Kinh nghiệm Figma thành thạo, tư duy Design System doanh nghiệp.',
      status: 'OPEN',
      deadline: new Date(currentYear, 5, 15),
    },
  });

  // Candidate 1: Currently on probation (expiring in 8 days - perfect for probation countdown test!)
  const probationStart = new Date();
  probationStart.setMonth(probationStart.getMonth() - 2);
  const probationEnd = new Date();
  probationEnd.setDate(probationEnd.getDate() + 8); // Còn 8 ngày hết hạn thử việc

  await prisma.candidate.create({
    data: {
      planId: planAI.id,
      fullName: 'Hoàng Văn Dũng',
      email: 'dung.hoang.candidate@gmail.com',
      phone: '0981223344',
      status: 'PROBATION',
      probationMonths: 2,
      probationStartDate: probationStart,
      probationEndDate: probationEnd,
      notes: 'Thử việc năng nổ, đã hoàn thành 85% KPIs được giao.',
    },
  });

  await prisma.candidate.create({
    data: {
      planId: planUX.id,
      fullName: 'Ngô Thanh Hằng',
      email: 'hang.ngo@gmail.com',
      phone: '0977889900',
      status: 'INTERVIEWING',
      notes: 'Đã qua vòng Portfolio, hẹn phỏng vấn kỹ thuật với Design Lead.',
    },
  });

  console.log('🎉 Hoàn tất Seeding thành công toàn bộ 9 phân hệ cho NexNova Technologies!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi Seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
