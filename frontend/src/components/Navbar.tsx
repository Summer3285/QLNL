'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import {
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  SlidersHorizontal,
  PlusCircle,
  Clock,
  Settings,
  KeyRound,
  ChevronDown,
  Building2,
  Users,
  Banknote,
  FileSignature,
  Award,
  Check,
  CheckCircle2,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [checkedIn, setCheckedIn] = useState(true);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Map route to 1Office-style module badge
  const getModuleInfo = (path: string) => {
    if (path === '/dashboard') return { title: 'Tổng quan điều hành', canAdd: false };
    if (path.startsWith('/dashboard/payroll')) return { title: 'Bảng lương', canAdd: true, href: '/dashboard/payroll' };
    if (path.startsWith('/dashboard/employees')) return { title: 'Nhân sự', canAdd: true, href: '/dashboard/employees' };
    if (path.startsWith('/dashboard/departments')) return { title: 'Phòng ban', canAdd: true, href: '/dashboard/departments' };
    if (path.startsWith('/dashboard/contracts')) return { title: 'Hợp đồng', canAdd: true, href: '/dashboard/contracts' };
    if (path.startsWith('/dashboard/recruitment')) return { title: 'Tuyển dụng', canAdd: true, href: '/dashboard/recruitment' };
    if (path.startsWith('/dashboard/attendance')) return { title: 'Chấm công', canAdd: true, href: '/dashboard/attendance' };
    if (path.startsWith('/dashboard/performance')) return { title: 'Đánh giá', canAdd: true, href: '/dashboard/performance' };
    if (path.startsWith('/dashboard/rewards')) return { title: 'Khen thưởng', canAdd: true, href: '/dashboard/rewards' };
    if (path.startsWith('/dashboard/transfers')) return { title: 'Thuyên chuyển', canAdd: true, href: '/dashboard/transfers' };
    if (path.startsWith('/dashboard/reports')) return { title: 'Báo cáo', canAdd: false };
    if (path.startsWith('/dashboard/profile')) return { title: 'Hồ sơ cá nhân', canAdd: false };
    return { title: 'Quản trị nhân lực', canAdd: false };
  };

  const currentModule = getModuleInfo(pathname);

  // Quick search directory
  const searchDirectory = [
    { title: 'Bảng lương & Chi trả', href: '/dashboard/payroll', category: 'Phân hệ' },
    { title: 'Hồ sơ nhân sự toàn công ty', href: '/dashboard/employees', category: 'Phân hệ' },
    { title: 'Chấm công & Quỹ ngày phép', href: '/dashboard/attendance', category: 'Phân hệ' },
    { title: 'Hợp đồng lao động & Tái ký', href: '/dashboard/contracts', category: 'Phân hệ' },
    { title: 'Cơ cấu phòng ban & Sơ đồ tổ chức', href: '/dashboard/departments', category: 'Phân hệ' },
    { title: 'Tuyển dụng ứng viên mới', href: '/dashboard/recruitment', category: 'Phân hệ' },
    { title: 'Đánh giá hiệu suất công tác (KPI)', href: '/dashboard/performance', category: 'Phân hệ' },
    { title: 'Trần Quang Huy (Tổng Giám đốc)', href: '/dashboard/employees', category: 'Nhân sự' },
    { title: 'Nguyễn Thu Hà (Trưởng phòng Nhân sự)', href: '/dashboard/employees', category: 'Nhân sự' },
    { title: 'Đặng Minh Tuấn (Trưởng phòng AI & Dữ liệu)', href: '/dashboard/employees', category: 'Nhân sự' },
    { title: 'Phạm Mai Lan (Trưởng phòng Sản phẩm)', href: '/dashboard/employees', category: 'Nhân sự' },
  ];

  const searchResults = searchQuery.trim()
    ? searchDirectory.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Notifications
  const notifications = [
    {
      id: '1',
      title: 'Hợp đồng sắp đến hạn',
      desc: '2 nhân sự có hợp đồng lao động sẽ hết hiệu lực trong vòng 30 ngày.',
      time: '10 phút trước',
      unread: true,
      href: '/dashboard/contracts',
    },
    {
      id: '2',
      title: 'Đơn nghỉ phép mới chờ duyệt',
      desc: 'Lê Hoàng Nam đã gửi đơn xin nghỉ phép năm 01 ngày (Thứ Sáu tới).',
      time: '1 giờ trước',
      unread: true,
      href: '/dashboard/attendance',
    },
    {
      id: '3',
      title: 'Bảng lương tháng 10/2026',
      desc: 'Dữ liệu công thực tế đã sẵn sàng để tiến hành tính lương tự động.',
      time: 'Hôm nay',
      unread: false,
      href: '/dashboard/payroll',
    },
  ];

  return (
    <header className="h-14 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-none">
      {/* Left: 1Office-style Current Module Badge + Quick Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-2xl">
        {/* 1Office Module Indicator Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-blue-50/90 border border-blue-200/80 text-blue-700 text-xs font-semibold shrink-0 select-none">
          {currentModule.canAdd && (
            <PlusCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          )}
          <span className="tracking-tight">{currentModule.title}</span>
        </div>

        {/* 1Office Global Search Input */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Tìm kiếm nhân sự, phòng ban, tính năng..."
              className="w-full h-8 pl-8 pr-8 text-xs bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400 text-slate-800"
            />
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer hover:text-slate-600" />
          </div>

          {/* Quick Search Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-sm shadow-md py-1 z-50">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Kết quả tìm kiếm
              </div>
              {searchResults.slice(0, 5).map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    router.push(item.href);
                    setIsSearchFocused(false);
                    setSearchQuery('');
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span className="text-slate-700 font-medium truncate">{item.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-normal">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Check-in Status, Notifications & User Dropdown */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Quick Check-in Badge (HRM Standard) */}
        <button
          onClick={() => setCheckedIn(!checkedIn)}
          title="Nhấn để đổi trạng thái điểm danh"
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium transition-colors border ${
            checkedIn
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70'
              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{checkedIn ? 'Đã điểm danh: 08:15' : 'Chưa điểm danh'}</span>
        </button>

        <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

        {/* Notification Bell Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            title="Thông báo hệ thống"
            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-sm transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-1.5 w-80 bg-white border border-slate-200 rounded-sm shadow-lg py-2 z-50">
              <div className="px-3.5 py-1.5 flex items-center justify-between border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 tracking-tight">Thông báo điều hành</span>
                <span className="text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline">
                  Đánh dấu đã đọc
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setIsNotifOpen(false)}
                    className="block px-3.5 py-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-semibold ${n.unread ? 'text-slate-900' : 'text-slate-600'}`}>
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{n.desc}</p>
                  </Link>
                ))}
              </div>
              <div className="pt-1.5 px-3.5 text-center border-t border-slate-100">
                <Link
                  href="/dashboard/reports"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-[11px] text-slate-500 hover:text-blue-600 font-medium"
                >
                  Xem tất cả thông báo
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown Menu */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-sm hover:bg-slate-100/80 transition-colors cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {user?.fullName || user?.profile?.fullName
                ? (user.fullName || user.profile?.fullName)!.charAt(0).toUpperCase()
                : <UserIcon className="w-4 h-4 text-white" />}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 leading-tight flex items-center gap-1">
                <span className="truncate max-w-[120px]">
                  {user?.fullName || user?.profile?.fullName || 'Người dùng'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">
                {user?.profile?.position ||
                  (user?.role === 'ADMIN'
                    ? 'Quản trị viên'
                    : user?.role === 'HR_MANAGER'
                    ? 'Quản lý nhân sự'
                    : 'Nhân viên')}
              </div>
            </div>
          </button>

          {/* Account Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-sm shadow-lg py-1.5 z-50">
              {/* User Header */}
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {user?.fullName || 'Người dùng'}
                </div>
                <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                <div className="mt-1">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    {user?.role === 'ADMIN'
                      ? 'ADMIN'
                      : user?.role === 'HR_MANAGER'
                      ? 'HR MANAGER'
                      : 'EMPLOYEE'}
                  </span>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="py-1">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hồ sơ của tôi</span>
                </Link>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    alert('Chức năng đổi mật khẩu đang kết nối với hệ thống xác thực tập trung.');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors text-left"
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  <span>Đổi mật khẩu</span>
                </button>

                {user?.role === 'ADMIN' && (
                  <Link
                    href="/dashboard/reports"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Cấu hình hệ thống</span>
                  </Link>
                )}
              </div>

              <div className="border-t border-slate-100 my-1"></div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
