import { Router } from 'express';
import { RecruitmentController } from '../controllers/recruitment.controller.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticateJWT);

router.get('/plans', RecruitmentController.getPlans);
router.post('/plans', requireRoles(['ADMIN', 'HR_MANAGER']), RecruitmentController.createPlan);
router.put('/plans/:id/status', requireRoles(['ADMIN', 'HR_MANAGER']), RecruitmentController.updatePlanStatus);

router.get('/candidates', RecruitmentController.getCandidates);
router.get('/candidates/next-code', requireRoles(['ADMIN', 'HR_MANAGER']), RecruitmentController.getNextCode);
router.post('/candidates', requireRoles(['ADMIN', 'HR_MANAGER']), RecruitmentController.createCandidate);
router.post('/candidates/:id/convert', requireRoles(['ADMIN', 'HR_MANAGER']), RecruitmentController.convertCandidate);
router.put('/candidates/:id/status', requireRoles(['ADMIN', 'HR_MANAGER']), RecruitmentController.updateCandidateStatus);
router.patch('/candidates/:id/status', requireRoles(['ADMIN', 'HR_MANAGER']), RecruitmentController.updateCandidateStatus);
router.put('/candidates/:id', requireRoles(['ADMIN', 'HR_MANAGER']), RecruitmentController.updateCandidateStatus);
router.patch('/candidates/:id', requireRoles(['ADMIN', 'HR_MANAGER']), RecruitmentController.updateCandidateStatus);

router.get('/probation-alerts', requireRoles(['ADMIN', 'HR_MANAGER']), RecruitmentController.getProbationAlerts);

export default router;
