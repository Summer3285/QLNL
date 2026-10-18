import { Router } from 'express';
import { TransferController } from '../controllers/transfer.controller.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticateJWT);

router.get('/', TransferController.getTransfers);
router.post('/', requireRoles(['ADMIN', 'HR_MANAGER']), TransferController.createTransfer);

export default router;
