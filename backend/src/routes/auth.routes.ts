import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email('Email không đúng định dạng.'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự.'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại.'),
  newPassword: z.string().min(6, 'Mật khẩu mới tối thiểu 6 ký tự.'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không đúng định dạng.'),
});

router.post('/login', validateBody(loginSchema), AuthController.login);
router.get('/me', authenticateJWT, AuthController.getMe);
router.post(
  '/change-password',
  authenticateJWT,
  validateBody(changePasswordSchema),
  AuthController.changePassword
);
router.post('/forgot-password', validateBody(forgotPasswordSchema), AuthController.forgotPassword);

export default router;
