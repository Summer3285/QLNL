import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const KPI_TEMPLATES_SEED_DATA = [
  // --- BỘ 1: MẶC ĐỊNH CHUNG ---
  {
    name: 'Khung Tiêu Chí Đánh Giá Chuẩn NexNova 2026',
    description: 'Mô hình chuẩn hóa kết hợp OKRs, Năng lực chuyên môn, Năng lực hành vi và Kỷ luật lao động (Thang điểm chuẩn 5.00)',
    isDefault: true,
    targetDepartment: 'ALL',
    targetRole: 'ALL',
    categories: [
      {
        name: 'Kết quả Công việc (Work Output)',
        weight: 0.50,
        sortOrder: 1,
        criteria: [
          {
            name: 'Hoàn thành mục tiêu OKRs/KPIs',
            description: 'Tỷ lệ hoàn thành các chỉ tiêu trọng tâm đã cam kết đầu kỳ theo thỏa thuận công tác',
            weight: 0.40,
            sortOrder: 1,
          },
          {
            name: 'Chất lượng sản phẩm & Dịch vụ',
            description: 'Mức độ chuẩn hóa, độ chính xác, tỷ lệ lỗi/bug thấp, độ hài lòng của khách hàng và đối tác',
            weight: 0.30,
            sortOrder: 2,
          },
          {
            name: 'Tiến độ & Quản lý thời gian',
            description: 'Đảm bảo đúng hạn cam kết, chủ động lập kế hoạch công việc và xử lý ưu tiên khoa học',
            weight: 0.20,
            sortOrder: 3,
          },
          {
            name: 'Sáng kiến cải tiến quy trình',
            description: 'Đóng góp ý tưởng mới, tối ưu hóa thời gian xử lý, tiết kiệm chi phí vận hành',
            weight: 0.10,
            sortOrder: 4,
          },
        ],
      },
      {
        name: 'Năng lực Chuyên môn (Technical Competency)',
        weight: 0.20,
        sortOrder: 2,
        criteria: [
          {
            name: 'Kiến thức chuyên môn & Nghiệp vụ',
            description: 'Nắm vững chuyên môn, am hiểu quy định, cập nhật công nghệ và nghiệp vụ tiên tiến',
            weight: 0.40,
            sortOrder: 1,
          },
          {
            name: 'Kỹ năng giải quyết vấn đề phức tạp',
            description: 'Tư duy logic, phân tích nguyên nhân gốc rễ, đưa ra giải pháp đột phá và khả thi',
            weight: 0.35,
            sortOrder: 2,
          },
          {
            name: 'Tự học & Phát triển bản thân',
            description: 'Chủ động tham gia đào tạo, nâng cao trình độ, đạt chứng chỉ và sẵn sàng nhận việc mới',
            weight: 0.25,
            sortOrder: 3,
          },
        ],
      },
      {
        name: 'Năng lực Hành vi & Văn hóa (Behavioral Competency)',
        weight: 0.20,
        sortOrder: 3,
        criteria: [
          {
            name: 'Làm việc nhóm & Phối hợp liên phòng ban',
            description: 'Hỗ trợ đồng đội, chia sẻ kiến thức, thái độ hợp tác và xây dựng môi trường tích cực',
            weight: 0.30,
            sortOrder: 1,
          },
          {
            name: 'Giao tiếp & Báo cáo minh bạch',
            description: 'Truyền đạt rõ ràng, lắng nghe tích cực, báo cáo tiến độ và khó khăn kịp thời',
            weight: 0.25,
            sortOrder: 2,
          },
          {
            name: 'Tinh thần lãnh đạo & Mentoring',
            description: 'Chủ động dẫn dắt, kèm cặp nhân sự mới, lan tỏa năng lượng tích cực trong tập thể',
            weight: 0.25,
            sortOrder: 3,
          },
          {
            name: 'Sáng tạo & Khả năng thích ứng linh hoạt',
            description: 'Tư duy cởi mở, nhanh chóng thích nghi với thay đổi công nghệ và mục tiêu kinh doanh',
            weight: 0.20,
            sortOrder: 4,
          },
        ],
      },
      {
        name: 'Kỷ luật & Thái độ (Discipline & Attitude)',
        weight: 0.10,
        sortOrder: 4,
        criteria: [
          {
            name: 'Chuyên cần & Tuân thủ giờ giấc',
            description: 'Chấp hành nghiêm túc thời gian làm việc, tỷ lệ đi làm đúng giờ (liên kết chấm công)',
            weight: 0.40,
            sortOrder: 1,
          },
          {
            name: 'Tuân thủ nội quy & An toàn bảo mật',
            description: 'Tuân thủ các chính sách bảo mật thông tin, quy trình tác nghiệp và đạo đức nghề nghiệp',
            weight: 0.30,
            sortOrder: 2,
          },
          {
            name: 'Tinh thần trách nhiệm & Cam kết phụng sự',
            description: 'Có trách nhiệm với kết quả công việc, trung thực và tận tâm vì sự phát triển chung',
            weight: 0.30,
            sortOrder: 3,
          },
        ],
      },
    ],
  },

  // --- BỘ 2: CẤP QUẢN LÝ & LÃNH ĐẠO ---
  {
    name: 'Khung Đánh Giá Năng Lực Quản Trị & Lãnh Đạo (Leadership & Management KPI)',
    description: 'Đánh giá hiệu quả điều hành, hoàn thành OKRs phòng ban, phát triển đội ngũ kế cận và quản trị rủi ro doanh nghiệp',
    isDefault: false,
    targetDepartment: 'ALL',
    targetRole: 'CADRE',
    categories: [
      {
        name: 'Kết quả Mục tiêu Phòng ban (Department OKRs)',
        weight: 0.45,
        sortOrder: 1,
        criteria: [
          {
            name: 'Tỷ lệ hoàn thành KPI toàn bộ phận',
            description: 'Mức độ hoàn thành các chỉ tiêu trọng tâm của phòng ban theo kế hoạch năm được phê duyệt',
            weight: 0.40,
            sortOrder: 1,
          },
          {
            name: 'Quản trị tiến độ & chất lượng dự án trọng điểm',
            description: 'Đảm bảo các mốc bàn giao dự án chiến lược đúng hạn, không phát sinh lỗi nghiêm trọng',
            weight: 0.35,
            sortOrder: 2,
          },
          {
            name: 'Tối ưu ngân sách & nguồn lực vận hành',
            description: 'Kiểm soát chi phí hoạt động trong định mức ngân sách được giao, nâng cao hiệu quả đầu tư',
            weight: 0.25,
            sortOrder: 3,
          },
        ],
      },
      {
        name: 'Năng lực Quản trị & Chiến lược (Leadership & Strategy)',
        weight: 0.30,
        sortOrder: 2,
        criteria: [
          {
            name: 'Hoạch định chiến lược & ra quyết định',
            description: 'Tầm nhìn dự báo xu hướng, khả năng phân bổ nguồn lực và tính quyết đoán trong xử lý tình huống',
            weight: 0.35,
            sortOrder: 1,
          },
          {
            name: 'Đào tạo, kèm cặp (Mentoring) & phát triển đội ngũ kế cận',
            description: 'Xây dựng lộ trình đào tạo, phát hiện và bồi dưỡng nhân sự tài năng trở thành cán bộ chủ chốt',
            weight: 0.35,
            sortOrder: 2,
          },
          {
            name: 'Gắn kết & giữ chân nhân tài',
            description: 'Xây dựng môi trường làm việc cởi mở, lắng nghe cấp dưới, tỷ lệ duy trì nhân sự nòng cốt cao',
            weight: 0.30,
            sortOrder: 3,
          },
        ],
      },
      {
        name: 'Năng lực Chuyên môn & Đổi mới (Domain Expertise)',
        weight: 0.15,
        sortOrder: 3,
        criteria: [
          {
            name: 'Định hướng kiến trúc & nghiệp vụ cốt lõi',
            description: 'Đưa ra định hướng kỹ thuật hoặc nghiệp vụ chuẩn mực cho bộ phận, giải quyết các nút thắt',
            weight: 0.50,
            sortOrder: 1,
          },
          {
            name: 'Cải tiến quy trình liên phòng ban',
            description: 'Chủ động khởi xướng và phối hợp tinh gọn các quy trình tác nghiệp liên thông giữa các bộ phận',
            weight: 0.50,
            sortOrder: 2,
          },
        ],
      },
      {
        name: 'Trách nhiệm & Văn hóa Doanh nghiệp (Governance & Culture)',
        weight: 0.10,
        sortOrder: 4,
        criteria: [
          {
            name: 'Tuân thủ quản trị rủi ro & bảo mật',
            description: 'Chủ động nhận diện rủi ro vận hành, pháp lý và bảo mật dữ liệu, xử lý khủng hoảng kịp thời',
            weight: 0.50,
            sortOrder: 1,
          },
          {
            name: 'Lan tỏa văn hóa NexNova',
            description: 'Gương mẫu đi đầu trong việc thực hiện 4 giá trị cốt lõi, xây dựng văn hóa công bằng và liêm chính',
            weight: 0.50,
            sortOrder: 2,
          },
        ],
      },
    ],
  },

  // --- BỘ 3: KHỐI KỸ THUẬT & AI ---
  {
    name: 'Khung Đánh Giá Kỹ Sư Phần Mềm, AI & Dữ Liệu (Engineering & AI KPI)',
    description: 'Đo lường năng lực phát triển sản phẩm công nghệ cao, kiến trúc hệ thống, chất lượng code và phối hợp Agile',
    isDefault: false,
    targetDepartment: 'PB-TECH,PB-AI',
    targetRole: 'STAFF',
    categories: [
      {
        name: 'Hiệu suất Phát triển Sản phẩm (Engineering Output)',
        weight: 0.50,
        sortOrder: 1,
        criteria: [
          {
            name: 'Hoàn thành Sprint & OKRs kỹ thuật',
            description: 'Tỷ lệ hoàn thành Story Points cam kết trong Sprint, đáp ứng đúng Acceptance Criteria',
            weight: 0.40,
            sortOrder: 1,
          },
          {
            name: 'Chất lượng Code/Model & Tỷ lệ Bug/Uptime',
            description: 'Tỷ lệ lỗi trên môi trường Production thấp, tuân thủ Clean Code, độ chính xác mô hình AI cao',
            weight: 0.35,
            sortOrder: 2,
          },
          {
            name: 'Đảm bảo tiến độ Release',
            description: 'Đóng góp kịp thời vào các đợt phát hành phiên bản theo đúng kế hoạch của nhóm dự án',
            weight: 0.25,
            sortOrder: 3,
          },
        ],
      },
      {
        name: 'Năng lực Kỹ thuật Chuyên sâu (Technical Mastery)',
        weight: 0.25,
        sortOrder: 2,
        criteria: [
          {
            name: 'Làm chủ công nghệ, thuật toán & kiến trúc hệ thống',
            description: 'Nắm vững Stack công nghệ, thiết kế module phần mềm chịu tải cao, tối ưu pipeline dữ liệu',
            weight: 0.45,
            sortOrder: 1,
          },
          {
            name: 'Kỹ năng Debug & Tối ưu hiệu năng',
            description: 'Phát hiện nhanh và xử lý triệt để các sự cố hiệu năng, Memory Leak, chậm truy vấn SQL',
            weight: 0.35,
            sortOrder: 2,
          },
          {
            name: 'Tài liệu hóa kỹ thuật & nghiên cứu công nghệ mới',
            description: 'Viết tài liệu API/Kiến trúc đầy đủ, chủ động PoC công nghệ mới phục vụ sản phẩm công ty',
            weight: 0.20,
            sortOrder: 3,
          },
        ],
      },
      {
        name: 'Phối hợp Agile & Làm việc nhóm (Agile Collaboration)',
        weight: 0.15,
        sortOrder: 3,
        criteria: [
          {
            name: 'Chất lượng Code Review & hỗ trợ đồng đội',
            description: 'Review PR cẩn thận, mang tính xây dựng, chủ động pair-programming gỡ khó cho đồng nghiệp',
            weight: 0.50,
            sortOrder: 1,
          },
          {
            name: 'Giao tiếp minh bạch trong Scrum/Kanban',
            description: 'Tham gia đầy đủ các phiên Daily/Retro, cập nhật Task Jira/Board kịp thời, chủ động nêu blocker',
            weight: 0.50,
            sortOrder: 2,
          },
        ],
      },
      {
        name: 'Kỷ luật & Bảo mật Hệ thống (Security & Discipline)',
        weight: 0.10,
        sortOrder: 4,
        criteria: [
          {
            name: 'Tuân thủ quy chuẩn An toàn thông tin & DevSecOps',
            description: 'Không để lộ Secrets/API Keys, tuân thủ quy trình quét lỗ hổng và bảo vệ dữ liệu khách hàng',
            weight: 0.60,
            sortOrder: 1,
          },
          {
            name: 'Chuyên cần & tác phong kỹ thuật',
            description: 'Tuân thủ giờ làm việc, trực On-call nghiêm túc (nếu có), sẵn sàng ứng cứu sự cố khẩn cấp',
            weight: 0.40,
            sortOrder: 2,
          },
        ],
      },
    ],
  },

  // --- BỘ 4: KHỐI SẢN PHẨM, NHÂN SỰ & TÀI CHÍNH ---
  {
    name: 'Khung Đánh Giá Khối Sản Phẩm & Vận Hành Doanh Nghiệp (Product & Operations KPI)',
    description: 'Đánh giá chất lượng thực thi nghiệp vụ chuyên môn, SLA dịch vụ nội bộ, pháp chế và tuân thủ vận hành',
    isDefault: false,
    targetDepartment: 'PB-PROD,PB-HR,PB-FIN',
    targetRole: 'STAFF',
    categories: [
      {
        name: 'Kết quả Thực thi Nghiệp vụ (Operational Output)',
        weight: 0.50,
        sortOrder: 1,
        criteria: [
          {
            name: 'Hoàn thành chỉ tiêu nghiệp vụ cam kết',
            description: 'Đạt định mức tuyển dụng/tính lương/báo cáo tài chính/thiết kế UI-UX theo kế hoạch giao',
            weight: 0.40,
            sortOrder: 1,
          },
          {
            name: 'Chất lượng hồ sơ/thiết kế/báo cáo & Độ chính xác',
            description: 'Hồ sơ pháp lý, chứng từ kế toán, bản thiết kế Figma chuẩn mực, không có sai sót nghiệp vụ',
            weight: 0.35,
            sortOrder: 2,
          },
          {
            name: 'Tiến độ phản hồi & SLA nội bộ',
            description: 'Giải quyết các yêu cầu hỗ trợ nhân viên, duyệt chứng từ, xử lý phản hồi khách hàng đúng hạn',
            weight: 0.25,
            sortOrder: 3,
          },
        ],
      },
      {
        name: 'Năng lực Nghiệp vụ Chuyên môn (Professional Competency)',
        weight: 0.20,
        sortOrder: 2,
        criteria: [
          {
            name: 'Am hiểu nghiệp vụ chuyên ngành & Luật định',
            description: 'Nắm vững luật lao động, thuế, kế toán, nguyên lý thiết kế UX/UI hoặc sản phẩm số',
            weight: 0.45,
            sortOrder: 1,
          },
          {
            name: 'Phân tích dữ liệu & giải quyết vấn đề',
            description: 'Biết khai thác số liệu báo cáo, chỉ số nhân sự/tài chính để đề xuất giải pháp tối ưu',
            weight: 0.35,
            sortOrder: 2,
          },
          {
            name: 'Tự học nâng cao chứng chỉ nghề nghiệp',
            description: 'Chủ động trau dồi các chứng chỉ chuyên ngành (CPA, SHRM, PMP, Agile Product Owner...)',
            weight: 0.20,
            sortOrder: 3,
          },
        ],
      },
      {
        name: 'Hợp tác Liên phòng ban & Dịch vụ Nội bộ (Cross-functional Service)',
        weight: 0.15,
        sortOrder: 3,
        criteria: [
          {
            name: 'Phối hợp hỗ trợ các khối kỹ thuật & kinh doanh',
            description: 'Thái độ phục vụ tận tâm, hỗ trợ kịp thời để các khối chuyên môn hoàn thành nhiệm vụ',
            weight: 0.55,
            sortOrder: 1,
          },
          {
            name: 'Sáng kiến tối ưu quy trình vận hành',
            description: 'Đề xuất cải tiến mẫu biểu, tự động hóa tác vụ lặp lại bằng Excel/phần mềm để tiết kiệm công sức',
            weight: 0.45,
            sortOrder: 2,
          },
        ],
      },
      {
        name: 'Tuân thủ Pháp chế, Bảo mật & Kỷ luật (Compliance & Discipline)',
        weight: 0.15,
        sortOrder: 4,
        criteria: [
          {
            name: 'Bảo mật dữ liệu nhân sự, tài chính & khách hàng tuyệt đối',
            description: 'Tuyệt đối không để lộ thông tin lương thưởng, số liệu tài chính hoặc dữ liệu cá nhân',
            weight: 0.60,
            sortOrder: 1,
          },
          {
            name: 'Chuyên cần & tuân thủ nội quy công ty',
            description: 'Gương mẫu trong việc chấp hành nội quy lao động, văn hóa công sở và giữ gìn hình ảnh tổ chức',
            weight: 0.40,
            sortOrder: 2,
          },
        ],
      },
    ],
  },
];

