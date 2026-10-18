import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticateJWT);

router.get('/salary-increase-due', requireRoles(['ADMIN', 'HR_MANAGER']), ReportsController.getSalaryRaiseDue);
router.get('/retirement-due', requireRoles(['ADMIN', 'HR_MANAGER']), ReportsController.getRetirementDue);
router.get('/demographics', requireRoles(['ADMIN', 'HR_MANAGER']), ReportsController.getDemographics);
router.get('/resume-print/:id', ReportsController.getResumeData);

export default router;
