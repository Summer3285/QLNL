import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { prisma } from './config/prisma.js';

const app = createApp();

const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Kết nối cơ sở dữ liệu thành công (SQLite / PostgreSQL).');
  } catch (err) {
    console.warn('⚠️ Cảnh báo: Chưa kết nối được cơ sở dữ liệu.');
  }

  const server = app.listen(ENV.PORT, () => {
    console.log(`🚀 NexNova Enterprise HRM Backend API đang chạy tại: http://localhost:${ENV.PORT}`);
    console.log(`📋 API Docs & Health check: http://localhost:${ENV.PORT}/api/health`);
  });

  const shutdown = async () => {
    console.log('\n🛑 Đang dừng server gracefully...');
    await prisma.$disconnect();
    server.close(() => {
      console.log('✅ Server đã đóng hoàn toàn.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer();
