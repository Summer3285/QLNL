import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Bắt đầu tạo Kế hoạch tuyển dụng & Bổ sung 14 nhân sự mới...');

  const saltRounds = 12;
  const defaultPass = await bcrypt.hash('Emp@123', saltRounds);

  const now = new Date();

  // Get departments
  const departments = await prisma.department.findMany();
  const getDept = (code: string) => {
    const d = departments.find(d => d.code === code);
    if (!d) throw new Error(`Không tìm thấy phòng ban có mã ${code}`);
    return d;
  };

  const pbTech = getDept('PB-TECH');
  const pbAi = getDept('PB-AI');
  const pbProd = getDept('PB-PROD');
  const pbHr = getDept('PB-HR');
  const pbFin = getDept('PB-FIN');

  // 1. CREATE RECRUITMENT PLANS
  console.log('📝 Khởi tạo Kế hoạch tuyển dụng...');
  
  const plans = [
    {
      title: 'Tuyển dụng Khối Kỹ thuật Q4/2026',
      department: pbTech.name,
      departmentId: pbTech.id,
      position: 'Tech Lead, Backend, DevOps',
      quantity: 4,
      requirements: 'Ít nhất 3 năm kinh nghiệm thực chiến. Kỹ năng thiết kế hệ thống và problem-solving tốt.',
      status: 'CLOSED', // Tuyển xong
      deadline: new Date(now.getTime() - 10 * 86400000)
    },
    {
      title: 'Tuyển dụng Kỹ sư AI & Data',
      department: pbAi.name,
      departmentId: pbAi.id,
      position: 'Senior ML Engineer, Data Engineer, AI Specialist',
      quantity: 3,
      requirements: 'Kinh nghiệm với LLM, RAG, Big Data processing (Spark, Kafka).',
      status: 'CLOSED',
      deadline: new Date(now.getTime() - 15 * 86400000)
    },
    {
      title: 'Bổ sung Khối Sản phẩm & Thiết kế',
      department: pbProd.name,
      departmentId: pbProd.id,
      position: 'Senior UI/UX, BA, Product Owner',
      quantity: 3,
      requirements: 'Am hiểu B2B SaaS. Kinh nghiệm thiết kế hệ thống phức tạp.',
      status: 'CLOSED',
      deadline: new Date(now.getTime() - 12 * 86400000)
    },
    {
      title: 'Tuyển dụng Nhân sự nội bộ',
      department: pbHr.name,
      departmentId: pbHr.id,
      position: 'IT Recruiter, C&B Specialist',
      quantity: 2,
      requirements: 'Giao tiếp tốt, nắm vững luật lao động và thị trường IT.',
      status: 'CLOSED',
      deadline: new Date(now.getTime() - 20 * 86400000)
    },
    {
      title: 'Tuyển dụng Kế toán & Vận hành',
      department: pbFin.name,
      departmentId: pbFin.id,
      position: 'Kế toán tổng hợp, Pháp chế',
      quantity: 2,
      requirements: 'Cẩn thận, trung thực, có kinh nghiệm làm việc với cơ quan thuế.',
      status: 'CLOSED',
      deadline: new Date(now.getTime() - 25 * 86400000)
    }
  ];

  for (const plan of plans) {
    const existing = await prisma.recruitmentPlan.findFirst({
      where: { title: plan.title },
    });
    if (!existing) {
      await prisma.recruitmentPlan.create({ data: plan });
    }
  }
  console.log('✅ Đã kiểm tra và tạo kế hoạch tuyển dụng.');

  // 2. CREATE 14 EMPLOYEES
  console.log('👥 Đang bổ sung 14 hồ sơ nhân sự mới...');

  const joinDate = new Date();
  const probationDate = new Date();
  probationDate.setMonth(probationDate.getMonth() - 1); // Started 1 month ago

  const newEmployees = [
    // --- PB-TECH ---
    {
      email: 'techlead.fe@nexnova.tech',
      employeeCode: 'NN-ENG-008',
      fullName: 'Trần Đại Dũng',
      gender: 'Nam',
      educationLevel: 'Đại học',
      dateOfBirth: new Date('1993-05-12'),
      phone: '0981112233',
      address: 'Thanh Xuân, Hà Nội',
      department: pbTech.name,
      departmentId: pbTech.id,
      position: 'Tech Lead Frontend',
      cadreType: 'MANAGEMENT',
      isCadre: true,
      appointmentDate: joinDate,
      baseSalary: 40000000,
      allowance: 4000000
    },
    {
      email: 'backend1@nexnova.tech',
      employeeCode: 'NN-ENG-009',
      fullName: 'Nguyễn Văn Kiên',
      gender: 'Nam',
      educationLevel: 'Đại học',
      dateOfBirth: new Date('1997-08-20'),
      phone: '0972223344',
      address: 'Đống Đa, Hà Nội',
      department: pbTech.name,
      departmentId: pbTech.id,
      position: 'Backend Engineer (Node.js)',
      cadreType: 'STAFF',
      isCadre: false,
      baseSalary: 28000000,
      allowance: 2000000
    },
    {
      email: 'backend2@nexnova.tech',
      employeeCode: 'NN-ENG-010',
      fullName: 'Lê Thị Thu',
      gender: 'Nữ',
      educationLevel: 'Đại học',
      dateOfBirth: new Date('1998-11-05'),
      phone: '0963334455',
      address: 'Cầu Giấy, Hà Nội',
      department: pbTech.name,
      departmentId: pbTech.id,
      position: 'Backend Engineer (Go)',
      cadreType: 'STAFF',
      isCadre: false,
      baseSalary: 26000000,
      allowance: 2000000
    },
    {
      email: 'devops@nexnova.tech',
      employeeCode: 'NN-ENG-011',
      fullName: 'Phạm Đức Anh',
      gender: 'Nam',
      educationLevel: 'Đại học',
      dateOfBirth: new Date('1995-02-14'),
      phone: '0914445566',
      address: 'Hà Đông, Hà Nội',
      department: pbTech.name,
      departmentId: pbTech.id,
      position: 'DevOps Engineer',
      cadreType: 'STAFF',
      isCadre: false,
      baseSalary: 32000000,
      allowance: 3000000
    },
    
    // --- PB-AI ---
    {
      email: 'ml.senior@nexnova.tech',
      employeeCode: 'NN-AI-012',
      fullName: 'Võ Thành Đạt',
      gender: 'Nam',
      educationLevel: 'Thạc sĩ',
      dateOfBirth: new Date('1994-07-22'),
      phone: '0945556677',
      address: 'Bình Thạnh, TP.HCM',
      department: pbAi.name,
      departmentId: pbAi.id,
      position: 'Senior Machine Learning Engineer',
      cadreType: 'STAFF',
      isCadre: false,
      baseSalary: 45000000,
      allowance: 5000000
    },
    {
      email: 'data.eng@nexnova.tech',
      employeeCode: 'NN-AI-013',
      fullName: 'Đặng Ngọc Quyên',
      gender: 'Nữ',
      educationLevel: 'Đại học',
      dateOfBirth: new Date('1996-09-30'),
      phone: '0936667788',
      address: 'Quận 7, TP.HCM',
      department: pbAi.name,
      departmentId: pbAi.id,
      position: 'Data Engineer',
      cadreType: 'STAFF',
      isCadre: false,
      baseSalary: 32000000,
      allowance: 3000000
    },
    {
      email: 'ai.prompt@nexnova.tech',
      employeeCode: 'NN-AI-014',
      fullName: 'Bùi Anh Tuấn',
      gender: 'Nam',
      educationLevel: 'Đại học',
      dateOfBirth: new Date('1999-12-11'),
      phone: '0987778899',
      address: 'Tân Bình, TP.HCM',
      department: pbAi.name,
      departmentId: pbAi.id,
      position: 'AI Product Specialist',
      cadreType: 'STAFF',
      isCadre: false,
      baseSalary: 22000000,
      allowance: 1500000
    },

    // --- PB-PROD ---
    {
      email: 'ux.senior@nexnova.tech',
      employeeCode: 'NN-PRD-015',
      fullName: 'Hoàng Minh Ngọc',
      gender: 'Nữ',
      educationLevel: 'Đại học',
      dateOfBirth: new Date('1995-04-18'),
      phone: '0918889900',
      address: 'Tây Hồ, Hà Nội',
      department: pbProd.name,
      departmentId: pbProd.id,
      position: 'Senior UI/UX Designer',
      cadreType: 'STAFF',
      isCadre: false,
      baseSalary: 28000000,
      allowance: 2500000
    },
    {
      email: 'ba.it@nexnova.tech',
      employeeCode: 'NN-PRD-016',
      fullName: 'Nguyễn Nhật Nam',
      gender: 'Nam',
      educationLevel: 'Đại học',
      dateOfBirth: new Date('1997-03-25'),
      phone: '0969990011',
      address: 'Nam Từ Liêm, Hà Nội',
      department: pbProd.name,
      departmentId: pbProd.id,
      position: 'Business Analyst',
      cadreType: 'STAFF',
      isCadre: false,
      baseSalary: 24000000,
      allowance: 2000000
    },
    {
      email: 'po@nexnova.tech',
      employeeCode: 'NN-PRD-017',
      fullName: 'Lê Hương Giang',
      gender: 'Nữ',
      educationLevel: 'Thạc sĩ',
      dateOfBirth: new Date('1993-10-10'),
      phone: '0970001122',
      address: 'Hoàng Mai, Hà Nội',
      department: pbProd.name,
      departmentId: pbProd.id,
      position: 'Product Owner',
      cadreType: 'MANAGEMENT',
      isCadre: true,
      appointmentDate: joinDate,
      baseSalary: 35000000,
      allowance: 3500000
    },

    // --- PB-HR ---
    {
      email: 'recruiter@nexnova.tech',
      employeeCode: 'NN-HR-018',
      fullName: 'Trương Mỹ Linh',
      gender: 'Nữ',
      educationLevel: 'Đại học',
      dateOfBirth: new Date('1998-01-08'),
      phone: '0931112233',
      address: 'Hai Bà Trưng, Hà Nội',
      department: pbHr.name,
      departmentId: pbHr.id,
      position: 'IT Talent Acquisition',
      cadreType: 'STAFF',
      isCadre: false,
      baseSalary: 22000000,
      allowance: 2000000
    },
    {
      email: 'cnb@nexnova.tech',
      employeeCode: 'NN-HR-019',
      fullName: 'Đinh Trọng Hùng',
      gender: 'Nam',
      educationLevel: 'Đại học',
      dateOfBirth: new Date('1996-06-16'),
      phone: '0902223344',
      address: 'Thanh Xuân, Hà Nội',
      department: pbHr.name,
      departmentId: pbHr.id,
      position: 'C&B Specialist',
      cadreType: 'STAFF',
      isCadre: false,
      baseSalary: 20000000,
      allowance: 1500000
    },

    // --- PB-FIN ---
    {
      email: 'acc.general@nexnova.tech',
      employeeCode: 'NN-FIN-020',
      fullName: 'Ngô Thanh Thảo',
      gender: 'Nữ',
      educationLevel: 'Đại học',
      dateOfBirth: new Date('1994-08-30'),
      phone: '0983334455',
      address: 'Phú Nhuận, TP.HCM',
      department: pbFin.name,
      departmentId: pbFin.id,
      position: 'General Accountant',
      cadreType: 'STAFF',
      isCadre: false,
      baseSalary: 22000000,
      allowance: 2000000
    },
    {
      email: 'legal@nexnova.tech',
      employeeCode: 'NN-FIN-021',
      fullName: 'Đoàn Quốc Vinh',
      gender: 'Nam',
      educationLevel: 'Thạc sĩ',
      dateOfBirth: new Date('1992-11-20'),
      phone: '0914445566',
      address: 'Quận 3, TP.HCM',
      department: pbFin.name,
      departmentId: pbFin.id,
      position: 'Legal & Operations Specialist',
      cadreType: 'STAFF',
      isCadre: false,
      baseSalary: 24000000,
      allowance: 2500000
    }
  ];

  for (const emp of newEmployees) {
    const { email, ...profileData } = emp;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    const existingProfile = await prisma.employeeProfile.findUnique({
      where: { employeeCode: profileData.employeeCode },
    });

    if (!existingUser && !existingProfile) {
      await prisma.user.create({
        data: {
          email,
          passwordHash: defaultPass,
          role: 'EMPLOYEE',
          profile: {
            create: {
              ...profileData,
              joinDate: probationDate,
              lastSalaryRaise: probationDate,
            },
          },
        },
      });
    }
  }

  console.log('✅ Đã kiểm tra và bổ sung 14 nhân sự vào các phòng ban!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi chạy seed bổ sung nhân sự:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
