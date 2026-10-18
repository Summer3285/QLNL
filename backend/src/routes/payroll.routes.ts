import { Router } from 'express';
import { z } from 'zod';
import { PayrollController } from '../controllers/payroll.controller.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';

const router = Router();

const calculatePayrollSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
});

router.use(authenticateJWT);

router.post(
  '/calculate',
  requireRoles(['ADMIN', 'HR_MANAGER']),
  validateBody(calculatePayrollSchema),
  PayrollController.calculateMonthly
);

router.get('/', PayrollController.getAll);
router.get('/:id', PayrollController.getById);

router.put(
  '/:id/pay',
  requireRoles(['ADMIN', 'HR_MANAGER']),
  PayrollController.markAsPaid
);

router.get('/:id/pdf', PayrollController.downloadPdf);

export default router;
