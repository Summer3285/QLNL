'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api';
import StatCard from '../../components/StatCard';
import { formatVND, formatDate } from '../../lib/utils';
import {
  Users,
  Building2,
  CalendarCheck2,
  Coins,
  ArrowUpRight,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Award,
  AlertTriangle,
  FileText,
  CreditCard,
  ShieldAlert,
  ArrowRight,
  Bell,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isHR } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [todayAttendances, setTodayAttendances] = useState<any[]>([]);
  const [expiringContracts, setExpiringContracts] = useState<any[]>([]);
  const [incompleteProfiles, setIncompleteProfiles] = useState<any[]>([]);
  const [activeAlertTab, setActiveAlertTab] = useState<'contracts' | 'profiles'>('contracts');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isHR) {
          const [statsRes, attendRes, contractRes, empRes] = await Promise.all([
            api.get('/api/employees/stats/departments'),
            api.get('/api/attendance/today-overview'),
            api.get('/api/contracts/expiring?days=30'),
            api.get('/api/employees'),
          ]);

          if (statsRes.success) setStats(statsRes.data);
          if (attendRes.success) setTodayAttendances(attendRes.data);
          if (contractRes.success) setExpiringContracts(contractRes.data || []);
          if (empRes.success && empRes.data) {
            // Filter profiles lacking legal or banking info
            const incomplete = empRes.data.filter((e: any) =>
              !e.idCardNumber || !e.taxCode || !e.bankAccountNumber
            );
            setIncompleteProfiles(incomplete);
          }
        } else {
          // Employee personal stats
          const myAttend = await api.get('/api/attendance/my-logs');
          if (myAttend.success) {
            setStats(myAttend.data);
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu trang chủ:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isHR]);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-sm border border-slate-200/80 p-5 sm:p-6 shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Xin chào, {user?.fullName || user?.profile?.fullName || user?.email}!
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard/attendance"
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-none"
            >
              <Clock className="w-4 h-4" />
              <span>Chấm công</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      {isHR ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Nhân sự"
            value={stats?.totalEmployees ?? 7}
            icon={Users}
            trend="+12% so với cùng kỳ"
            trendUp={true}
          />
          <StatCard
            title="Đang hoạt động"
            value={stats?.activeUsers ?? 7}
            icon={CheckCircle2}
            trend="100% hoạt động"
            trendUp={true}
          />
          <StatCard
            title="Phòng ban"
            value={stats?.departments?.length ?? 5}
            icon={Building2}
          />
          <StatCard
            title="Quỹ lương"
            value={formatVND(stats?.totalSalaryBudget ?? 358000000)}
            icon={Coins}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Ngày công"
            value={`${stats?.summary?.totalDaysPresent ?? 22} ngày`}
            icon={CalendarCheck2}
            trend="Đạt chuẩn"
            trendUp={true}
          />
          <StatCard
            title="Giờ làm việc"
            value={`${stats?.summary?.totalWorkHours ?? 176} giờ`}
            icon={Clock}
          />
          <StatCard
            title="Đi muộn"
            value={`${stats?.summary?.totalLate ?? 0} lần`}
            icon={CheckCircle2}
            trend={stats?.summary?.totalLate === 0 ? 'Đúng giờ' : 'Cần chú ý'}
            trendUp={stats?.summary?.totalLate === 0}
          />
        </div>
      )}

      {/* SMART HR ALERTS WIDGET (CHỈ HIỂN THỊ VỚI HR/ADMIN) */}
      {isHR && (
        <div className="bg-white border border-slate-200 rounded-sm shadow-none p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-sm bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Trung tâm Cảnh báo Điều hành Nhân sự</span>
                  {(expiringContracts.length > 0 || incompleteProfiles.length > 0) && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      {expiringContracts.length + incompleteProfiles.length} việc cần xử lý
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tự động phát hiện hợp đồng sắp hết hạn và hồ sơ nhân sự cần bổ sung thông tin pháp lý
                </p>
              </div>
            </div>

            {/* Alert Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-sm border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveAlertTab('contracts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-medium transition-colors ${
                  activeAlertTab === 'contracts'
                    ? 'bg-white text-blue-700 shadow-none font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>HĐ sắp hết hạn ({expiringContracts.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAlertTab('profiles')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-medium transition-colors ${
                  activeAlertTab === 'profiles'
                    ? 'bg-white text-blue-700 shadow-none font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Hồ sơ cần hoàn thiện ({incompleteProfiles.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: EXPIRING CONTRACTS */}
          {activeAlertTab === 'contracts' && (
            <div className="space-y-3">
              {expiringContracts.length === 0 ? (
                <div className="p-4 rounded-sm bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Tuyệt vời! Không có hợp đồng lao động nào sắp hết hạn trong vòng 30 ngày tới.
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {expiringContracts.map((c) => {
                    const isUrgent = (c.daysRemaining ?? 30) <= 7;
                    return (
                      <div
                        key={c.id}
                        className={`p-3.5 rounded-sm border flex flex-col justify-between transition-all ${
                          isUrgent
                            ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400'
                            : 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="font-mono text-[10px] font-bold text-slate-500">
                              {c.contractNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                                isUrgent
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              Còn {c.daysRemaining ?? 0} ngày
                            </span>
                          </div>

                          <div className="text-xs font-bold text-slate-900">
                            {c.employee?.fullName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {c.employee?.department} • {c.employee?.position}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-1">
                            Hết hạn:{' '}
                            <strong className="text-slate-800">
                              {formatDate(c.endDate)}
                            </strong>
                          </div>
                        </div>

                        <div className="pt-2.5 mt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-medium">
                            {c.contractType === 'PROBATION' ? 'Thử việc' : 'Xác định thời hạn'}
                          </span>
                          <Link
                            href="/dashboard/contracts"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900"
                          >
                            <span>Gia hạn / Tái ký</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INCOMPLETE PROFILES */}
          {activeAlertTab === 'profiles' && (
            <div className="space-y-3">
              {incompleteProfiles.length === 0 ? (
                <div className="p-4 rounded-sm bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    100% hồ sơ nhân sự đã hoàn thiện đầy đủ thông tin pháp lý (CCCD, MST) và tài khoản ngân hàng!
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {incompleteProfiles.map((emp) => {
                    const missingFields = [];
                    if (!emp.idCardNumber) missingFields.push('CCCD');
                    if (!emp.taxCode) missingFields.push('MST');
                    if (!emp.bankAccountNumber) missingFields.push('STK Ngân hàng');

                    return (
                      <div
                        key={emp.id}
                        className="p-3.5 rounded-sm border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="font-mono text-blue-600 font-semibold text-[10px]">
                              {emp.employeeCode}
                            </span>
                            <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Chưa hoàn thiện
                            </span>
                          </div>

                          <div className="text-xs font-bold text-slate-900">
                            {emp.fullName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {emp.department} • {emp.position}
                          </div>

                          <div className="mt-2 text-[11px] text-slate-600">
                            <span className="text-slate-400">Thiếu: </span>
                            <span className="font-medium text-amber-700">
                              {missingFields.join(', ')}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2.5 mt-2.5 border-t border-slate-200/80 flex items-center justify-end">
                          <Link
                            href="/dashboard/employees"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900"
                          >
                            <span>Bổ sung hồ sơ</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Department Breakdown (or Employee profile card) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-sm p-6 shadow-none">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">
              {isHR ? 'Phòng ban' : 'Thông tin cá nhân'}
            </h2>
            {isHR && (
              <Link
                href="/dashboard/employees"
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {isHR ? (
            <div className="space-y-3">
              {stats?.departments?.map((dept: any) => (
                <div
                  key={dept.department}
                  className="p-3.5 rounded-sm bg-slate-50 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-slate-900">
                      {dept.department}
                    </div>
                    <div className="text-xs text-slate-500">
                      Lương bình quân: <span className="font-medium text-slate-700 font-mono">{formatVND(dept.averageSalary)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Nhân sự</div>
                      <div className="text-sm font-semibold text-blue-600">
                        {dept.count}
                      </div>
                    </div>
                    <div className="text-right border-l border-slate-200 pl-4">
                      <div className="text-xs text-slate-400">Quỹ lương</div>
                      <div className="text-sm font-semibold font-mono text-slate-900">
                        {formatVND(dept.totalSalary)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-sm bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Mã nhân viên</span>
                  <div className="font-mono text-blue-600 font-medium">
                    {user?.profile?.employeeCode}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Phòng ban</span>
                  <div className="text-slate-800 font-medium">{user?.profile?.department}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Vị trí</span>
                  <div className="text-slate-800 font-medium">{user?.profile?.position}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Ngày gia nhập</span>
                  <div className="text-slate-800 font-medium">
                    {formatDate(user?.profile?.joinDate)}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Lương cơ sở</span>
                  <div className="text-slate-800 font-medium font-mono">
                    {formatVND(user?.profile?.baseSalary || 0)}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Phụ cấp</span>
                  <div className="text-slate-800 font-medium font-mono">
                    {formatVND(user?.profile?.allowance || 0)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Quick Links */}
        <div className="bg-white border border-slate-200/80 rounded-sm p-6 shadow-none">
          <h2 className="text-base font-bold text-slate-900 mb-3">
            Truy cập nhanh
          </h2>

          <div className="space-y-2">
            {isHR && (
              <Link
                href="/dashboard/employees"
                className="p-3 rounded-sm bg-slate-50 border border-slate-200/60 hover:bg-slate-100 flex items-center justify-between text-sm font-medium text-slate-700 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Nhân sự</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </Link>
            )}

            <Link
              href="/dashboard/attendance"
              className="p-3 rounded-sm bg-slate-50 border border-slate-200/60 hover:bg-slate-100 flex items-center justify-between text-sm font-medium text-slate-700 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Chấm công</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </Link>

            <Link
              href="/dashboard/payroll"
              className="p-3 rounded-sm bg-slate-50 border border-slate-200/60 hover:bg-slate-100 flex items-center justify-between text-sm font-medium text-slate-700 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Coins className="w-4 h-4 text-slate-500" />
                <span>Bảng lương</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </Link>

            <Link
              href="/dashboard/performance"
              className="p-3 rounded-sm bg-slate-50 border border-slate-200/60 hover:bg-slate-100 flex items-center justify-between text-sm font-medium text-slate-700 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-slate-500" />
                <span>Đánh giá</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
