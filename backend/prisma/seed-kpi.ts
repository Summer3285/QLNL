import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌟 Khởi tạo Bộ Tiêu Chí Đánh Giá KPI Chuẩn Doanh Nghiệp NexNova 2026...');

  // Check if default template already exists
  let template = await prisma.kpiTemplate.findFirst({
    where: { isDefault: true },
    include: { categories: { include: { criteria: true } } },
  });

  if (!template) {
    template = await prisma.kpiTemplate.create({
      data: {
        name: 'Bộ Tiêu Chí Đánh Giá Chuẩn Doanh Nghiệp NexNova 2026',
        description: 'Mô hình chuẩn hóa kết hợp OKRs, Năng lực chuyên môn, Năng lực hành vi và Kỷ luật lao động (Tham chiếu SAP & Google OKR)',
        isDefault: true,
        categories: {
          create: [
            {
              name: 'Kết quả Công việc (Work Output)',
              weight: 0.50, // 50%
              sortOrder: 1,
              criteria: {
                create: [
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
            },
            {
              name: 'Năng lực Chuyên môn (Technical Competency)',
              weight: 0.20, // 20%
              sortOrder: 2,
              criteria: {
                create: [
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
            },
            {
              name: 'Năng lực Hành vi & Văn hóa (Behavioral Competency)',
              weight: 0.20, // 20%
              sortOrder: 3,
              criteria: {
                create: [
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
            },
            {
              name: 'Kỷ luật & Thái độ (Discipline & Attitude)',
              weight: 0.10, // 10%
              sortOrder: 4,
              criteria: {
                create: [
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
            },
          ],
        },
      },
      include: {
        categories: {
          include: { criteria: true },
        },
      },
    });
    console.log('✅ Đã tạo thành công Bộ tiêu chí mặc định ID:', template.id);
  } else {
    console.log('ℹ️ Bộ tiêu chí mặc định đã tồn tại ID:', template.id);
  }

  // Link existing performance cycles without template to this default template
  const cycles = await prisma.performanceCycle.findMany({
    where: { templateId: null },
  });

  for (const c of cycles) {
    await prisma.performanceCycle.update({
      where: { id: c.id },
      data: { templateId: template.id },
    });
    console.log(`🔗 Đã liên kết kỳ đánh giá "${c.title}" với Bộ tiêu chí mặc định.`);
  }

  console.log('🎉 Hoàn tất gieo mầm dữ liệu KPI v2.0!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi khởi tạo bộ tiêu chí KPI:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
