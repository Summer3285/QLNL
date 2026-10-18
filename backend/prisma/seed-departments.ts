import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏛️ Khởi tạo danh mục Phòng Ban và Phân định Cán bộ - Nhân viên NexNova...');

  const departmentsData = [
    {
      code: 'PB-TECH',
      name: 'Software Engineering',
      description: 'Khối Kỹ thuật phần mềm, Phát triển hệ thống cốt lõi và Quản trị hạ tầng Cloud.',
      location: 'Tầng 18, Tòa nhà NexNova Tower, Cầu Giấy, Hà Nội',
      budget: 5000000000,
      sortOrder: 1,
    },
    {
      code: 'PB-AI',
      name: 'AI & Data Intelligence',
      description: 'Nghiên cứu ứng dụng Trí tuệ nhân tạo, Mô hình ngôn ngữ lớn (LLM) và Dữ liệu lớn (Big Data).',
      location: 'Tầng 18, Tòa nhà NexNova Tower, Cầu Giấy, Hà Nội',
      budget: 4500000000,
      sortOrder: 2,
    },
    {
      code: 'PB-PROD',
      name: 'Product & Design',
      description: 'Nghiên cứu trải nghiệm người dùng UI/UX, Quản trị tính năng và Lộ trình phát triển sản phẩm.',
      location: 'Tầng 17, Tòa nhà NexNova Tower, Cầu Giấy, Hà Nội',
      budget: 3200000000,
      sortOrder: 3,
    },
    {
      code: 'PB-HR',
      name: 'People & Culture',
      description: 'Quản trị nguồn nhân lực, Tuyển dụng nhân tài, Đào tạo phát triển và Xây dựng văn hóa tổ chức.',
      location: 'Tầng 16, Tòa nhà NexNova Tower, Cầu Giấy, Hà Nội',
      budget: 2800000000,
      sortOrder: 4,
    },
    {
      code: 'PB-FIN',
      name: 'Finance & Operations',
      description: 'Quản lý kế toán tài chính, Lập kế hoạch ngân sách hàng năm, Pháp chế và Vận hành doanh nghiệp.',
      location: 'Tầng 16, Tòa nhà NexNova Tower, Cầu Giấy, Hà Nội',
      budget: 2500000000,
      sortOrder: 5,
    },
  ];

  // 1. Upsert departments
  const deptMap: Record<string, string> = {};
  for (const d of departmentsData) {
    const dept = await prisma.department.upsert({
      where: { code: d.code },
      update: {
        name: d.name,
        description: d.description,
        location: d.location,
        budget: d.budget,
        sortOrder: d.sortOrder,
      },
      create: d,
    });
    deptMap[d.code] = dept.id;
    deptMap[d.name] = dept.id;
    console.log(`✅ Phòng ban: [${d.code}] ${d.name} (ID: ${dept.id})`);
  }

  // 2. Classify Cadres & Staff
  const employees = await prisma.employeeProfile.findMany();
  console.log(`📋 Đang phân loại ${employees.length} hồ sơ cán bộ nhân viên...`);

  for (const emp of employees) {
    let departmentId = deptMap[emp.department];
    let cadreType = 'STAFF';
    let isCadre = false;
    let appointmentDate: Date | null = null;

    const pos = (emp.position || '').toLowerCase();
    const code = emp.employeeCode;

    // Detect Leadership & Management positions
    if (
      code === 'NN-ADM-001' ||
      code === 'NN-HR-002' ||
      code === 'NN-FIN-006' ||
      pos.includes('head') ||
      pos.includes('director') ||
      pos.includes('chief') ||
      pos.includes('cfo') ||
      pos.includes('cto') ||
      pos.includes('ceo') ||
      pos.includes('trưởng phòng') ||
      pos.includes('giám đốc')
    ) {
      cadreType = 'LEADERSHIP';
      isCadre = true;
      appointmentDate = emp.joinDate || new Date('2022-01-01');
    } else if (
      code === 'NN-ENG-003' ||
      code === 'NN-AI-004' ||
      code === 'NN-PRD-005' ||
      pos.includes('lead') ||
      pos.includes('manager') ||
      pos.includes('trưởng nhóm') ||
      pos.includes('quản lý')
    ) {
      cadreType = 'MANAGEMENT';
      isCadre = true;
      appointmentDate = emp.joinDate || new Date('2022-06-01');
    }

    // Default department if not matched
    if (!departmentId) {
      departmentId = deptMap['PB-TECH'];
    }

    await prisma.employeeProfile.update({
      where: { id: emp.id },
      data: {
        departmentId,
        cadreType,
        isCadre,
        appointmentDate,
      },
    });

    console.log(
      `   👤 ${emp.fullName} (${emp.employeeCode}) - Chức vụ: ${emp.position} | Cấp bậc: ${cadreType} | Cán bộ: ${isCadre}`
    );
  }

  // 3. Assign Managers to Departments
  // PB-TECH -> Trần Quang Huy (NN-ADM-001)
  const huy = await prisma.employeeProfile.findUnique({ where: { employeeCode: 'NN-ADM-001' } });
  if (huy) {
    await prisma.department.update({
      where: { code: 'PB-TECH' },
      data: { managerId: huy.id },
    });
    console.log(`⭐ Gán Trưởng phòng Software Engineering: ${huy.fullName}`);
  }

  // PB-HR -> Nguyễn Thu Hà (NN-HR-002)
  const ha = await prisma.employeeProfile.findUnique({ where: { employeeCode: 'NN-HR-002' } });
  if (ha) {
    await prisma.department.update({
      where: { code: 'PB-HR' },
      data: { managerId: ha.id },
    });
    console.log(`⭐ Gán Giám đốc People & Culture: ${ha.fullName}`);
  }

  // PB-AI -> Đỗ Hoàng Long (NN-AI-004)
  const long = await prisma.employeeProfile.findUnique({ where: { employeeCode: 'NN-AI-004' } });
  if (long) {
    await prisma.department.update({
      where: { code: 'PB-AI' },
      data: { managerId: long.id },
    });
    console.log(`⭐ Gán Trưởng phòng AI & Data Intelligence: ${long.fullName}`);
  }

  // PB-PROD -> Product Lead
  const prodLead = await prisma.employeeProfile.findFirst({
    where: {
      OR: [
        { employeeCode: 'NN-PRD-005' },
        { employeeCode: 'NN-DES-005' },
        { department: 'Product & Design' },
      ],
    },
  });
  if (prodLead) {
    await prisma.department.update({
      where: { code: 'PB-PROD' },
      data: { managerId: prodLead.id },
    });
    console.log(`⭐ Gán Trưởng phòng Product & Design: ${prodLead.fullName}`);
  }

  // PB-FIN -> Hoàng Đức Minh (NN-FIN-006)
  const minh = await prisma.employeeProfile.findUnique({ where: { employeeCode: 'NN-FIN-006' } });
  if (minh) {
    await prisma.department.update({
      where: { code: 'PB-FIN' },
      data: { managerId: minh.id },
    });
    console.log(`⭐ Gán Giám đốc Finance & Operations (CFO): ${minh.fullName}`);
  }

  console.log('🎉 Hoàn tất gieo mầm dữ liệu Phòng Ban & Cán Bộ!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seed phòng ban:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
