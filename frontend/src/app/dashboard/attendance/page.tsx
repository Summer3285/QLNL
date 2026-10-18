'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import { AttendanceRecord, LeaveRequest, Department } from '../../../types';
import { formatDate, formatTime } from '../../../lib/utils';
import Modal from '../../../components/Modal';
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShieldCheck,
  Building2,
  Trash2,
  Info,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

// Helper: Count working business days (Mon - Fri)
const calculateBusinessDays = (startStr: string, endStr: string): number => {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endStr);
  end.setHours(0, 0, 0, 0);
  if (end < start) return 0;

  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

// Helper: Badge styling for leave types
const getLeaveTypeBadge = (type: string) => {
  switch (type) {
    case 'ANNUAL':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          Phép năm (Có lương)
        </span>
      );
    case 'SICK':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          Nghỉ ốm / Điều trị
        </span>
      );
    case 'MATERNITY':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          Nghỉ thai sản
        </span>
      );
    case 'COMPASSIONATE':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Việc riêng có lương
        </span>
      );
    case 'UNPAID':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          Nghỉ không lương
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-slate-100 text-slate-700">
          {type}
        </span>
      );
  }
};

export default function AttendancePage() {
  const { user, isHR } = useAuth();
  const [activeTab, setActiveTab] = useState<'attendance' | 'my-leaves' | 'leave-approval'>('attendance');

  // Attendance state
  const [myLogs, setMyLogs] = useState<AttendanceRecord[]>([]);
  const [todayLog, setTodayLog] = useState<AttendanceRecord | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Leave requests state
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [leaveDeptFilter, setLeaveDeptFilter] = useState<string>('ALL');
  const [leaveBalance, setLeaveBalance] = useState({
    totalStandard: 12,
    usedDays: 0,
    pendingDays: 0,
    remainingDays: 12,
  });
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'ANNUAL',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchAttendanceData = async () => {
    setAttendanceLoading(true);
    try {
      const res = await api.get('/api/attendance/my-logs');
      if (res.success && res.data) {
        setMyLogs(res.data.records || []);
        // Find today log
        const todayStr = new Date().toISOString().split('T')[0];
        const found = (res.data.records || []).find((r: any) =>
          r.date.startsWith(todayStr)
        );
        setTodayLog(found || null);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu chấm công:', err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchLeaves = async () => {
    try {
      const [res, balRes, deptRes] = await Promise.all([
        api.get('/api/attendance/leaves'),
        api.get('/api/attendance/leave-balance'),
        api.get('/api/departments'),
      ]);
      if (res.success && res.data) {
        setMyLeaves(res.data);
      }
      if (balRes.success && balRes.data) {
        setLeaveBalance(balRes.data);
      }
      if (deptRes.success && deptRes.data) {
        setDepartments(deptRes.data);
      }
      if (isHR) {
        const pendingRes = await api.get('/api/attendance/leaves?status=PENDING');
        if (pendingRes.success && pendingRes.data) {
          setPendingLeaves(pendingRes.data);
        }
      }
    } catch (err) {
      console.error('Lỗi tải danh sách nghỉ phép:', err);
    }
  };

  const handleCancelLeave = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn thu hồi đơn xin nghỉ phép này?')) return;
    try {
      const res = await api.delete(`/api/attendance/leaves/${id}`);
      if (res.success) {
        fetchLeaves();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi thu hồi đơn nghỉ phép.');
    }
  };

  useEffect(() => {
    fetchAttendanceData();
    fetchLeaves();
  }, [isHR]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await api.post('/api/attendance/check-in', {
        notes: 'Chấm công cổng Web NexNova',
      });
      if (res.success) {
        setActionMessage({ type: 'success', text: 'Điểm danh Check-In thành công!' });
        if (typeof window !== 'undefined' && (window as any).electronAPI?.showNotification) {
          (window as any).electronAPI.showNotification(
            'NexNova HRM Desktop',
            'Điểm danh Check-In thành công! Chúc bạn một ngày làm việc hiệu quả.'
          );
        }
        fetchAttendanceData();
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Lỗi khi Check-In.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await api.post('/api/attendance/check-out', {
        notes: 'Check-out hoàn tất ca làm việc',
      });
      if (res.success) {
        setActionMessage({ type: 'success', text: 'Điểm danh Check-Out thành công!' });
        if (typeof window !== 'undefined' && (window as any).electronAPI?.showNotification) {
          (window as any).electronAPI.showNotification(
            'NexNova HRM Desktop',
            'Điểm danh Check-Out hoàn tất ca làm việc thành công!'
          );
        }
        fetchAttendanceData();
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Lỗi khi Check-Out.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveSubmitting(true);
    try {
      const res = await api.post('/api/attendance/leaves', leaveForm);
      if (res.success) {
        setIsLeaveModalOpen(false);
        setLeaveForm({
          leaveType: 'ANNUAL',
          startDate: '',
          endDate: '',
          reason: '',
        });
        fetchLeaves();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi đơn xin nghỉ.');
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const handleApproveLeave = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const comment = prompt(
        status === 'APPROVED' ? 'Ghi chú phê duyệt (Tùy chọn):' : 'Lý do từ chối đơn:'
      );
      if (status === 'REJECTED' && !comment) {
        alert('Vui lòng nhập lý do từ chối.');
        return;
      }

      const res = await api.put(`/api/attendance/leaves/${id}/status`, {
        status,
        reviewComment: comment || 'Đã duyệt qua hệ thống HRM.',
      });

      if (res.success) {
        fetchLeaves();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xử lý đơn nghỉ phép.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Chấm công & Nghỉ phép
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi thời gian làm việc, quản lý điểm danh và phê duyệt đơn nghỉ phép
          </p>
        </div>

        <button
          onClick={() => setIsLeaveModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-none"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo đơn nghỉ</span>
        </button>
      </div>

      {/* Live Check-In / Check-Out Widget */}
      <div className="bg-white border border-slate-200/80 rounded-sm p-5 shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-slate-500">
              Điểm danh hôm nay
            </div>
            <div className="text-sm text-slate-600">
              Nhân viên: <span className="font-semibold text-slate-900">{user?.profile?.fullName}</span> (
              <span className="font-mono text-slate-700 font-medium">{user?.profile?.employeeCode}</span>)
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <div>
                Giờ Check-in:{' '}
                <span className="font-mono text-emerald-600 font-semibold text-sm">
                  {todayLog?.checkIn ? formatTime(todayLog.checkIn) : 'Chưa ghi nhận'}
                </span>
              </div>
              <span className="text-slate-300">•</span>
              <div>
                Giờ Check-out:{' '}
                <span className="font-mono text-blue-600 font-semibold text-sm">
                  {todayLog?.checkOut ? formatTime(todayLog.checkOut) : 'Chưa ghi nhận'}
                </span>
              </div>
              <span className="text-slate-300">•</span>
              <div>
                Tổng giờ công:{' '}
                <span className="font-mono text-slate-900 font-bold text-sm">
                  {todayLog?.workHours ?? 0} giờ
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCheckIn}
              disabled={actionLoading || Boolean(todayLog?.checkIn)}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-4 h-4" />
              <span>{todayLog?.checkIn ? 'Đã Check-In' : 'Check-In Ngay'}</span>
            </button>

            <button
              onClick={handleCheckOut}
              disabled={
                actionLoading ||
                !todayLog?.checkIn ||
                Boolean(todayLog?.checkOut)
              }
              className="inline-flex items-center gap-2 h-10 px-5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4 text-slate-600" />
              <span>{todayLog?.checkOut ? 'Đã Check-Out' : 'Check-Out Ca'}</span>
            </button>
          </div>
        </div>

        {actionMessage && (
          <div
            className={`mt-4 p-3.5 rounded-sm text-sm flex items-center gap-2 ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span className="font-medium">{actionMessage.text}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`h-9 px-4 rounded-sm text-sm font-semibold transition-all ${
            activeTab === 'attendance'
              ? 'bg-blue-600 text-white shadow-none'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Lịch Sử Điểm Danh Tháng
        </button>
        <button
          onClick={() => setActiveTab('my-leaves')}
          className={`h-9 px-4 rounded-sm text-sm font-semibold transition-all ${
            activeTab === 'my-leaves'
              ? 'bg-blue-600 text-white shadow-none'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Đơn Nghỉ Phép Của Tôi ({myLeaves.length})
        </button>

        {isHR && (
          <button
            onClick={() => setActiveTab('leave-approval')}
            className={`h-9 px-4 rounded-sm text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'leave-approval'
                ? 'bg-blue-600 text-white shadow-none'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Duyệt Đơn Nghỉ Phép</span>
            {pendingLeaves.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-sm bg-amber-400 text-slate-950 font-bold text-xs">
                {pendingLeaves.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Tab 1: Attendance Log Table */}
      {activeTab === 'attendance' && (
        <div className="bg-white border border-slate-200/80 rounded-sm overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-xs tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Ngày làm việc</th>
                  <th className="px-5 py-3.5">Giờ Check-in</th>
                  <th className="px-5 py-3.5">Giờ Check-out</th>
                  <th className="px-5 py-3.5">Số giờ làm</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                      Đang tải lịch sử chấm công...
                    </td>
                  </tr>
                ) : myLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                      Chưa có dữ liệu chấm công cho tháng này.
                    </td>
                  </tr>
                ) : (
                  myLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-900 text-sm">
                        {formatDate(log.date)}
                      </td>
                      <td className="px-5 py-4 font-mono font-medium text-emerald-600 text-sm">
                        {log.checkIn ? formatTime(log.checkIn) : '---'}
                      </td>
                      <td className="px-5 py-4 font-mono font-medium text-blue-600 text-sm">
                        {log.checkOut ? formatTime(log.checkOut) : '---'}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-slate-900 text-sm">
                        {log.workHours} giờ
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold ${
                            log.status === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : log.status === 'LATE'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {log.status === 'PRESENT'
                            ? 'Đúng Giờ'
                            : log.status === 'LATE'
                            ? 'Đi Muộn'
                            : log.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 text-sm">{log.notes || '---'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: My Leave Requests */}
      {activeTab === 'my-leaves' && (
        <div className="space-y-4">
          {/* Leave Balance Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200/80 rounded-sm p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Quỹ Phép Năm</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {leaveBalance.totalStandard} <span className="text-xs font-normal text-slate-500">ngày</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Tiêu chuẩn Luật LĐ</div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-sm p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đã Sử Dụng</div>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {leaveBalance.usedDays} <span className="text-xs font-normal text-slate-500">ngày</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Đã được phê duyệt</div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-sm p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang Chờ Duyệt</div>
              <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
                {leaveBalance.pendingDays} <span className="text-xs font-normal text-slate-500">ngày</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Đang gửi quản lý/HR</div>
            </div>
            <div className="bg-white border border-blue-200 rounded-sm p-4 bg-blue-50/40">
              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Số Dư Còn Lại</div>
              <div className="text-2xl font-bold font-mono text-blue-700 mt-1">
                {leaveBalance.remainingDays} <span className="text-xs font-normal text-blue-600">ngày</span>
              </div>
              <div className="text-[11px] text-blue-600 mt-0.5">Khả dụng trong năm</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-sm overflow-hidden shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Loại nghỉ phép</th>
                    <th className="px-5 py-3.5">Thời gian & Số ngày</th>
                    <th className="px-5 py-3.5">Lý do</th>
                    <th className="px-5 py-3.5">Trạng thái</th>
                    <th className="px-5 py-3.5">Người duyệt & Nhận xét</th>
                    <th className="px-5 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Bạn chưa gửi đơn xin nghỉ phép nào.
                      </td>
                    </tr>
                  ) : (
                    myLeaves.map((l) => {
                      const busDays = calculateBusinessDays(l.startDate, l.endDate);
                      return (
                        <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            {getLeaveTypeBadge(l.leaveType)}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="text-slate-900 font-medium">
                              {formatDate(l.startDate)} &rarr; {formatDate(l.endDate)}
                            </div>
                            <div className="text-[11px] font-mono font-semibold text-blue-700 mt-0.5">
                              {busDays} ngày làm việc
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-700 max-w-xs">{l.reason}</td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-semibold ${
                                l.status === 'APPROVED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : l.status === 'REJECTED'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {l.status === 'APPROVED'
                                ? 'Đã Phê Duyệt'
                                : l.status === 'REJECTED'
                                ? 'Từ Chối'
                                : 'Chờ Xét Duyệt'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {l.approvedBy ? (
                              <div>
                                <span className="font-medium text-slate-900">{l.approvedBy}</span>
                                {l.reviewComment && (
                                  <div className="text-[11px] text-slate-500 italic mt-0.5">
                                    "{l.reviewComment}"
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Chưa phản hồi</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            {l.status === 'PENDING' && (
                              <button
                                onClick={() => handleCancelLeave(l.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                                title="Thu hồi đơn này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Thu hồi</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: HR Leave Approval Queue */}
      {isHR && activeTab === 'leave-approval' && (
        <div className="bg-white border border-slate-200/80 rounded-sm overflow-hidden shadow-none space-y-3">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Danh Sách Đơn Nghỉ Phép Chờ Phê Duyệt</h3>
              <p className="text-xs text-slate-500">Phê duyệt phân cấp theo từng phòng ban và thẩm quyền quản lý</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Lọc theo phòng ban:</span>
              <select
                value={leaveDeptFilter}
                onChange={(e) => setLeaveDeptFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-sm px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">Tất cả phòng ban</option>
                {departments.length > 0
                  ? departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.code})
                      </option>
                    ))
                  : Array.from(new Set(pendingLeaves.map((l) => l.employee?.department).filter(Boolean))).map((d) => (
                      <option key={d as string} value={d as string}>
                        {d}
                      </option>
                    ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Cán bộ nộp đơn</th>
                  <th className="px-5 py-3.5">Phòng ban</th>
                  <th className="px-5 py-3.5">Loại phép</th>
                  <th className="px-5 py-3.5">Thời gian & Số ngày</th>
                  <th className="px-5 py-3.5">Quỹ phép NV</th>
                  <th className="px-5 py-3.5">Lý do</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingLeaves.filter((l) => leaveDeptFilter === 'ALL' || l.employee?.department === leaveDeptFilter).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      Hiện không có đơn nghỉ phép nào đang chờ xét duyệt cho phòng ban này.
                    </td>
                  </tr>
                ) : (
                  pendingLeaves
                    .filter((l) => leaveDeptFilter === 'ALL' || l.employee?.department === leaveDeptFilter)
                    .map((l) => {
                      const busDays = calculateBusinessDays(l.startDate, l.endDate);
                      const rem = l.employee?.annualLeaveBalance ?? 12;
                      const isOver = l.leaveType === 'ANNUAL' && busDays > rem;
                      return (
                        <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="font-semibold text-slate-900">
                              {l.employee?.fullName}
                            </div>
                            <div className="text-[11px] font-mono text-blue-600">
                              {l.employee?.employeeCode}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                            {l.employee?.department}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            {getLeaveTypeBadge(l.leaveType)}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="text-slate-900 font-medium">
                              {formatDate(l.startDate)} &rarr; {formatDate(l.endDate)}
                            </div>
                            <div className="text-[11px] font-mono font-bold text-blue-700 mt-0.5">
                              {busDays} ngày làm việc
                            </div>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="font-mono font-bold text-slate-900 text-xs">
                              {rem} ngày
                            </div>
                            {isOver ? (
                              <span className="text-[10px] text-rose-700 font-semibold flex items-center gap-1 mt-0.5">
                                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                Thiếu {busDays - rem} ngày
                              </span>
                            ) : l.leaveType === 'ANNUAL' ? (
                              <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">
                                Sau duyệt còn {rem - busDays} ngày
                              </span>
                            ) : null}
                          </td>
                          <td className="px-5 py-3.5 text-slate-700 max-w-xs">{l.reason}</td>
                          <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => handleApproveLeave(l.id, 'APPROVED')}
                              className="h-8 px-3 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-none"
                            >
                              Duyệt Đơn
                            </button>
                            <button
                              onClick={() => handleApproveLeave(l.id, 'REJECTED')}
                              className="h-8 px-3 rounded-sm bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold transition-colors"
                            >
                              Từ Chối
                            </button>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submit Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Nộp Đơn Xin Nghỉ Phép"
      >
        <form onSubmit={handleCreateLeave} className="space-y-4 text-sm">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Loại Nghỉ Phép *</label>
              {leaveForm.leaveType === 'ANNUAL' && (
                <span className="text-xs text-blue-600 font-medium">
                  Quỹ phép còn: <strong>{leaveBalance.remainingDays} ngày</strong>
                </span>
              )}
            </div>
            <select
              value={leaveForm.leaveType}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
              className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ANNUAL">Nghỉ phép năm (Có hưởng lương, trừ quỹ phép)</option>
              <option value="SICK">Nghỉ ốm / Điều trị y tế</option>
              <option value="MATERNITY">Nghỉ thai sản</option>
              <option value="COMPASSIONATE">Nghỉ việc riêng có lương (Hiếu, hỉ)</option>
              <option value="UNPAID">Nghỉ không hưởng lương</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Ngày Bắt Đầu *</label>
              <input
                type="date"
                required
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Ngày Kết Thúc *</label>
              <input
                type="date"
                required
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dynamic Business Days & Quota Validation Box */}
          {leaveForm.startDate && leaveForm.endDate && (() => {
            const reqDays = calculateBusinessDays(leaveForm.startDate, leaveForm.endDate);
            const isInsufficient = leaveForm.leaveType === 'ANNUAL' && reqDays > leaveBalance.remainingDays;

            return (
              <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Số ngày công xin nghỉ:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {reqDays} ngày làm việc
                  </span>
                </div>

                {leaveForm.leaveType === 'ANNUAL' && (
                  <div className="pt-2 border-t border-slate-200">
                    {isInsufficient ? (
                      <div className="p-2.5 rounded-sm bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">Quỹ phép năm không đủ!</div>
                          <div className="text-[11px] mt-0.5">
                            Đơn xin <strong>{reqDays} ngày</strong> nhưng bạn chỉ còn <strong>{leaveBalance.remainingDays} ngày</strong> phép. Hãy chuyển sang "Nghỉ không hưởng lương (UNPAID)" hoặc điều chỉnh lại ngày.
                          </div>
                        </div>
                      </div>
                    ) : reqDays > 0 ? (
                      <div className="p-2 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          Quỹ phép khả dụng. Sau khi duyệt dự kiến bạn còn lại <strong>{leaveBalance.remainingDays - reqDays} ngày</strong>.
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-amber-700 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Khoảng thời gian đã chọn rơi vào cuối tuần (T7, CN). Vui lòng chọn ngày làm việc.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Lý Do Nghỉ Phép *</label>
            <textarea
              required
              rows={3}
              placeholder="Nêu rõ lý do và kế hoạch bàn giao công việc..."
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-sm p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              * Hệ thống chỉ tính trừ các ngày làm việc thực tế (Thứ 2 đến Thứ 6), không trừ ngày Thứ Bảy và Chủ Nhật.
            </p>
          </div>

          <div className="pt-3.5 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="h-9 px-4 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={
                leaveSubmitting ||
                (Boolean(leaveForm.startDate && leaveForm.endDate) &&
                  (calculateBusinessDays(leaveForm.startDate, leaveForm.endDate) === 0 ||
                    (leaveForm.leaveType === 'ANNUAL' &&
                      calculateBusinessDays(leaveForm.startDate, leaveForm.endDate) > leaveBalance.remainingDays)))
              }
              className="h-9 px-5 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-none"
            >
              {leaveSubmitting ? 'Đang gửi...' : 'Gửi Đơn Lên HR'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
