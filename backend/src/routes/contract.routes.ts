import { Router } from 'express';
import { ContractController } from '../controllers/contract.controller.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticateJWT);

router.get('/', ContractController.getContracts);
router.get('/stats', ContractController.getStats);
router.get('/expiring', ContractController.getExpiring);
router.get('/:id', ContractController.getContractById);

router.post('/', requireRoles(['ADMIN', 'HR_MANAGER']), ContractController.createContract);
router.put('/:id', requireRoles(['ADMIN', 'HR_MANAGER']), ContractController.updateContract);
router.delete('/:id', requireRoles(['ADMIN', 'HR_MANAGER']), ContractController.deleteContract);

export default router;
