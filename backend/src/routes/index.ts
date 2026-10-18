import { Router } from 'express';
import authRoutes from './auth.routes.js';
import employeeRoutes from './employee.routes.js';
import attendanceRoutes from './attendance.routes.js';
import payrollRoutes from './payroll.routes.js';
import performanceRoutes from './performance.routes.js';
import rewardRoutes from './reward.routes.js';
import transferRoutes from './transfer.routes.js';
import recruitmentRoutes from './recruitment.routes.js';
import reportsRoutes from './reports.routes.js';
import departmentRoutes from './department.routes.js';
import contractRoutes from './contract.routes.js';

const router = Router();

// Health Check API
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'NexNova Enterprise HRM Backend',
    timestamp: new Date().toISOString(),
    version: '2.1.0',
  });
});

// 5 Core Modules + 4 HUHA Enhanced Modules + Departments + Contracts
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/departments', departmentRoutes);
router.use('/contracts', contractRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/payroll', payrollRoutes);
router.use('/performance', performanceRoutes);

// Enhanced Modules from HUHA HRM Pattern
router.use('/rewards', rewardRoutes);
router.use('/transfers', transferRoutes);
router.use('/recruitment', recruitmentRoutes);
router.use('/reports', reportsRoutes);

export default router;
