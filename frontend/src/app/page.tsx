'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-900">
      <div className="w-14 h-14 rounded-sm bg-blue-600 flex items-center justify-center shadow-none mb-6 text-white">
        <Building2 className="w-7 h-7" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
        NexNova Technologies HRM
      </h1>
      <p className="text-sm text-slate-500 mb-6">Đang chuyển tiếp tới cổng thông tin...</p>
      <Link
        href="/login"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors shadow-none"
      >
        <span>Vào trang Đăng nhập</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
