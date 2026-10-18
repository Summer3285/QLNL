import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu tạo dữ liệu Hợp đồng lao động & thông tin định danh mẫu...');

  const employees = await prisma.employeeProfile.findMany({
    orderBy: { employeeCode: 'asc' },
  });

  if (employees.length === 0) {
    console.log('Không có nhân viên nào trong database.');
    return;
  }

  console.log(`Tìm thấy ${employees.length} nhân viên. Tiến hành cập nhật...`);

  const banks = [
    { name: 'Ngân hàng Ngoại Thương (Vietcombank)', branch: 'Sở Giao Dịch Hà Nội' },
    { name: 'Ngân hàng Kỹ Thương (Techcombank)', branch: 'Chi nhánh Ba Đình' },
    { name: 'Ngân hàng Quân Đội (MB Bank)', branch: 'Chi nhánh Cầu Giấy' },
    { name: 'Ngân hàng Đầu tư & Phát triển (BIDV)', branch: 'Chi nhánh Hà Thành' },
  ];

  // Pick top manager for line manager assignment
  const topManager = employees.find((e) => e.cadreType === 'LEADERSHIP') || employees[0];

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    const bank = banks[i % banks.length];

    // 1. Cập nhật thông tin CCCD, MST, Ngân hàng
    const cccdNumber = `00109${String(80 + (i % 20)).padStart(2, '0')}${String(100000 + i * 137).slice(0, 6)}`;
    const mst = `8${String(34567890 + i * 231).slice(0, 9)}`;
    const bhxh = `012${String(456789 + i * 11).slice(0, 7)}`;
    const bankAccount = `10${String(2345678900 + i * 789).slice(0, 10)}`;

    await prisma.employeeProfile.update({
      where: { id: emp.id },
      data: {
        idCardNumber: cccdNumber,
        idCardIssueDate: new Date('2021-05-15'),
        idCardIssuePlace: 'Cục Cảnh sát QLHC về TTXH',
        taxCode: mst,
        socialInsuranceNumber: bhxh,
        bankAccountNumber: bankAccount,
        bankName: bank.name,
        bankBranch: bank.branch,
        annualLeaveBalance: 12 - (i % 5),
        lineManagerId: emp.id !== topManager.id ? topManager.id : null,
      },
    });

    // 2. Tạo Hợp đồng lao động nếu chưa có
    const existingContract = await prisma.contract.findFirst({
      where: { employeeId: emp.id },
    });

    if (!existingContract) {
      // Phân bổ loại hợp đồng thực tế
      let contractType = 'INDEFINITE';
      let startDate = new Date(emp.joinDate || '2023-01-15');
      let endDate: Date | null = null;
      let status = 'ACTIVE';

      if (i === employees.length - 1) {
        // 1 nhân sự thử việc
        contractType = 'PROBATION';
        startDate = new Date(Date.now() - 30 * 86400000);
        endDate = new Date(Date.now() + 30 * 86400000);
      } else if (i === employees.length - 2) {
        // 1 nhân sự sắp hết hạn hợp đồng 1 năm (trong 15 ngày tới để test alert)
        contractType = 'DEFINITE_1Y';
        startDate = new Date(Date.now() - 350 * 86400000);
        endDate = new Date(Date.now() + 15 * 86400000);
      } else if (i % 3 === 0) {
        contractType = 'DEFINITE_3Y';
        startDate = new Date(Date.now() - 200 * 86400000);
        endDate = new Date(Date.now() + (3 * 365 - 200) * 86400000);
      } else {
        contractType = 'INDEFINITE';
        startDate = new Date(emp.joinDate || '2022-06-01');
        endDate = null;
      }

      const contractNumber = `HĐLĐ-2026/${String(i + 1).padStart(3, '0')}`;

      await prisma.contract.create({
        data: {
          contractNumber,
          employeeId: emp.id,
          contractType,
          jobTitle: emp.position,
          startDate,
          endDate,
          signedDate: startDate,
          salaryInsurance: Math.round(emp.baseSalary * 0.8), // Lương đóng BH thường khoảng 80% lương cơ bản
          status,
          workingTime: 'Toàn thời gian (40h/tuần)',
          note: `Hợp đồng lao động chuẩn ký kết giữa Công ty Cổ phần NexNova và ${emp.fullName}`,
        },
      });

      console.log(`✅ Đã tạo hợp đồng ${contractNumber} cho ${emp.fullName} (${contractType})`);
    }
  }

  console.log('🎉 Hoàn tất gieo dữ liệu Hợp đồng lao động mẫu!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
