import { Router } from 'express';
import { RewardController } from '../controllers/reward.controller.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticateJWT);

// Rewards
router.get('/', RewardController.getRewards);
router.post('/', requireRoles(['ADMIN', 'HR_MANAGER']), RewardController.createReward);
router.delete('/:id', requireRoles(['ADMIN', 'HR_MANAGER']), RewardController.deleteReward);

// Disciplines
router.get('/disciplines', RewardController.getDisciplines);
router.post('/disciplines', requireRoles(['ADMIN', 'HR_MANAGER']), RewardController.createDiscipline);
router.delete('/disciplines/:id', requireRoles(['ADMIN', 'HR_MANAGER']), RewardController.deleteDiscipline);

export default router;