async function main() {
  console.log('🌟 Bắt đầu khởi tạo 4 Bộ Tiêu Chí KPI Phân Hóa NexNova Enterprise 2026...');

  for (const tplData of KPI_TEMPLATES_SEED_DATA) {
    // Check if template exists by name
    let existing = await prisma.kpiTemplate.findFirst({
      where: { name: tplData.name },
      include: { categories: { include: { criteria: true } } },
    });

    if (existing) {
      // Update targetDepartment and targetRole
      await prisma.kpiTemplate.update({
        where: { id: existing.id },
        data: {
          description: tplData.description,
          isDefault: tplData.isDefault,
          targetDepartment: tplData.targetDepartment,
          targetRole: tplData.targetRole,
        },
      });
      console.log(`🔄 Đã cập nhật Bộ tiêu chí: "${tplData.name}" [Role: ${tplData.targetRole} | Dept: ${tplData.targetDepartment}]`);
    } else {
      // Create new template with categories & criteria
      existing = await prisma.kpiTemplate.create({
        data: {
          name: tplData.name,
          description: tplData.description,
          isDefault: tplData.isDefault,
          targetDepartment: tplData.targetDepartment,
          targetRole: tplData.targetRole,
          categories: {
            create: tplData.categories.map((cat) => ({
              name: cat.name,
              weight: cat.weight,
              sortOrder: cat.sortOrder,
              criteria: {
                create: cat.criteria.map((cri) => ({
                  name: cri.name,
                  description: cri.description,
                  weight: cri.weight,
                  sortOrder: cri.sortOrder,
                })),
              },
            })),
          },
        },
        include: { categories: { include: { criteria: true } } },
      });
      console.log(`✅ Đã tạo mới Bộ tiêu chí: "${tplData.name}" [Role: ${tplData.targetRole} | Dept: ${tplData.targetDepartment}]`);
    }
  }

  // Ensure default template is linked to cycles without a template
  const defaultTpl = await prisma.kpiTemplate.findFirst({ where: { isDefault: true } });
  if (defaultTpl) {
    const cycles = await prisma.performanceCycle.findMany();
    for (const c of cycles) {
      if (!c.templateId) {
        await prisma.performanceCycle.update({
          where: { id: c.id },
          data: { templateId: defaultTpl.id },
        });
      }
    }
  }

  console.log('🎉 Hoàn tất gieo mầm thành công 4 Bộ Tiêu Chí KPI Phân Hóa Đa Chiều!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi khởi tạo bộ tiêu chí KPI:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
