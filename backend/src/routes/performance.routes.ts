import { Router } from 'express';
import { z } from 'zod';
import { PerformanceController } from '../controllers/performance.controller.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';

const router = Router();

const createTemplateSchema = z.object({
  name: z.string().min(3, 'Tên bộ tiêu chí tối thiểu 3 ký tự.'),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  categories: z.array(
    z.object({
      name: z.string().min(1, 'Tên nhóm chỉ tiêu không được trống.'),
      weight: z.number().min(0).max(1),
      sortOrder: z.number().optional(),
      criteria: z.array(
        z.object({
          name: z.string().min(1, 'Tên tiêu chí không được trống.'),
          description: z.string().optional(),
          weight: z.number().min(0).max(1),
          sortOrder: z.number().optional(),
        })
      ),
    })
  ),
});

const createCycleSchema = z.object({
  title: z.string().min(3, 'Tên kỳ đánh giá tối thiểu 3 ký tự.'),
  startDate: z.string().min(1, 'Vui lòng nhập ngày bắt đầu.'),
  endDate: z.string().min(1, 'Vui lòng nhập ngày kết thúc.'),
  templateId: z.string().optional(),
});

const submitSelfReviewSchema = z.object({
  selfScore: z.coerce.number().min(1, 'Điểm tự đánh giá phải từ 1 đến 5.').max(5, 'Điểm tự đánh giá phải từ 1 đến 5.').optional(),
  selfComment: z.string().min(1, 'Vui lòng viết nhận xét về công tác trong kỳ.'),
  scores: z.array(
    z.object({
      criteriaId: z.string(),
      selfScore: z.coerce.number().min(1).max(5),
      selfNote: z.string().optional(),
    })
  ).optional(),
});

const submitManagerReviewSchema = z.object({
  mgrScore: z.coerce.number().min(1, 'Điểm đánh giá phải từ 1 đến 5.').max(5, 'Điểm đánh giá phải từ 1 đến 5.').optional(),
  mgrComment: z.string().min(1, 'Vui lòng viết nhận xét đánh giá.'),
  finalRating: z.enum(['EXCELLENT', 'GOOD', 'AVERAGE', 'NEEDS_IMPROVEMENT', 'UNSATISFACTORY']).optional(),
  scores: z.array(
    z.object({
      criteriaId: z.string(),
      mgrScore: z.coerce.number().min(1).max(5),
      mgrNote: z.string().optional(),
    })
  ).optional(),
});

const calibrateReviewSchema = z.object({
  finalRating: z.enum(['EXCELLENT', 'GOOD', 'AVERAGE', 'NEEDS_IMPROVEMENT', 'UNSATISFACTORY']),
  calibrationNote: z.string().optional(),
});

router.use(authenticateJWT);

// --- KPI Templates ---
router.get('/templates', PerformanceController.getTemplates);
router.get('/templates/:id', PerformanceController.getTemplateById);
router.post(
  '/templates',
  requireRoles(['ADMIN', 'HR_MANAGER']),
  validateBody(createTemplateSchema),
  PerformanceController.createTemplate
);

// --- Cycles ---
router.get('/cycles', PerformanceController.getCycles);
router.post(
  '/cycles',
  requireRoles(['ADMIN', 'HR_MANAGER']),
  validateBody(createCycleSchema),
  PerformanceController.createCycle
);

router.get('/cycles/:cycleId/reviews', PerformanceController.getReviewsByCycle);
router.get('/cycles/:cycleId/my-review', PerformanceController.getMyReview);
router.get(
  '/cycles/:cycleId/summary',
  requireRoles(['ADMIN', 'HR_MANAGER']),
  PerformanceController.getCycleSummary
);

// --- Reviews ---
router.post(
  '/cycles/:cycleId/self-review',
  validateBody(submitSelfReviewSchema),
  PerformanceController.submitSelfReview
);

router.put(
  '/reviews/:reviewId/manager-review',
  requireRoles(['ADMIN', 'HR_MANAGER']),
  validateBody(submitManagerReviewSchema),
  PerformanceController.submitManagerReview
);

router.put(
  '/reviews/:reviewId/calibrate',
  requireRoles(['ADMIN', 'HR_MANAGER']),
  validateBody(calibrateReviewSchema),
  PerformanceController.calibrateReview
);

export default router;
