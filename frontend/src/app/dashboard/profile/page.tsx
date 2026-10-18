'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import { EmployeeProfile, Contract, LeaveRequest } from '../../../types';
import { formatVND, formatDate } from '../../../lib/utils';
import Modal from '../../../components/Modal';
import PayslipModal from '../../../components/PayslipModal';
import {
  UserCircle,
  Briefcase,
  Building2,
  Calendar,
  CreditCard,
  Landmark,
  FileSignature,
  Clock,
  DollarSign,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Download,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Crown,
  Edit2,
  Eye,
  FileText,
} from 'lucide-react';

export default function MyProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'WORK' | 'LEGAL' | 'CONTRACTS' | 'LEAVE' | 'PAYROLL'>('WORK');

  // Leave balance state
  const [leaveBalance, setLeaveBalance] = useState<{
    totalStandard: number;
    usedDays: number;
    pendingDays: number;
    remainingDays: number;
  }>({
    totalStandard: 12,
    usedDays: 0,
    pendingDays: 0,
    remainingDays: 12,
  });

  // Edit contact/banking modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: '',
    address: '',
    bankAccountNumber: '',
    bankName: '',
    bankBranch: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Create leave request modal
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'ANNUAL',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Payslip modal state
  const [selectedPayslipId, setSelectedPayslipId] = useState<string | null>(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [meRes, balanceRes] = await Promise.all([
        api.get('/api/employees/me'),
        api.get('/api/attendance/leave-balance'),
      ]);

      if (meRes.success && meRes.data) {
        setProfile(meRes.data);
        setEditForm({
          phone: meRes.data.phone || '',
          address: meRes.data.address || '',
          bankAccountNumber: meRes.data.bankAccountNumber || '',
          bankName: meRes.data.bankName || 'Ngân hàng Ngoại Thương (Vietcombank)',
          bankBranch: meRes.data.bankBranch || 'Sở Giao Dịch Hà Nội',
        });
      }

      if (balanceRes.success && balanceRes.data) {
        setLeaveBalance(balanceRes.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải hồ sơ cá nhân:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleSaveContactInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await api.put('/api/employees/me', editForm);
      if (res.success) {
        setIsEditModalOpen(false);
        fetchProfileData();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật thông tin.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLeave(true);
    setLeaveMessage(null);
    try {
      const res = await api.post('/api/attendance/leaves', leaveForm);
      if (res.success) {
        setLeaveMessage({ type: 'success', text: 'Nộp đơn xin nghỉ phép thành công!' });
        fetchProfileData();
        setTimeout(() => {
          setIsLeaveModalOpen(false);
          setLeaveMessage(null);
        }, 1000);
      }
    } catch (err: any) {
      setLeaveMessage({ type: 'error', text: err.message || 'Lỗi khi gửi đơn xin nghỉ.' });
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleDownloadPdf = async (payrollId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/payroll/${payrollId}/pdf`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Không thể tải file PDF.');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Phieu-Luong-${payrollId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Lỗi tải phiếu lương PDF.');
    }
  };

  const getContractTypeBadge = (type: string) => {
    switch (type) {
      case 'INDEFINITE':
        return <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Không thời hạn</span>;
      case 'DEFINITE_3Y':
        return <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Có thời hạn 3 năm</span>;
      case 'DEFINITE_1Y':
        return <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">Có thời hạn 1 năm</span>;
      case 'PROBATION':
        return <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">Thử việc</span>;
      default:
        return <span className="px-2 py-0.5 rounded-sm text-[11px] font-medium bg-slate-100 text-slate-700">{type}</span>;
    }
  };

  const getLeaveStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã duyệt</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Từ chối</span>;
      default:
        return <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1"><Clock className="w-3 h-3 text-amber-600" /> Chờ duyệt</span>;
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'ANNUAL':
        return 'Nghỉ phép năm';
      case 'SICK':
        return 'Nghỉ ốm đau';
      case 'MATERNITY':
        return 'Nghỉ thai sản';
      case 'COMPASSIONATE':
        return 'Việc riêng có lương';
      case 'UNPAID':
        return 'Nghỉ không lương';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-sm p-12 text-center text-sm text-slate-400">
        Đang tải thông tin hồ sơ nhân sự...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Hồ sơ cá nhân
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cổng thông tin tự phục vụ, tra cứu hợp đồng, phiếu lương và cập nhật thông tin
          </p>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="inline-flex items-center gap-2 h-9 px-3.5 rounded-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-xs transition-colors shadow-none"
        >
          <Edit2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Cập nhật liên hệ & ngân hàng</span>
        </button>
      </div>

      {/* Hero Overview Card */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center shrink-0">
              {profile?.fullName?.slice(0, 2).toUpperCase() || 'NV'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900">{profile?.fullName}</h2>
                {profile?.isCadre ? (
                  <span className="px-2 py-0.5 rounded-sm text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    Cán bộ
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-sm text-xs font-medium bg-slate-100 text-slate-700">
                    Nhân viên
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-blue-700 font-semibold">{profile?.employeeCode}</span>
                <span>•</span>
                <span>{profile?.position}</span>
                <span>•</span>
                <span>{profile?.departmentRef?.name || profile?.department}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {profile?.email || profile?.user?.email}
                </span>
                {profile?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {profile?.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Ngày gia nhập</span>
              <span className="text-xs font-mono font-bold text-slate-900">{formatDate(profile?.joinDate)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Phép năm còn lại</span>
              <span className="text-sm font-bold text-emerald-600">{leaveBalance.remainingDays} ngày</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Hợp đồng</span>
              <span className="text-xs font-bold text-blue-700">{profile?.contracts?.length || 0} HĐ</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Quản lý</span>
              <span className="text-xs font-medium text-slate-800 truncate block max-w-[120px]">
                {profile?.lineManager?.fullName || 'Ban Giám Đốc'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-none">
        <div className="flex items-center gap-2 p-2 border-b border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('WORK')}
            className={`px-3.5 py-1.5 rounded-sm text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'WORK'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Công việc & Tổ chức
          </button>
          <button
            onClick={() => setActiveTab('LEGAL')}
            className={`px-3.5 py-1.5 rounded-sm text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'LEGAL'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Định danh & Ngân hàng
          </button>
          <button
            onClick={() => setActiveTab('CONTRACTS')}
            className={`px-3.5 py-1.5 rounded-sm text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'CONTRACTS'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Hợp đồng của tôi ({profile?.contracts?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('LEAVE')}
            className={`px-3.5 py-1.5 rounded-sm text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'LEAVE'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Quỹ phép năm & Đơn nghỉ
          </button>
          <button
            onClick={() => setActiveTab('PAYROLL')}
            className={`px-3.5 py-1.5 rounded-sm text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'PAYROLL'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Lương & Thu nhập
          </button>
        </div>

        {/* TAB 1: WORK & ORG */}
        {activeTab === 'WORK' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Chức danh & Cơ cấu</span>
              </h4>
              <div className="space-y-2.5 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Phòng ban trực thuộc:</span>
                  <span className="font-semibold text-slate-900">{profile?.departmentRef?.name || profile?.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã phòng ban:</span>
                  <span className="font-mono text-blue-600 font-semibold">{profile?.departmentRef?.code || 'PB-CORE'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vị trí đảm nhiệm:</span>
                  <span className="font-semibold text-slate-900">{profile?.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cấp bậc nhân sự:</span>
                  <span className="font-semibold text-slate-900">{profile?.cadreType === 'LEADERSHIP' ? 'Cán bộ Lãnh đạo' : profile?.cadreType === 'MANAGEMENT' ? 'Cán bộ Quản lý' : 'Nhân viên chuyên môn'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quản lý trực tiếp (Line Manager):</span>
                  <span className="font-semibold text-blue-700">
                    {profile?.lineManager ? `${profile.lineManager.fullName} (${profile.lineManager.position})` : 'Ban Điều Hành Doanh Nghiệp'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Thời gian công tác</span>
              </h4>
              <div className="space-y-2.5 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngày tiếp nhận công việc:</span>
                  <span className="font-mono text-slate-900 font-medium">{formatDate(profile?.joinDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngày bổ nhiệm chức vụ:</span>
                  <span className="font-mono text-slate-900 font-medium">{profile?.appointmentDate ? formatDate(profile.appointmentDate) : 'Theo ngày tiếp nhận'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Địa điểm làm việc:</span>
                  <span className="text-slate-900">{profile?.departmentRef?.location || 'Tòa nhà NexNova Tower, Hà Nội'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trạng thái làm việc:</span>
                  <span className="px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">Đang làm việc</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEGAL & BANKING */}
        {activeTab === 'LEGAL' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Định danh pháp lý</span>
              </h4>
              <div className="space-y-2.5 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Số CCCD / CMND:</span>
                  <span className="font-mono font-bold text-slate-900">{profile?.idCardNumber || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngày cấp:</span>
                  <span className="font-mono text-slate-900">{profile?.idCardIssueDate ? formatDate(profile.idCardIssueDate) : '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nơi cấp:</span>
                  <span className="text-slate-900">{profile?.idCardIssuePlace || 'Cục Cảnh sát QLHC về TTXH'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã số thuế cá nhân:</span>
                  <span className="font-mono font-bold text-blue-700">{profile?.taxCode || 'Chưa cấp'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã số sổ BHXH:</span>
                  <span className="font-mono font-bold text-slate-900">{profile?.socialInsuranceNumber || 'Chưa cấp'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-600" />
                <span>Tài khoản ngân hàng & Liên hệ</span>
              </h4>
              <div className="space-y-2.5 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Số tài khoản:</span>
                  <span className="font-mono font-bold text-blue-700 text-sm">{profile?.bankAccountNumber || 'Chưa cung cấp'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngân hàng thụ hưởng:</span>
                  <span className="font-semibold text-slate-900">{profile?.bankName || 'Chưa cung cấp'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chi nhánh:</span>
                  <span className="text-slate-900">{profile?.bankBranch || 'Hà Nội'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số điện thoại:</span>
                  <span className="font-mono text-slate-900">{profile?.phone || 'Chưa cung cấp'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Địa chỉ thường trú:</span>
                  <span className="text-slate-900">{profile?.address || 'Hà Nội, Việt Nam'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTRACTS */}
        {activeTab === 'CONTRACTS' && (
          <div className="p-6 space-y-4">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-blue-600" />
              <span>Hợp đồng lao động đã ký kết ({profile?.contracts?.length || 0})</span>
            </h4>

            {profile?.contracts && profile.contracts.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-sm overflow-hidden bg-white text-xs">
                {profile.contracts.map((c: any) => (
                  <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-blue-700 text-sm">{c.contractNumber}</span>
                        {getContractTypeBadge(c.contractType)}
                        <span className="px-2 py-0.5 rounded-sm text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                          {c.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Thời hạn: <span className="font-mono text-slate-800 font-medium">{formatDate(c.startDate)}</span>
                        <span className="mx-1.5">→</span>
                        <span className="font-mono text-slate-800 font-medium">
                          {c.endDate ? formatDate(c.endDate) : <span className="text-emerald-700 font-semibold">Vô thời hạn</span>}
                        </span>
                        {c.workingTime && <span className="ml-2">• {c.workingTime}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Lương đóng BHXH</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{formatVND(c.salaryInsurance)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-sm text-slate-400 text-xs">
                Bạn chưa có hợp đồng lao động nào được ghi nhận trên hệ thống.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LEAVE & BALANCE */}
        {activeTab === 'LEAVE' && (
          <div className="p-6 space-y-6">
            {/* Balance Widgets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm">
                <span className="text-xs text-slate-500 font-medium block">Quỹ phép tiêu chuẩn</span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">{leaveBalance.totalStandard} ngày</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm">
                <span className="text-xs text-slate-500 font-medium block">Đã sử dụng</span>
                <span className="text-2xl font-bold text-blue-600 mt-1 block">{leaveBalance.usedDays} ngày</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm">
                <span className="text-xs text-slate-500 font-medium block">Đang chờ duyệt</span>
                <span className="text-2xl font-bold text-amber-600 mt-1 block">{leaveBalance.pendingDays} ngày</span>
              </div>
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-sm">
                <span className="text-xs text-emerald-800 font-medium block">Phép năm còn lại</span>
                <span className="text-2xl font-bold text-emerald-700 mt-1 block">{leaveBalance.remainingDays} ngày</span>
              </div>
            </div>

            {/* Leave Requests Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Lịch sử đơn xin nghỉ phép ({profile?.leaveRequests?.length || 0})</span>
                </h4>
                <button
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo đơn xin nghỉ</span>
                </button>
              </div>

              {profile?.leaveRequests && profile.leaveRequests.length > 0 ? (
                <div className="border border-slate-200 rounded-sm overflow-hidden bg-white text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                      <tr>
                        <th className="px-4 py-2.5">Loại nghỉ</th>
                        <th className="px-4 py-2.5">Thời gian nghỉ</th>
                        <th className="px-4 py-2.5">Lý do</th>
                        <th className="px-4 py-2.5 text-center">Trạng thái</th>
                        <th className="px-4 py-2.5">Phản hồi duyệt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {profile.leaveRequests.map((req: any) => (
                        <tr key={req.id} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {getLeaveTypeLabel(req.leaveType)}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-700">
                            {formatDate(req.startDate)} → {formatDate(req.endDate)}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{req.reason}</td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {getLeaveStatusBadge(req.status)}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-[11px]">
                            {req.reviewComment || (req.approvedBy ? `Duyệt bởi: ${req.approvedBy}` : '---')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-sm text-slate-400 text-xs">
                  Bạn chưa có đơn xin nghỉ phép nào.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PAYROLL & INCOME */}
        {activeTab === 'PAYROLL' && (
          <div className="p-6 space-y-6">
            {/* Income Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm">
                <span className="text-slate-400 block mb-1">Lương cơ bản tháng</span>
                <span className="text-xl font-mono font-bold text-slate-900">{formatVND(profile?.baseSalary || 0)}</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm">
                <span className="text-slate-400 block mb-1">Phụ cấp hàng tháng</span>
                <span className="text-xl font-mono font-bold text-slate-900">{formatVND(profile?.allowance || 0)}</span>
              </div>
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-sm">
                <span className="text-blue-900 font-medium block mb-1">Tổng thu nhập thoả thuận</span>
                <span className="text-xl font-mono font-extrabold text-blue-700">
                  {formatVND((profile?.baseSalary || 0) + (profile?.allowance || 0))}
                </span>
              </div>
            </div>

            {/* Pay Stubs History */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Lịch sử bảng lương các tháng ({profile?.payrolls?.length || 0})</span>
              </h4>

              {profile?.payrolls && profile.payrolls.length > 0 ? (
                <div className="border border-slate-200 rounded-sm overflow-hidden bg-white text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                      <tr>
                        <th className="px-4 py-2.5">Kỳ lương</th>
                        <th className="px-4 py-2.5 text-center">Ngày công</th>
                        <th className="px-4 py-2.5 text-right">Lương cơ bản</th>
                        <th className="px-4 py-2.5 text-right">Thực lĩnh</th>
                        <th className="px-4 py-2.5 text-center">Trạng thái</th>
                        <th className="px-4 py-2.5 text-right">Phiếu lương</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {profile.payrolls.map((p: any) => (
                        <tr
                          key={p.id}
                          onClick={() => {
                            setSelectedPayslipId(p.id);
                            setIsPayslipModalOpen(true);
                          }}
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            Tháng {p.month}/{p.year}
                          </td>
                          <td className="px-4 py-3 text-center font-mono">
                            {p.actualWorkDays}/{p.standardDays}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-700">
                            {formatVND(p.baseSalary)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-blue-700">
                            {formatVND(p.netSalary)}
                          </td>
                          <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                            {p.isPaid ? (
                              <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Đã thanh toán
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                Chưa thanh toán
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedPayslipId(p.id);
                                  setIsPayslipModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium text-xs transition-colors"
                                title="Xem phiếu lương điện tử chi tiết"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Chi tiết</span>
                              </button>
                              <button
                                onClick={() => handleDownloadPdf(p.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-xs transition-colors"
                                title="Tải phiếu lương PDF"
                              >
                                <Download className="w-3.5 h-3.5 text-blue-600" />
                                <span>PDF</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-sm text-slate-400 text-xs">
                  Chưa có dữ liệu bảng lương được ghi nhận.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: EDIT CONTACT & BANKING INFO */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Cập Nhật Thông Tin Liên Hệ & Tài Khoản Ngân Hàng"
      >
        <form onSubmit={handleSaveContactInfo} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Số Điện Thoại</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="0912345678"
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Địa Chỉ Thường Trú</label>
              <input
                type="text"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                placeholder="Số nhà, đường, quận/huyện..."
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Số Tài Khoản Ngân Hàng *</label>
              <input
                type="text"
                required
                value={editForm.bankAccountNumber}
                onChange={(e) => setEditForm({ ...editForm, bankAccountNumber: e.target.value })}
                placeholder="1023456789"
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 font-mono text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Tên Ngân Hàng *</label>
              <input
                type="text"
                required
                value={editForm.bankName}
                onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                placeholder="Vietcombank, MB..."
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Chi Nhánh</label>
              <input
                type="text"
                value={editForm.bankBranch}
                onChange={(e) => setEditForm({ ...editForm, bankBranch: e.target.value })}
                placeholder="Chi nhánh Ba Đình"
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-3.5 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="h-9 px-4 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={savingEdit}
              className="h-9 px-4 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-none disabled:opacity-50 transition-colors"
            >
              {savingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: CREATE LEAVE REQUEST */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Tạo Đơn Xin Nghỉ Phép"
      >
        <form onSubmit={handleCreateLeave} className="space-y-4 text-xs">
          {leaveMessage && (
            <div
              className={`p-3 rounded-sm flex items-center gap-2 ${
                leaveMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-700'
              }`}
            >
              {leaveMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{leaveMessage.text}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-medium mb-1">Loại Nghỉ Phép *</label>
            <select
              value={leaveForm.leaveType}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
              className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
            >
              <option value="ANNUAL">Nghỉ phép năm (Còn {leaveBalance.remainingDays} ngày - Hưởng 100% lương)</option>
              <option value="SICK">Nghỉ ốm đau (Hưởng chế độ BHXH)</option>
              <option value="COMPASSIONATE">Nghỉ việc riêng (Kết hôn, tang chế - Hưởng 100% lương)</option>
              <option value="MATERNITY">Nghỉ thai sản (Hưởng chế độ BHXH)</option>
              <option value="UNPAID">Nghỉ không hưởng lương</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Từ Ngày *</label>
              <input
                type="date"
                required
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Đến Ngày *</label>
              <input
                type="date"
                required
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Lý Do Nghỉ *</label>
            <textarea
              rows={3}
              required
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              placeholder="Nêu rõ lý do và kế hoạch bàn giao công việc..."
              className="w-full bg-white border border-slate-300 rounded-sm p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3.5 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="h-9 px-4 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submittingLeave}
              className="h-9 px-4 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-none disabled:opacity-50 transition-colors"
            >
              {submittingLeave ? 'Đang gửi...' : 'Nộp đơn nghỉ phép'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Payslip Modal */}
      <PayslipModal
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
        payrollId={selectedPayslipId}
      />
    </div>
  );
}
