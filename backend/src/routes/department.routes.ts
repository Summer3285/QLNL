import { Router } from 'express';
import { z } from 'zod';
import { DepartmentController } from '../controllers/department.controller.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';

const router = Router();

const createDepartmentSchema = z.object({
  code: z.string().min(2, 'Mã phòng ban tối thiểu 2 ký tự.'),
  name: z.string().min(3, 'Tên phòng ban tối thiểu 3 ký tự.'),
  description: z.string().optional(),
  location: z.string().optional(),
  budget: z.coerce.number().optional(),
  managerId: z.string().optional(),
  deputyId: z.string().optional(),
  sortOrder: z.coerce.number().optional(),
});

const updateDepartmentSchema = z.object({
  name: z.string().min(3, 'Tên phòng ban tối thiểu 3 ký tự.').optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  budget: z.coerce.number().optional(),
  managerId: z.string().nullable().optional(),
  deputyId: z.string().nullable().optional(),
  sortOrder: z.coerce.number().optional(),
});

router.use(authenticateJWT);

router.get('/', DepartmentController.getAll);
router.get('/org-chart', DepartmentController.getOrgChart);
router.get('/:id', DepartmentController.getById);

router.post(
  '/',
  requireRoles(['ADMIN', 'HR_MANAGER']),
  validateBody(createDepartmentSchema),
  DepartmentController.create
);

router.put(
  '/:id',
  requireRoles(['ADMIN', 'HR_MANAGER']),
  validateBody(updateDepartmentSchema),
  DepartmentController.update
);

router.delete(
  '/:id',
  requireRoles(['ADMIN', 'HR_MANAGER']),
  DepartmentController.delete
);

export default router;
