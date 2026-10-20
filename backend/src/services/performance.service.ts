import { prisma } from '../config/prisma.js';
import { ReviewStatus, AutoPerformanceMetrics, ActiveDisciplineSummary } from '../types/index.js';
import { AttendanceService } from './attendance.service.js';

export function calculateAutoRating(score: number): string {
  if (score >= 4.5) return 'EXCELLENT';
  if (score >= 3.8) return 'GOOD';
  if (score >= 3.0) return 'AVERAGE';
  if (score >= 2.0) return 'NEEDS_IMPROVEMENT';
  return 'UNSATISFACTORY';
}

export interface CriteriaScoreInput {
  criteriaId: string;
  score: number;
  note?: string;
}

export class PerformanceService {
  // --- Templates Management ---
  static async getTemplates() {
    return await prisma.kpiTemplate.findMany({
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            criteria: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        _count: { select: { cycles: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getTemplateById(id: string) {
    return await prisma.kpiTemplate.findUnique({
      where: { id },
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            criteria: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });
  }

  static async createTemplate(data: {
    name: string;
    description?: string;
    isDefault?: boolean;
    targetDepartment?: string;
    targetRole?: string;
    categories: Array<{
      name: string;
      weight: number;
      sortOrder?: number;
      criteria: Array<{
        name: string;
        description?: string;
        weight: number;
        sortOrder?: number;
      }>;
    }>;
  }) {
    if (data.isDefault) {
      await prisma.kpiTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return await prisma.kpiTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        isDefault: data.isDefault || false,
        targetDepartment: data.targetDepartment || 'ALL',
        targetRole: data.targetRole || 'ALL',
        categories: {
          create: data.categories.map((cat, catIdx) => ({
            name: cat.name,
            weight: cat.weight,
            sortOrder: cat.sortOrder ?? catIdx + 1,
            criteria: {
              create: cat.criteria.map((cri, criIdx) => ({
                name: cri.name,
                description: cri.description,
                weight: cri.weight,
                sortOrder: cri.sortOrder ?? criIdx + 1,
              })),
            },
          })),
        },
      },
      include: {
        categories: {
          include: { criteria: true },
        },
      },
    });
  }

  // --- Cycles Management ---
  static async createCycle(data: {
    title: string;
    startDate: string;
    endDate: string;
    templateId?: string;
  }) {
    let templateId = data.templateId;
    if (!templateId) {
      const defaultTemplate = await prisma.kpiTemplate.findFirst({
        where: { isDefault: true },
      });
      templateId = defaultTemplate?.id;
    }

    return await prisma.performanceCycle.create({
      data: {
        title: data.title,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        templateId,
        isActive: true,
      },
      include: {
        template: {
          include: {
            categories: {
              include: { criteria: true },
            },
          },
        },
      },
    });
  }

  static async getCycles() {
    return await prisma.performanceCycle.findMany({
      include: {
        template: {
          include: {
            categories: {
              orderBy: { sortOrder: 'asc' },
              include: {
                criteria: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getActiveCycle() {
    return await prisma.performanceCycle.findFirst({
      where: { isActive: true },
      include: {
        template: {
          include: {
            categories: {
              orderBy: { sortOrder: 'asc' },
              include: {
                criteria: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- Reviews Management ---
  // --- Resolve Template For Employee Helper ---
  static async resolveTemplateForEmployee(
    employeeId: string,
    cycleDefaultTemplateId?: string | null
  ) {
    const employee = await prisma.employeeProfile.findUnique({
      where: { id: employeeId },
      include: { departmentRef: true },
    });

    if (!employee) return null;

    const isCadre =
      employee.isCadre ||
      employee.cadreType === 'LEADERSHIP' ||
      employee.cadreType === 'MANAGEMENT';

    // 1. If Cadre (Leadership / Management) -> pick CADRE template
    if (isCadre) {
      const cadreTemplate = await prisma.kpiTemplate.findFirst({
        where: { targetRole: 'CADRE' },
        include: {
          categories: {
            orderBy: { sortOrder: 'asc' },
            include: {
              criteria: { orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      });
      if (cadreTemplate) return cadreTemplate;
    } else {
      // 2. If Staff -> pick matching department block template
      const deptCode = employee.departmentRef?.code || '';
      const deptName = (employee.department || '').toLowerCase();

      const staffTemplates = await prisma.kpiTemplate.findMany({
        where: { targetRole: 'STAFF' },
        include: {
          categories: {
            orderBy: { sortOrder: 'asc' },
            include: {
              criteria: { orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      });

      for (const tpl of staffTemplates) {
        const targetDepts = (tpl.targetDepartment || '')
          .split(',')
          .map((d) => d.trim().toUpperCase());

        const matchesCode = !!(deptCode && targetDepts.includes(deptCode.toUpperCase()));
        const matchesName =
          (targetDepts.includes('PB-TECH') &&
            (deptName.includes('software') || deptName.includes('kỹ thuật') || deptName.includes('tech'))) ||
          (targetDepts.includes('PB-AI') &&
            (deptName.includes('ai') || deptName.includes('dữ liệu') || deptName.includes('data'))) ||
          (targetDepts.includes('PB-PROD') &&
            (deptName.includes('product') || deptName.includes('sản phẩm') || deptName.includes('design') || deptName.includes('thiết kế'))) ||
          (targetDepts.includes('PB-HR') &&
            (deptName.includes('hr') || deptName.includes('nhân sự') || deptName.includes('people'))) ||
          (targetDepts.includes('PB-FIN') &&
            (deptName.includes('finance') || deptName.includes('tài chính') || deptName.includes('operations') || deptName.includes('vận hành')));

        if (matchesCode || matchesName) {
          return tpl;
        }
      }
    }

    // 3. Fallback: cycle default template
    if (cycleDefaultTemplateId) {
      const cycleTpl = await prisma.kpiTemplate.findUnique({
        where: { id: cycleDefaultTemplateId },
        include: {
          categories: {
            orderBy: { sortOrder: 'asc' },
            include: {
              criteria: { orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      });
      if (cycleTpl) return cycleTpl;
    }

    // 4. Fallback: default template
    return await prisma.kpiTemplate.findFirst({
      where: { isDefault: true },
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            criteria: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });
  }

  // --- Automated Attendance & Discipline Metrics (Nhóm C - Core Logic) ---
  /**
   * Core algorithm: Calculate violation index V and suggested rating based on attendance and discipline
   * Formula: violationIndex = (lateOrEarlyCount * 1.0) + (halfDayCount * 0.5) + (unpaidLeaveDays * 1.5)
   */
  static evaluateViolationMetrics(
    totalCheckIns: number,
    lateOrEarlyCount: number,
    halfDayCount: number,
    unpaidLeaveDays: number,
    activeDisciplines: ActiveDisciplineSummary[]
  ): {
    totalCheckIns: number;
    lateOrEarlyCount: number;
    halfDayCount: number;
    unpaidLeaveDays: number;
    violationIndex: number;
    suggestedAttendanceScore: number;
    attendanceEvidence: string;
    activeDisciplinesCount: number;
    activeDisciplines: ActiveDisciplineSummary[];
    suggestedDisciplineScore: number;
    disciplineEvidence: string;
    suggestedScore: number;
    suggestedRating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT' | 'UNSATISFACTORY';
    evidenceSummary: string;
    hasActiveDiscipline: boolean;
  } {
    // 1. Tính chỉ số vi phạm chuyên cần V
    const rawV = lateOrEarlyCount * 1.0 + halfDayCount * 0.5 + unpaidLeaveDays * 1.5;
    const violationIndex = Number(rawV.toFixed(1));

    // Quy đổi ra suggestedAttendanceScore (thang 1 - 5):
    // violationIndex === 0 => 5
    // violationIndex <= 2 => 4
    // violationIndex <= 5 => 3
    // violationIndex <= 8 => 2
    // violationIndex > 8 => 1
    let suggestedAttendanceScore = 5;
    if (violationIndex === 0) {
      suggestedAttendanceScore = 5;
    } else if (violationIndex <= 2) {
      suggestedAttendanceScore = 4;
    } else if (violationIndex <= 5) {
      suggestedAttendanceScore = 3;
    } else if (violationIndex <= 8) {
      suggestedAttendanceScore = 2;
    } else {
      suggestedAttendanceScore = 1;
    }

    const attendanceEvidence = `[Đối soát Chấm công tự động]: Đã điểm danh ${totalCheckIns} buổi | Đi muộn/Về sớm: ${lateOrEarlyCount} lần | Nghỉ không lương: ${unpaidLeaveDays} ngày -> Điểm quy đổi hệ thống: ${suggestedAttendanceScore}/5 sao.`;

    // 2. Tích hợp đối soát Kỷ luật lao động (prisma.discipline)
    const hasActiveDiscipline = activeDisciplines.length > 0;
    let suggestedDisciplineScore = 5;
    let disciplineEvidence = '';

    if (!hasActiveDiscipline) {
      suggestedDisciplineScore = 5;
      disciplineEvidence = '[Đối soát Kỷ luật tự động]: Chấp hành tốt nội quy, 0 vi phạm kỷ luật đang có hiệu lực.';
    } else {
      const hasTermination = activeDisciplines.some((d) => d.form.includes('Buộc thôi việc'));
      const hasWarningOrDemotion = activeDisciplines.some(
        (d) => d.form.includes('Cảnh cáo') || d.form.includes('Hạ bậc')
      );

      if (hasTermination) {
        suggestedDisciplineScore = 1;
      } else if (hasWarningOrDemotion) {
        suggestedDisciplineScore = 2;
      } else {
        // Mặc định: Khiển trách
        suggestedDisciplineScore = 3;
      }

      const discList = activeDisciplines
        .map((d) => `${d.decisionNumber} - ${d.form}: ${d.reason}`)
        .join('; ');
      disciplineEvidence = `[Cảnh báo Kỷ luật tự động]: Có ${activeDisciplines.length} quyết định kỷ luật (${discList}) -> Trần điểm tối đa: ${suggestedDisciplineScore}/5 sao.`;
    }

    const minScore = Math.min(suggestedAttendanceScore, suggestedDisciplineScore);
    const suggestedRating = calculateAutoRating(minScore) as 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT' | 'UNSATISFACTORY';
    const evidenceSummary = `${attendanceEvidence} ${disciplineEvidence}`;

    return {
      totalCheckIns,
      lateOrEarlyCount,
      halfDayCount,
      unpaidLeaveDays,
      violationIndex,
      suggestedAttendanceScore,
      attendanceEvidence,
      activeDisciplinesCount: activeDisciplines.length,
      activeDisciplines,
      suggestedDisciplineScore,
      disciplineEvidence,
      suggestedScore: minScore,
      suggestedRating,
      evidenceSummary,
      hasActiveDiscipline,
    };
  }

  static async calculateAttendanceAndDisciplineMetrics(
    employeeId: string,
    startDateOrCycleId: string | Date,
    maybeEndDate?: Date
  ): Promise<AutoPerformanceMetrics> {
    let startDate: Date;
    let endDate: Date;
    let cycleId: string | undefined;

    if (typeof startDateOrCycleId === 'string') {
      cycleId = startDateOrCycleId;
      const cycle = await prisma.performanceCycle.findUnique({
        where: { id: cycleId },
      });
      if (cycle) {
        startDate = cycle.startDate;
        endDate = cycle.endDate;
      } else {
        startDate = new Date(startDateOrCycleId);
        endDate = maybeEndDate || new Date();
      }
    } else {
      startDate = startDateOrCycleId;
      endDate = maybeEndDate || new Date();
    }

    // 1. Chấm công: Truy vấn trong khoảng thời gian của kỳ đánh giá
    let attendances = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Fallback demo: nếu kỳ chưa có bản ghi (do dữ liệu demo ở tháng hiện tại), lấy tháng hiện tại
    if (attendances.length === 0) {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      attendances = await prisma.attendance.findMany({
        where: {
          employeeId,
          date: {
            gte: currentMonthStart,
            lte: currentMonthEnd,
          },
        },
      });
    }

    const totalCheckIns = attendances.filter((a) => a.checkIn || a.status).length;
    let lateOrEarlyCount = 0;
    let halfDayCount = 0;
    for (const att of attendances) {
      if (att.status === 'LATE' || att.status === 'EARLY_LEAVE') {
        lateOrEarlyCount++;
      } else if (att.status === 'HALF_DAY') {
        halfDayCount++;
      }
    }

    // 2. Nghỉ không lương (UNPAID) đã duyệt giao với kỳ đánh giá
    let unpaidLeaves = await prisma.leaveRequest.findMany({
      where: {
        employeeId,
        leaveType: 'UNPAID',
        status: 'APPROVED',
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    if (unpaidLeaves.length === 0) {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      unpaidLeaves = await prisma.leaveRequest.findMany({
        where: {
          employeeId,
          leaveType: 'UNPAID',
          status: 'APPROVED',
          startDate: { lte: currentMonthEnd },
          endDate: { gte: currentMonthStart },
        },
      });
    }

    let unpaidLeaveDays = 0;
    for (const leave of unpaidLeaves) {
      const effectiveStart = new Date(Math.max(new Date(leave.startDate).getTime(), startDate.getTime()));
      const effectiveEnd = new Date(Math.min(new Date(leave.endDate).getTime(), endDate.getTime()));
      if (effectiveStart <= effectiveEnd) {
        unpaidLeaveDays += AttendanceService.countBusinessDays(effectiveStart, effectiveEnd);
      } else {
        unpaidLeaveDays += AttendanceService.countBusinessDays(leave.startDate, leave.endDate);
      }
    }

    // 3. Kỷ luật đang ACTIVE
    const activeDisciplines = await prisma.discipline.findMany({
      where: {
        employeeId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        decisionNumber: true,
        form: true,
        penaltyAmount: true,
        decisionDate: true,
        reason: true,
      },
    });

    const evaluated = this.evaluateViolationMetrics(
      totalCheckIns,
      lateOrEarlyCount,
      halfDayCount,
      unpaidLeaveDays,
      activeDisciplines
    );

    return {
      cycleId,
      employeeId,
      ...evaluated,
    };
  }

  // --- Helper: Tự động điền điểm và ghi chú minh chứng cho nhóm tiêu chí Kỷ luật & Chuyên cần ---
  static prefillDisciplineAndAttendanceScores(
    categories: Array<{
      criteria: Array<{ id: string; name: string }>;
    }>,
    existingScores: Array<{
      criteriaId: string;
      selfScore?: number | null;
      selfNote?: string | null;
      mgrScore?: number | null;
      mgrNote?: string | null;
    }>,
    autoMetrics: AutoPerformanceMetrics
  ) {
    const scoresMap = new Map<string, any>();
    for (const s of existingScores) {
      scoresMap.set(s.criteriaId, { ...s });
    }

    for (const cat of categories) {
      for (const cri of cat.criteria) {
        const lowerName = cri.name.toLowerCase();
        const isAttendance = lowerName.includes('chuyên cần') || lowerName.includes('giờ giấc');
        const isDiscipline =
          lowerName.includes('tuân thủ nội quy') ||
          lowerName.includes('bảo mật') ||
          lowerName.includes('kỷ luật') ||
          lowerName.includes('an toàn') ||
          lowerName.includes('quản trị rủi ro');

        if (isAttendance || isDiscipline) {
          const suggestedScore = isAttendance
            ? autoMetrics.suggestedAttendanceScore
            : autoMetrics.suggestedDisciplineScore;
          const evidenceNote = isAttendance
            ? autoMetrics.attendanceEvidence
            : autoMetrics.disciplineEvidence;

          let entry = scoresMap.get(cri.id);
          if (!entry) {
            entry = {
              id: `auto-${cri.id}`,
              criteriaId: cri.id,
              selfScore: suggestedScore,
              selfNote: evidenceNote,
              mgrScore: suggestedScore,
              mgrNote: evidenceNote,
            };
            scoresMap.set(cri.id, entry);
          } else {
            if (entry.selfScore === null || entry.selfScore === undefined) {
              entry.selfScore = suggestedScore;
            }
            if (!entry.selfNote) {
              entry.selfNote = evidenceNote;
            }
            if (entry.mgrScore === null || entry.mgrScore === undefined) {
              entry.mgrScore = suggestedScore;
            }
            if (!entry.mgrNote) {
              entry.mgrNote = evidenceNote;
            }
          }
        }
      }
    }

    return Array.from(scoresMap.values());
  }

  // --- Reviews Management ---
  static async getReviewsByCycle(cycleId: string) {
    const reviews = await prisma.performanceReview.findMany({
      where: { cycleId },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            department: true,
            position: true,
            isCadre: true,
            cadreType: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            targetDepartment: true,
            targetRole: true,
            categories: {
              include: { criteria: true },
            },
          },
        },
        scores: {
          include: {
            criteria: {
              include: { category: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return await Promise.all(
      reviews.map(async (review) => {
        const autoMetrics = await PerformanceService.calculateAttendanceAndDisciplineMetrics(
          review.employeeId,
          cycleId
        );
        const prefilledScores = PerformanceService.prefillDisciplineAndAttendanceScores(
          review.template?.categories || [],
          review.scores || [],
          autoMetrics
        );
        return {
          ...review,
          scores: prefilledScores,
          autoMetrics,
        };
      })
    );
  }

  static async getEmployeeReview(employeeId: string, cycleId: string) {
    let review = await prisma.performanceReview.findUnique({
      where: {
        cycleId_employeeId: {
          cycleId,
          employeeId,
        },
      },
      include: {
        cycle: {
          include: {
            template: {
              include: {
                categories: {
                  orderBy: { sortOrder: 'asc' },
                  include: {
                    criteria: { orderBy: { sortOrder: 'asc' } },
                  },
                },
              },
            },
          },
        },
        template: {
          include: {
            categories: {
              orderBy: { sortOrder: 'asc' },
              include: {
                criteria: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
        reviewer: {
          select: { id: true, fullName: true, position: true },
        },
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            department: true,
            position: true,
            isCadre: true,
            cadreType: true,
          },
        },
        scores: {
          include: {
            criteria: true,
          },
        },
      },
    });

    if (!review) {
      const cycle = await prisma.performanceCycle.findUnique({
        where: { id: cycleId },
        include: {
          template: {
            include: {
              categories: {
                orderBy: { sortOrder: 'asc' },
                include: {
                  criteria: { orderBy: { sortOrder: 'asc' } },
                },
              },
            },
          },
        },
      });

      const resolvedTemplate = await this.resolveTemplateForEmployee(
        employeeId,
        cycle?.templateId
      );

      const employee = await prisma.employeeProfile.findUnique({
        where: { id: employeeId },
        select: {
          id: true,
          fullName: true,
          employeeCode: true,
          department: true,
          position: true,
          isCadre: true,
          cadreType: true,
        },
      });

      const autoMetrics = await this.calculateAttendanceAndDisciplineMetrics(employeeId, cycleId);
      const prefilledScores = this.prefillDisciplineAndAttendanceScores(
        resolvedTemplate?.categories || [],
        [],
        autoMetrics
      );

      return {
        id: null,
        cycleId,
        employeeId,
        cycle,
        templateId: resolvedTemplate?.id,
        template: resolvedTemplate,
        employee,
        status: 'DRAFT',
        scores: prefilledScores,
        selfScore: null,
        selfComment: null,
        autoMetrics,
      };
    }

    // If review exists but doesn't have template linked yet, resolve and link it
    if (!review.template) {
      const resolvedTemplate = await this.resolveTemplateForEmployee(
        employeeId,
        review.cycle?.templateId
      );
      if (resolvedTemplate) {
        review = await prisma.performanceReview.update({
          where: { id: review.id },
          data: { templateId: resolvedTemplate.id },
          include: {
            cycle: {
              include: {
                template: {
                  include: {
                    categories: {
                      orderBy: { sortOrder: 'asc' },
                      include: {
                        criteria: { orderBy: { sortOrder: 'asc' } },
                      },
                    },
                  },
                },
              },
            },
            template: {
              include: {
                categories: {
                  orderBy: { sortOrder: 'asc' },
                  include: {
                    criteria: { orderBy: { sortOrder: 'asc' } },
                  },
                },
              },
            },
            reviewer: {
              select: { id: true, fullName: true, position: true },
            },
            employee: {
              select: {
                id: true,
                fullName: true,
                employeeCode: true,
                department: true,
                position: true,
                isCadre: true,
                cadreType: true,
              },
            },
            scores: {
              include: {
                criteria: true,
              },
            },
          },
        });
      }
    }

    const autoMetrics = await this.calculateAttendanceAndDisciplineMetrics(employeeId, cycleId);
    const prefilledScores = this.prefillDisciplineAndAttendanceScores(
      review.template?.categories || review.cycle?.template?.categories || [],
      review.scores || [],
      autoMetrics
    );

    return {
      ...review,
      scores: prefilledScores,
      autoMetrics,
    };
  }

  // --- Calculate Weighted Score Helper ---
  private static calculateWeightedTotal(
    categories: Array<{
      weight: number;
      criteria: Array<{ id: string; weight: number }>;
    }>,
    scoresMap: Map<string, number>
  ): number {
    let totalScore = 0;
    let totalCatWeight = 0;

    for (const cat of categories) {
      let catScore = 0;
      let totalCriWeight = 0;

      for (const cri of cat.criteria) {
        const score = scoresMap.get(cri.id);
        if (score !== undefined && score !== null) {
          catScore += score * cri.weight;
          totalCriWeight += cri.weight;
        }
      }

      if (totalCriWeight > 0) {
        const catNormalized = catScore / totalCriWeight;
        totalScore += catNormalized * cat.weight;
        totalCatWeight += cat.weight;
      }
    }

    if (totalCatWeight > 0) {
      return Number((totalScore / totalCatWeight).toFixed(2));
    }
    return 0;
  }

  // --- Submit Self-Review ---
  static async submitSelfReview(
    employeeId: string,
    cycleId: string,
    data: {
      selfScore?: number;
      selfComment: string;
      scores?: Array<{
        criteriaId: string;
        selfScore: number;
        selfNote?: string;
      }>;
    }
  ) {
    const cycle = await prisma.performanceCycle.findUnique({
      where: { id: cycleId },
    });

    // Check existing review or resolve template
    const existingReview = await prisma.performanceReview.findUnique({
      where: {
        cycleId_employeeId: {
          cycleId,
          employeeId,
        },
      },
    });

    let activeTemplate = null;
    if (existingReview?.templateId) {
      activeTemplate = await prisma.kpiTemplate.findUnique({
        where: { id: existingReview.templateId },
        include: {
          categories: {
            include: { criteria: true },
          },
        },
      });
    }

    if (!activeTemplate) {
      activeTemplate = await this.resolveTemplateForEmployee(employeeId, cycle?.templateId);
    }

    let calculatedSelfTotal: number | null = null;

    if (data.scores && data.scores.length > 0 && activeTemplate) {
      const scoresMap = new Map<string, number>();
      for (const s of data.scores) {
        scoresMap.set(s.criteriaId, s.selfScore);
      }
      calculatedSelfTotal = this.calculateWeightedTotal(activeTemplate.categories, scoresMap);
    } else if (data.selfScore) {
      calculatedSelfTotal = Number(data.selfScore);
    }

    // Upsert review record
    const review = await prisma.performanceReview.upsert({
      where: {
        cycleId_employeeId: {
          cycleId,
          employeeId,
        },
      },
      update: {
        templateId: activeTemplate?.id,
        selfScore: calculatedSelfTotal || data.selfScore || 5,
        selfComment: data.selfComment,
        totalSelfScore: calculatedSelfTotal,
        status: ReviewStatus.SUBMITTED,
      },
      create: {
        cycleId,
        employeeId,
        templateId: activeTemplate?.id,
        selfScore: calculatedSelfTotal || data.selfScore || 5,
        selfComment: data.selfComment,
        totalSelfScore: calculatedSelfTotal,
        status: ReviewStatus.SUBMITTED,
      },
    });

    // Save individual criteria scores
    if (data.scores && data.scores.length > 0) {
      for (const s of data.scores) {
        await prisma.reviewScore.upsert({
          where: {
            reviewId_criteriaId: {
              reviewId: review.id,
              criteriaId: s.criteriaId,
            },
          },
          update: {
            selfScore: s.selfScore,
            selfNote: s.selfNote,
          },
          create: {
            reviewId: review.id,
            criteriaId: s.criteriaId,
            selfScore: s.selfScore,
            selfNote: s.selfNote,
          },
        });
      }
    }

    return await this.getEmployeeReview(employeeId, cycleId);
  }

  // --- Submit Manager Review ---
  static async submitManagerReview(
    reviewId: string,
    reviewerId: string,
    data: {
      mgrScore?: number;
      mgrComment: string;
      finalRating?: string;
      scores?: Array<{
        criteriaId: string;
        mgrScore: number;
        mgrNote?: string;
      }>;
    }
  ) {
    const existing = await prisma.performanceReview.findUnique({
      where: { id: reviewId },
      include: {
        cycle: {
          include: {
            template: {
              include: {
                categories: {
                  include: { criteria: true },
                },
              },
            },
          },
        },
        template: {
          include: {
            categories: {
              include: { criteria: true },
            },
          },
        },
      },
    });

    if (!existing) {
      throw new Error('Không tìm thấy bản đánh giá.');
    }

    // Resolve template if missing
    let activeCategories = existing.template?.categories || existing.cycle?.template?.categories;
    if (!activeCategories) {
      const resolved = await this.resolveTemplateForEmployee(
        existing.employeeId,
        existing.cycle.templateId
      );
      if (resolved) {
        activeCategories = resolved.categories;
        await prisma.performanceReview.update({
          where: { id: reviewId },
          data: { templateId: resolved.id },
        });
      }
    }

    let calculatedMgrTotal: number | null = null;

    if (data.scores && data.scores.length > 0 && activeCategories) {
      const scoresMap = new Map<string, number>();
      for (const s of data.scores) {
        scoresMap.set(s.criteriaId, s.mgrScore);
      }
      calculatedMgrTotal = this.calculateWeightedTotal(activeCategories, scoresMap);
    } else if (data.mgrScore) {
      calculatedMgrTotal = Number(data.mgrScore);
    }

    const finalMgrScore = calculatedMgrTotal || data.mgrScore || 5;
    const autoRating = calculateAutoRating(finalMgrScore);
    const chosenFinalRating = data.finalRating || autoRating;

    // Save criteria scores
    if (data.scores && data.scores.length > 0) {
      for (const s of data.scores) {
        await prisma.reviewScore.upsert({
          where: {
            reviewId_criteriaId: {
              reviewId,
              criteriaId: s.criteriaId,
            },
          },
          update: {
            mgrScore: s.mgrScore,
            mgrNote: s.mgrNote,
          },
          create: {
            reviewId,
            criteriaId: s.criteriaId,
            mgrScore: s.mgrScore,
            mgrNote: s.mgrNote,
          },
        });
      }
    }

    return await prisma.performanceReview.update({
      where: { id: reviewId },
      data: {
        reviewerId,
        mgrScore: finalMgrScore,
        mgrComment: data.mgrComment,
        totalMgrScore: calculatedMgrTotal,
        totalWeightedScore: finalMgrScore,
        autoRating,
        finalRating: chosenFinalRating,
        status: ReviewStatus.COMPLETED,
      },
      include: {
        employee: true,
        reviewer: true,
        template: true,
        scores: {
          include: { criteria: true },
        },
      },
    });
  }

  // --- Calibration: Summary for Cycle ---
  static async getCycleSummary(cycleId: string) {
    const cycle = await prisma.performanceCycle.findUnique({
      where: { id: cycleId },
      include: {
        template: {
          include: {
            categories: {
              include: { criteria: true },
            },
          },
        },
      },
    });

    if (!cycle) throw new Error('Không tìm thấy kỳ đánh giá.');

    const reviews = await prisma.performanceReview.findMany({
      where: { cycleId },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            department: true,
            position: true,
            isCadre: true,
            cadreType: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            fullName: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            targetDepartment: true,
            targetRole: true,
          },
        },
        scores: {
          include: {
            criteria: {
              include: { category: true },
            },
          },
        },
      },
      orderBy: { totalWeightedScore: 'desc' },
    });

    // Rating distribution statistics
    const ratingDistribution: Record<string, number> = {
      EXCELLENT: 0,
      GOOD: 0,
      AVERAGE: 0,
      NEEDS_IMPROVEMENT: 0,
      UNSATISFACTORY: 0,
    };

    // Department statistics
    const deptStats: Record<string, { total: number; sumScore: number; count: number }> = {};

    let totalScoreSum = 0;
    let completedCount = 0;

    for (const r of reviews) {
      const rating = r.finalRating || r.autoRating;
      if (rating && ratingDistribution[rating] !== undefined) {
        ratingDistribution[rating]++;
      }

      if (r.status === ReviewStatus.COMPLETED && r.totalWeightedScore) {
        totalScoreSum += r.totalWeightedScore;
        completedCount++;

        const dept = r.employee.department || 'Chưa phân bổ';
        if (!deptStats[dept]) {
          deptStats[dept] = { total: 0, sumScore: 0, count: 0 };
        }
        deptStats[dept].sumScore += r.totalWeightedScore;
        deptStats[dept].count++;
      }
    }

    const deptAverages = Object.keys(deptStats).map((dept) => ({
      department: dept,
      averageScore: Number((deptStats[dept].sumScore / deptStats[dept].count).toFixed(2)),
      count: deptStats[dept].count,
    }));

    return {
      cycle,
      totalReviews: reviews.length,
      completedReviews: completedCount,
      averageOverallScore: completedCount > 0 ? Number((totalScoreSum / completedCount).toFixed(2)) : 0,
      ratingDistribution,
      departmentAverages: deptAverages,
      reviews,
    };
  }

  // --- Calibration: Update Final Rating & Notes ---
  static async calibrateReview(
    reviewId: string,
    data: {
      finalRating: string;
      calibrationNote?: string;
    }
  ) {
    return await prisma.performanceReview.update({
      where: { id: reviewId },
      data: {
        finalRating: data.finalRating,
        mgrComment: data.calibrationNote
          ? `[Hiệu chỉnh BOD/HR]: ${data.calibrationNote}`
          : undefined,
      },
    });
  }
}
