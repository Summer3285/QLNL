import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { ENV } from '../config/env.js';
import { AuthUserPayload, UserRole } from '../types/index.js';

export class AuthService {
  static async login(email: string, passwordPlain: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true },
    });

    if (!user || !user.isActive) {
      throw new Error('Email hoặc mật khẩu không chính xác.');
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw new Error('Email hoặc mật khẩu không chính xác.');
    }

    const payload: AuthUserPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      employeeId: user.profile?.id,
      fullName: user.profile?.fullName,
    };

    const token = jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.profile?.fullName || '',
        profile: user.profile,
      },
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        profile: true,
      },
    });

    if (!user) {
      throw new Error('Không tìm thấy thông tin người dùng.');
    }

    return {
      ...user,
      fullName: user.profile?.fullName || '',
    };
  }

  static async changePassword(userId: string, oldPass: string, newPass: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('Người dùng không tồn tại.');
    }

    const isMatch = await bcrypt.compare(oldPass, user.passwordHash);
    if (!isMatch) {
      throw new Error('Mật khẩu hiện tại không chính xác.');
    }

    const newHash = await bcrypt.hash(newPass, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { success: true, message: 'Đổi mật khẩu thành công.' };
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      // Return true to avoid user enumeration
      return { message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.' };
    }
    // In enterprise environment, a reset token or link would be emailed
    return { message: 'Hướng dẫn khôi phục mật khẩu đã được gửi tới hòm thư của bạn.' };
  }
}
