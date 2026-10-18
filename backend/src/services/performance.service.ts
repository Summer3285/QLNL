import { prisma } from '../config/prisma.js';
import { ReviewStatus } from '../types/index.js';

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
  static async getReviewsByCycle(cycleId: string) {
    return await prisma.performanceReview.findMany({
      where: { cycleId },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            department: true,
            position: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
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
  }

  static async getEmployeeReview(employeeId: string, cycleId: string) {
    // Ensure review exists or load existing
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
        reviewer: {
          select: { id: true, fullName: true, position: true },
        },
        scores: {
          include: {
            criteria: true,
          },
        },
      },
    });

    if (!review) {
      // If cycle has a template, we can return the template structure even before draft is saved
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

      return {
        id: null,
        cycleId,
        employeeId,
        cycle,
        status: 'DRAFT',
        scores: [],
        selfScore: null,
        selfComment: null,
      };
    }

    return review;
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
    // Load cycle with template structure
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

    let calculatedSelfTotal: number | null = null;

    if (data.scores && data.scores.length > 0 && cycle?.template) {
      const scoresMap = new Map<string, number>();
      for (const s of data.scores) {
        scoresMap.set(s.criteriaId, s.selfScore);
      }
      calculatedSelfTotal = this.calculateWeightedTotal(cycle.template.categories, scoresMap);
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
        selfScore: calculatedSelfTotal || data.selfScore || 5,
        selfComment: data.selfComment,
        totalSelfScore: calculatedSelfTotal,
        status: ReviewStatus.SUBMITTED,
      },
      create: {
        cycleId,
        employeeId,
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
      },
    });

    if (!existing) {
      throw new Error('Không tìm thấy bản đánh giá.');
    }

    let calculatedMgrTotal: number | null = null;

    if (data.scores && data.scores.length > 0 && existing.cycle.template) {
      const scoresMap = new Map<string, number>();
      for (const s of data.scores) {
        scoresMap.set(s.criteriaId, s.mgrScore);
      }
      calculatedMgrTotal = this.calculateWeightedTotal(existing.cycle.template.categories, scoresMap);
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
          },
        },
        reviewer: {
          select: {
            id: true,
            fullName: true,
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
