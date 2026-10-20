'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Clock,
  Banknote,
  Award,
  Building2,
  ArrowRightLeft,
  UserCheck,
  BarChart3,
  Trophy,
  FileSignature,
  UserCircle,
  Menu,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const isEmployee = user?.role === 'EMPLOYEE';

  const navItems = isEmployee
    ? [
        { title: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
        { title: 'Hồ sơ', href: '/dashboard/profile', icon: UserCircle },
        { title: 'Chấm công', href: '/dashboard/attendance', icon: Clock },
        { title: 'Bảng lương', href: '/dashboard/payroll', icon: Banknote },
        { title: 'Đánh giá', href: '/dashboard/performance', icon: Award },
        { title: 'Khen thưởng', href: '/dashboard/rewards', icon: Trophy },
        { title: 'Phòng ban', href: '/dashboard/departments', icon: Building2 },
      ]
    : [
        { title: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
        { title: 'Nhân sự', href: '/dashboard/employees', icon: Users },
        { title: 'Phòng ban', href: '/dashboard/departments', icon: Building2 },
        { title: 'Hợp đồng', href: '/dashboard/contracts', icon: FileSignature },
        { title: 'Tuyển dụng', href: '/dashboard/recruitment', icon: UserCheck },
        { title: 'Chấm công', href: '/dashboard/attendance', icon: Clock },
        { title: 'Bảng lương', href: '/dashboard/payroll', icon: Banknote },
        { title: 'Đánh giá', href: '/dashboard/performance', icon: Award },
        { title: 'Khen thưởng', href: '/dashboard/rewards', icon: Trophy },
        { title: 'Điều động', href: '/dashboard/transfers', icon: ArrowRightLeft },
        { title: 'Báo cáo', href: '/dashboard/reports', icon: BarChart3 },
        { title: 'Hồ sơ', href: '/dashboard/profile', icon: UserCircle },
      ];

  return (
    <aside
      className={`${
        isExpanded ? 'w-[210px]' : 'w-[80px]'
      } bg-[#f0f3f8] text-slate-700 min-h-screen flex flex-col border-r border-slate-200 shrink-0 select-none transition-all duration-200 z-20`}
    >
      {/* Top Header with 1Office-style Hamburger Button */}
      <div
        className={`h-14 border-b border-slate-200 flex items-center ${
          isExpanded ? 'px-3 justify-between' : 'justify-center'
        } shrink-0 bg-[#e9edf4]`}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? 'Thu gọn menu' : 'Mở rộng menu'}
          className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-sm transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {isExpanded && (
          <div className="flex items-center gap-2 pr-2">
            <div className="w-6 h-6 rounded-sm bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              N
            </div>
            <span className="font-bold text-sm text-slate-900 tracking-tight">NexNova</span>
          </div>
        )}
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 py-2 px-1.5 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          if (!isExpanded) {
            // Chuẩn 1Office: Cột hẹp 72px với Icon trong vòng tròn nổi bật khi active + nhãn nhỏ phía dưới
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.title}
                className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-sm group transition-all relative ${
                  isActive
                    ? 'text-blue-600 font-semibold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                }`}
              >
                {isActive ? (
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-9 h-9 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-slate-500 group-hover:text-slate-800 transition-colors" />
                  </div>
                )}
                <span className="text-[11px] mt-1 text-center leading-tight w-full px-1 tracking-tight font-medium">
                  {item.title}
                </span>
              </Link>
            );
          }

          // Chế độ mở rộng (Expanded Menu khi nhấn Hamburger)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm rounded-sm transition-colors group ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 mr-3 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'
                }`}
              />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile Avatar */}
      <div className="p-2 border-t border-slate-200 flex flex-col items-center justify-center shrink-0 bg-[#e9edf4]">
        <Link
          href="/dashboard/profile"
          title={`Hồ sơ cá nhân: ${user?.fullName || 'Người dùng'}`}
          className="w-8 h-8 rounded-full bg-white border border-slate-300 flex items-center justify-center text-xs font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-xs"
        >
          {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
        </Link>
      </div>
    </aside>
  );
}
