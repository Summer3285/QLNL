'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import { EmployeeProfile, Department, Contract } from '../../../types';
import { formatVND, formatDate } from '../../../lib/utils';
import Modal from '../../../components/Modal';
import {
  Users,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  AlertTriangle,
  Crown,
  ShieldCheck,
  LayoutGrid,
  List,
  Building2,
  Calendar,
  ChevronRight,
  Briefcase,
  Star,
  Eye,
  FileSignature,
  CreditCard,
  Landmark,
  UserCheck,
  DollarSign,
  Award,
  Clock,
  MapPin,
  Sparkles,
  Info,
} from 'lucide-react';

export default function EmployeesPage() {
  const { isHR, isAdmin } = useAuth();
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('ALL');
  const [cadreFilter, setCadreFilter] = useState<'ALL' | 'CADRE' | 'STAFF'>('ALL');
  const [viewMode, setViewMode] = useState<'department' | 'table'>('table');

  // Detail Modal State (360-degree Employee Profile)
  const [selectedEmployeeDetail, setSelectedEmployeeDetail] = useState<EmployeeProfile | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailActiveTab, setDetailActiveTab] = useState<'WORK' | 'LEGAL' | 'CONTRACTS' | 'SALARY'>('WORK');

  // Modal Create/Edit State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeProfile | null>(null);
  const [editModalTab, setEditModalTab] = useState<'JOB' | 'LEGAL'>('JOB');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Helper: Profile Completeness Score (Industry Standard Core HR)
  const calculateProfileCompleteness = (emp: EmployeeProfile | null | undefined) => {
    if (!emp) return { percentage: 0, missing: [] };
    const missing: string[] = [];
    let score = 0;

    // 1. Basic Identity (30 pts)
    if (emp.fullName && (emp.user?.email || (emp as any).email) && emp.phone) {
      score += 30;
    } else {
      score += 15;
      if (!emp.phone) missing.push('Số điện thoại');
    }

    // 2. Organization & Job (25 pts)
    if (emp.position && (emp.departmentId || emp.department) && emp.baseSalary > 0) {
      score += 25;
    } else {
      score += 15;
    }

    // 3. Legal Identity (25 pts)
    if (emp.idCardNumber && emp.idCardNumber.trim().length >= 9) {
      score += 25;
    } else {
      missing.push('Số CCCD/CMND');
    }

    // 4. Banking & Tax (20 pts)
    if (emp.bankAccountNumber && emp.bankName) {
      score += 20;
    } else {
      missing.push('Tài khoản ngân hàng');
    }

    return { percentage: Math.min(100, score), missing };
  };

  const [formData, setFormData] = useState({
    email: '',
    passwordPlain: 'Emp@123',
    role: 'EMPLOYEE',
    employeeCode: '',
    fullName: '',
    phone: '',
    departmentId: '',
    department: 'Software Engineering',
    cadreType: 'STAFF',
    isCadre: false,
    appointmentDate: '',
    position: '',
    baseSalary: 25000000,
    allowance: 2000000,
    idCardNumber: '',
    idCardIssueDate: '',
    idCardIssuePlace: 'Cục Cảnh sát QLHC về TTXH',
    taxCode: '',
    socialInsuranceNumber: '',
    bankAccountNumber: '',
    bankName: 'Ngân hàng Ngoại Thương (Vietcombank)',
    bankBranch: 'Sở Giao Dịch Hà Nội',
    lineManagerId: '',
    annualLeaveBalance: 12,
  });

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/api/departments');
      if (res.success && res.data) {
        setDepartments(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách phòng ban:', err);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (selectedDeptId !== 'ALL') query.set('departmentId', selectedDeptId);
      if (cadreFilter === 'CADRE') query.set('isCadre', 'true');
      if (cadreFilter === 'STAFF') query.set('cadreType', 'STAFF');

      const res = await api.get(`/api/employees?${query.toString()}`);
      if (res.success) {
        setEmployees(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách nhân viên:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [selectedDeptId, cadreFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleViewDetail = async (empId: string) => {
    setDetailLoading(true);
    setDetailActiveTab('WORK');
    try {
      const res = await api.get(`/api/employees/${empId}`);
      if (res.success && res.data) {
        setSelectedEmployeeDetail(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải hồ sơ 360 độ:', err);
    } finally {
      setDetailLoading(false);
    }
  };

const getDeptCodePrefix = (dept?: { code?: string; name?: string }): string => {
  if (!dept) return 'ENG';
  const code = (dept.code || '').toUpperCase();
  const name = (dept.name || '').toUpperCase();
  if (code.includes('TECH') || code.includes('ENG') || name.includes('SOFTWARE') || name.includes('KỸ THUẬT')) return 'ENG';
  if (code.includes('AI') || name.includes('AI') || name.includes('DATA')) return 'AI';
  if (code.includes('PROD') || name.includes('PRODUCT') || name.includes('DESIGN') || name.includes('SẢN PHẨM')) return 'PRD';
  if (code.includes('HR') || name.includes('PEOPLE') || name.includes('NHÂN SỰ')) return 'HR';
  if (code.includes('FIN') || name.includes('FINANCE') || name.includes('TÀI CHÍNH') || name.includes('KẾ TOÁN')) return 'FIN';
  return 'ENG';
};

const generateNextEmployeeCode = (
  deptId: string,
  currentEmployees: EmployeeProfile[],
  depts: Department[]
): string => {
  const targetDept = depts.find((d) => d.id === deptId) || depts[0];
  const prefix = `NN-${getDeptCodePrefix(targetDept)}-`;

  let maxNum = 0;
  for (const emp of currentEmployees) {
    if (emp.employeeCode && emp.employeeCode.startsWith(prefix)) {
      const num = parseInt(emp.employeeCode.replace(prefix, ''), 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  const nextNum = maxNum + 1;
  return `${prefix}${String(nextNum).padStart(3, '0')}`;
};

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setEditModalTab('JOB');
    setFormError(null);
    setFormSuccess(null);

    const firstDept = departments[0];
    const initialDeptId = firstDept?.id || '';
    const initialDeptName = firstDept?.name || 'Software Engineering';
    const nextCode = generateNextEmployeeCode(initialDeptId, employees, departments);

    setFormData({
      email: '',
      passwordPlain: 'Emp@123',
      role: 'EMPLOYEE',
      employeeCode: nextCode,
      fullName: '',
      phone: '',
      departmentId: initialDeptId,
      department: initialDeptName,
      cadreType: 'STAFF',
      isCadre: false,
      appointmentDate: '',
      position: '',
      baseSalary: 25000000,
      allowance: 2000000,
      idCardNumber: '',
      idCardIssueDate: '',
      idCardIssuePlace: 'Cục Cảnh sát QLHC về TTXH',
      taxCode: '',
      socialInsuranceNumber: '',
      bankAccountNumber: '',
      bankName: 'Ngân hàng Ngoại Thương (Vietcombank)',
      bankBranch: 'Sở Giao Dịch Hà Nội',
      lineManagerId: '',
      annualLeaveBalance: 12,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (emp: EmployeeProfile, defaultTab: 'JOB' | 'LEGAL' = 'JOB') => {
    setEditingEmployee(emp);
    setEditModalTab(defaultTab);
    setFormError(null);
    setFormSuccess(null);
    setFormData({
      email: emp.user?.email || '',
      passwordPlain: '',
      role: (emp.user?.role as any) || 'EMPLOYEE',
      employeeCode: emp.employeeCode,
      fullName: emp.fullName,
      phone: emp.phone || '',
      departmentId: emp.departmentId || '',
      department: emp.department,
      cadreType: emp.cadreType || (emp.isCadre ? 'LEADERSHIP' : 'STAFF'),
      isCadre: Boolean(emp.isCadre),
      appointmentDate: emp.appointmentFormatted || '',
      position: emp.position,
      baseSalary: emp.baseSalary,
      allowance: emp.allowance || 0,
      idCardNumber: emp.idCardNumber || '',
      idCardIssueDate: emp.idCardIssueDate ? emp.idCardIssueDate.split('T')[0] : '',
      idCardIssuePlace: emp.idCardIssuePlace || 'Cục Cảnh sát QLHC về TTXH',
      taxCode: emp.taxCode || '',
      socialInsuranceNumber: emp.socialInsuranceNumber || '',
      bankAccountNumber: emp.bankAccountNumber || '',
      bankName: emp.bankName || 'Ngân hàng Ngoại Thương (Vietcombank)',
      bankBranch: emp.bankBranch || 'Sở Giao Dịch Hà Nội',
      lineManagerId: emp.lineManagerId || '',
      annualLeaveBalance: emp.annualLeaveBalance ?? 12,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    try {
      const selectedDept = departments.find((d) => d.id === formData.departmentId);
      const payload = {
        ...formData,
        department: selectedDept ? selectedDept.name : formData.department,
        baseSalary: Number(formData.baseSalary),
        allowance: Number(formData.allowance),
        isCadre: formData.cadreType !== 'STAFF',
        annualLeaveBalance: Number(formData.annualLeaveBalance),
      };

      if (editingEmployee) {
        const res = await api.put(`/api/employees/${editingEmployee.id}`, payload);
        if (res.success) {
          setFormSuccess('Cập nhật hồ sơ nhân sự thành công!');
          fetchEmployees();
          if (selectedEmployeeDetail?.id === editingEmployee.id) {
            handleViewDetail(editingEmployee.id);
          }
          setTimeout(() => setIsAddModalOpen(false), 800);
        }
      } else {
        const res = await api.post('/api/employees', payload);
        if (res.success) {
          setFormSuccess('Tạo mới hồ sơ nhân sự thành công!');
          fetchEmployees();
          setTimeout(() => setIsAddModalOpen(false), 800);
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Lỗi khi lưu thông tin nhân viên.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa nhân sự "${name}" khỏi hệ thống?`)) return;
    try {
      const res = await api.delete(`/api/employees/${id}`);
      if (res.success) {
        setEmployees(employees.filter((emp) => emp.id !== id));
        if (selectedEmployeeDetail?.id === id) setSelectedEmployeeDetail(null);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa nhân sự.');
    }
  };

  const getCadreBadge = (cadreType?: string, isCadre?: boolean) => {
    if (cadreType === 'LEADERSHIP') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
          <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Lãnh đạo</span>
        </span>
      );
    }
    if (cadreType === 'MANAGEMENT' || isCadre) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Quản lý</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
        <span>Nhân viên</span>
      </span>
    );
  };

  const getContractBadge = (contractType?: string) => {
    switch (contractType) {
      case 'INDEFINITE':
        return <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Không thời hạn</span>;
      case 'DEFINITE_3Y':
        return <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Xác định 3 năm</span>;
      case 'DEFINITE_1Y':
        return <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">Xác định 1 năm</span>;
      case 'PROBATION':
        return <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">Thử việc</span>;
      default:
        return <span className="px-2 py-0.5 rounded-sm text-[10px] font-medium bg-slate-100 text-slate-700">{contractType || 'Chưa ký HĐ'}</span>;
    }
  };

  // Group employees by department for Department View
  const groupedDepartments = departments.map((d) => {
    const deptEmps = employees.filter(
      (e) => (e.departmentId && e.departmentId === d.id) || e.department === d.name
    );
    const leadership = deptEmps.filter((e) => e.isCadre || e.cadreType !== 'STAFF');
    const staff = deptEmps.filter((e) => !e.isCadre && e.cadreType === 'STAFF');
    return {
      department: d,
      employees: deptEmps,
      leadership,
      staff,
    };
  }).filter((g) => selectedDeptId === 'ALL' || g.department.id === selectedDeptId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Hồ sơ nhân sự
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản trị thông tin cán bộ, phân bổ phòng ban và chức danh
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-0.5 rounded-sm flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 h-8 rounded-sm text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-none'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Danh sách</span>
            </button>
            <button
              onClick={() => setViewMode('department')}
              className={`flex items-center gap-1.5 px-3 h-8 rounded-sm text-xs font-medium transition-colors ${
                viewMode === 'department'
                  ? 'bg-white text-blue-700 shadow-none'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Phòng ban</span>
            </button>
          </div>

          {isHR && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-none"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm nhân sự</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-none">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, mã NV, chức vụ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 bg-slate-50 border border-slate-200 rounded-sm pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 font-medium">Phòng ban:</span>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="h-9 bg-slate-50 border border-slate-200 rounded-sm px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Tất cả phòng ban ({departments.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Cadre Filter */}
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 font-medium">Cấp bậc:</span>
            <select
              value={cadreFilter}
              onChange={(e) => setCadreFilter(e.target.value as any)}
              className="h-9 bg-slate-50 border border-slate-200 rounded-sm px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Tất cả cấp bậc</option>
              <option value="CADRE">Chỉ Cán bộ / Lãnh đạo</option>
              <option value="STAFF">Chỉ Nhân viên chuyên môn</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: FLAT TABLE VIEW (RECOMMENDED FOR B2B SAAS) */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="px-5 py-3">Mã & Họ tên</th>
                  <th className="px-5 py-3">Phòng ban</th>
                  <th className="px-5 py-3">Chức vụ & Cấp bậc</th>
                  <th className="px-5 py-3">Hồ sơ</th>
                  <th className="px-5 py-3">Liên hệ</th>
                  <th className="px-5 py-3 text-right">Lương cơ bản</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      Không tìm thấy nhân viên nào phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => {
                    const comp = calculateProfileCompleteness(emp);
                    return (
                      <tr
                        key={emp.id}
                        onClick={() => handleViewDetail(emp.id)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {emp.fullName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{emp.fullName}</div>
                              <div className="text-[10px] font-mono text-blue-600">{emp.employeeCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-800">
                          {emp.departmentRef?.name || emp.department}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-slate-900">{emp.position}</div>
                          <div className="mt-1">{getCadreBadge(emp.cadreType, emp.isCadre)}</div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <div className="w-14 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  comp.percentage === 100
                                    ? 'bg-emerald-500'
                                    : comp.percentage >= 60
                                    ? 'bg-blue-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${comp.percentage}%` }}
                              />
                            </div>
                            <span
                              className={`text-[10px] font-mono font-bold ${
                                comp.percentage === 100
                                  ? 'text-emerald-600'
                                  : comp.percentage >= 60
                                  ? 'text-blue-600'
                                  : 'text-amber-700'
                              }`}
                            >
                              {comp.percentage}%
                            </span>
                          </div>
                          {comp.missing.length > 0 ? (
                            <div
                              className="text-[10px] text-amber-700/80 mt-0.5 truncate max-w-[130px]"
                              title={`Chưa có: ${comp.missing.join(', ')}`}
                            >
                              Thiếu: {comp.missing[0]}
                            </div>
                          ) : (
                            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Đầy đủ</div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="font-mono text-slate-900 text-xs font-medium">{emp.phone || '---'}</div>
                          <div className="text-[11px] text-slate-500 font-normal truncate max-w-[170px]">
                            {emp.email || emp.user?.email || '---'}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {formatVND(emp.baseSalary)}
                        </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleViewDetail(emp.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                            title="Hồ sơ 360 độ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isHR && (
                            <button
                              onClick={() => handleOpenEditModal(emp)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteEmployee(emp.id, emp.fullName)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors"
                              title="Xóa nhân sự"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
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

      {/* VIEW 2: DEPARTMENT GROUPED VIEW */}
      {viewMode === 'department' && (
        <div className="space-y-6">
          {groupedDepartments.map(({ department: dept, employees: deptEmps, leadership, staff }) => (
            <div
              key={dept.id}
              className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-none space-y-4"
            >
              {/* Department Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {dept.code}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{dept.name}</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Trưởng phòng: <span className="font-semibold text-slate-800">{dept.manager?.fullName || 'Chưa chỉ định'}</span> | {dept.location || 'Hà Nội'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-sm bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px]">
                    {leadership.length} Cán bộ
                  </span>
                  <span className="px-2.5 py-1 rounded-sm bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[11px]">
                    {staff.length} Nhân viên
                  </span>
                </div>
              </div>

              {/* Employees List in Department */}
              <div className="p-4 space-y-3">
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-sm overflow-hidden bg-white">
                  {deptEmps.map((emp) => (
                    <div
                      key={emp.id}
                      onClick={() => handleViewDetail(emp.id)}
                      className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {emp.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                            <span>{emp.fullName}</span>
                            {getCadreBadge(emp.cadreType, emp.isCadre)}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {emp.position} • Mã: <span className="font-mono text-blue-600 font-medium">{emp.employeeCode}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-right hidden sm:block">
                          <span className="text-[10px] text-slate-400 block">Lương cơ bản</span>
                          <span className="font-mono font-bold text-slate-900">{formatVND(emp.baseSalary)}</span>
                        </div>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleViewDetail(emp.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                            title="Hồ sơ 360 độ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isHR && (
                            <button
                              onClick={() => handleOpenEditModal(emp)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                              title="Sửa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: 360-DEGREE FULL EMPLOYEE PROFILE */}
      <Modal
        isOpen={Boolean(selectedEmployeeDetail)}
        onClose={() => setSelectedEmployeeDetail(null)}
        title={`Hồ Sơ Nhân Sự 360° - ${selectedEmployeeDetail?.fullName} (${selectedEmployeeDetail?.employeeCode})`}
      >
        <div className="space-y-5 text-xs max-h-[80vh] overflow-y-auto pr-1">
          {/* Header Banner */}
          <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center shrink-0">
                {selectedEmployeeDetail?.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{selectedEmployeeDetail?.fullName}</h3>
                  {getCadreBadge(selectedEmployeeDetail?.cadreType, selectedEmployeeDetail?.isCadre)}
                </div>
                <div className="text-slate-500 mt-0.5 flex flex-wrap items-center gap-3">
                  <span className="font-mono text-blue-700 font-semibold">{selectedEmployeeDetail?.employeeCode}</span>
                  <span>•</span>
                  <span>{selectedEmployeeDetail?.position}</span>
                  <span>•</span>
                  <span>{selectedEmployeeDetail?.departmentRef?.name || selectedEmployeeDetail?.department}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Email liên hệ</span>
              <span className="font-mono text-slate-800">{selectedEmployeeDetail?.email || selectedEmployeeDetail?.user?.email}</span>
            </div>
          </div>

          {/* Profile Completeness Assessment */}
          {(() => {
            const comp = calculateProfileCompleteness(selectedEmployeeDetail);
            return (
              <div className="p-3.5 bg-white border border-slate-200 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-none">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs font-mono shrink-0 border ${
                      comp.percentage === 100
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : comp.percentage >= 60
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {comp.percentage}%
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">Mức độ hoàn thiện hồ sơ</span>
                      {comp.percentage === 100 ? (
                        <span className="px-1.5 py-0.2 rounded-sm text-[10px] bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                          Đầy đủ 100%
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded-sm text-[10px] bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                          Cần bổ sung ({comp.missing.length} mục)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {comp.missing.length > 0 ? (
                        <span>
                          Chưa cập nhật:{' '}
                          <span className="font-semibold text-amber-700">{comp.missing.join(', ')}</span>
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">
                          Hồ sơ đã đầy đủ thông tin công việc, định danh pháp lý và tài khoản ngân hàng.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {comp.percentage < 100 && isHR && (
                  <button
                    onClick={() => {
                      const emp = selectedEmployeeDetail;
                      setSelectedEmployeeDetail(null);
                      if (emp) handleOpenEditModal(emp, 'LEGAL');
                    }}
                    className="px-3 py-1.5 rounded-sm bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors shrink-0 self-start sm:self-auto"
                  >
                    Bổ sung ngay
                  </button>
                )}
              </div>
            );
          })()}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200">
            <button
              onClick={() => setDetailActiveTab('WORK')}
              className={`px-3.5 py-2 font-medium text-xs border-b-2 transition-colors ${
                detailActiveTab === 'WORK'
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Công việc & Tổ chức
            </button>
            <button
              onClick={() => setDetailActiveTab('LEGAL')}
              className={`px-3.5 py-2 font-medium text-xs border-b-2 transition-colors ${
                detailActiveTab === 'LEGAL'
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Định danh & Ngân hàng
            </button>
            <button
              onClick={() => setDetailActiveTab('CONTRACTS')}
              className={`px-3.5 py-2 font-medium text-xs border-b-2 transition-colors ${
                detailActiveTab === 'CONTRACTS'
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Hợp đồng lao động ({selectedEmployeeDetail?.contracts?.length || 0})
            </button>
            <button
              onClick={() => setDetailActiveTab('SALARY')}
              className={`px-3.5 py-2 font-medium text-xs border-b-2 transition-colors ${
                detailActiveTab === 'SALARY'
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Lương & Phép năm
            </button>
          </div>

          {/* TAB 1: WORK & ORGANIZATION */}
          {detailActiveTab === 'WORK' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-sm space-y-2.5">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>Vị trí & Cơ cấu tổ chức</span>
                </h4>
                <div className="space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phòng ban:</span>
                    <span className="font-semibold text-slate-900">{selectedEmployeeDetail?.departmentRef?.name || selectedEmployeeDetail?.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chức vụ:</span>
                    <span className="font-semibold text-slate-900">{selectedEmployeeDetail?.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phân loại cấp bậc:</span>
                    <span>{getCadreBadge(selectedEmployeeDetail?.cadreType, selectedEmployeeDetail?.isCadre)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quản lý trực tiếp (Line Manager):</span>
                    <span className="font-semibold text-blue-700">
                      {selectedEmployeeDetail?.lineManager ? `${selectedEmployeeDetail.lineManager.fullName} (${selectedEmployeeDetail.lineManager.position})` : 'Ban Điều Hành'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-sm space-y-2.5">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Thâm niên & Bổ nhiệm</span>
                </h4>
                <div className="space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ngày gia nhập công ty:</span>
                    <span className="font-mono text-slate-900 font-medium">
                      {selectedEmployeeDetail?.joinDate ? formatDate(selectedEmployeeDetail.joinDate) : '---'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ngày bổ nhiệm chức vụ:</span>
                    <span className="font-mono text-slate-900 font-medium">
                      {selectedEmployeeDetail?.appointmentDate ? formatDate(selectedEmployeeDetail.appointmentDate) : 'Theo ngày tiếp nhận'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Địa điểm làm việc:</span>
                    <span className="text-slate-900">{selectedEmployeeDetail?.departmentRef?.location || 'Tòa nhà NexNova, Hà Nội'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số điện thoại:</span>
                    <span className="font-mono text-slate-900">{selectedEmployeeDetail?.phone || 'Chưa cung cấp'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEGAL & BANKING */}
          {detailActiveTab === 'LEGAL' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-sm space-y-2.5">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Định danh pháp lý cá nhân</span>
                </h4>
                <div className="space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số CCCD / CMND:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedEmployeeDetail?.idCardNumber || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ngày cấp:</span>
                    <span className="font-mono text-slate-900">{selectedEmployeeDetail?.idCardIssueDate ? formatDate(selectedEmployeeDetail.idCardIssueDate) : '---'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nơi cấp:</span>
                    <span className="text-slate-900">{selectedEmployeeDetail?.idCardIssuePlace || 'Cục Cảnh sát QLHC về TTXH'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mã số thuế cá nhân (MST):</span>
                    <span className="font-mono font-semibold text-blue-700">{selectedEmployeeDetail?.taxCode || 'Chưa cấp'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mã số sổ BHXH:</span>
                    <span className="font-mono font-semibold text-slate-900">{selectedEmployeeDetail?.socialInsuranceNumber || 'Chưa cấp'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-sm space-y-2.5">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-emerald-600" />
                  <span>Thông tin tài khoản ngân hàng</span>
                </h4>
                <div className="space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số tài khoản ngân hàng:</span>
                    <span className="font-mono font-bold text-blue-700 text-sm">{selectedEmployeeDetail?.bankAccountNumber || 'Chưa cung cấp'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tên ngân hàng:</span>
                    <span className="font-semibold text-slate-900">{selectedEmployeeDetail?.bankName || 'Chưa cung cấp'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chi nhánh:</span>
                    <span className="text-slate-900">{selectedEmployeeDetail?.bankBranch || 'Hà Nội'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Địa chỉ thường trú:</span>
                    <span className="text-slate-900">{selectedEmployeeDetail?.address || 'Hà Nội, Việt Nam'}</span>
                  </div>
                </div>
              </div>

              {isHR && (
                <div className="col-span-1 md:col-span-2 pt-1 flex justify-end">
                  <button
                    onClick={() => {
                      const emp = selectedEmployeeDetail;
                      setSelectedEmployeeDetail(null);
                      if (emp) handleOpenEditModal(emp, 'LEGAL');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Cập nhật thông tin định danh & tài khoản ngân hàng</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONTRACTS */}
          {detailActiveTab === 'CONTRACTS' && (
            <div className="space-y-3">
              {selectedEmployeeDetail?.contracts && selectedEmployeeDetail.contracts.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-sm overflow-hidden bg-white">
                  {selectedEmployeeDetail.contracts.map((c) => (
                    <div key={c.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-700 text-xs">{c.contractNumber}</span>
                          {getContractBadge(c.contractType)}
                          <span className="px-2 py-0.5 rounded-sm text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                            {c.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Hiệu lực: <span className="font-mono text-slate-800 font-medium">{formatDate(c.startDate)}</span>
                          <span className="mx-1">→</span>
                          <span className="font-mono text-slate-800 font-medium">{c.endDate ? formatDate(c.endDate) : 'Vô thời hạn'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Lương đóng BHXH</span>
                        <span className="font-mono font-bold text-slate-900">{formatVND(c.salaryInsurance)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-sm text-slate-400">
                  Nhân sự này hiện chưa có hợp đồng lao động nào được ghi nhận.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SALARY & LEAVE */}
          {detailActiveTab === 'SALARY' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-sm space-y-2.5">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Thu nhập hiện tại</span>
                </h4>
                <div className="space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lương cơ bản tháng:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{formatVND(selectedEmployeeDetail?.baseSalary || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phụ cấp chức vụ / trách nhiệm:</span>
                    <span className="font-mono font-semibold text-slate-800">{formatVND(selectedEmployeeDetail?.allowance || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2">
                    <span className="text-slate-900 font-medium">Tổng thu nhập thoả thuận:</span>
                    <span className="font-mono font-extrabold text-blue-700 text-sm">
                      {formatVND((selectedEmployeeDetail?.baseSalary || 0) + (selectedEmployeeDetail?.allowance || 0))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-sm space-y-2.5">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Quỹ phép năm</span>
                </h4>
                <div className="space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quỹ phép năm tiêu chuẩn:</span>
                    <span className="font-bold text-slate-900">12 ngày/năm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số ngày phép năm còn lại:</span>
                    <span className="font-bold text-emerald-600 text-sm">{selectedEmployeeDetail?.annualLeaveBalance ?? 12} ngày</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
            {isHR && (
              <button
                onClick={() => {
                  setSelectedEmployeeDetail(null);
                  if (selectedEmployeeDetail) handleOpenEditModal(selectedEmployeeDetail);
                }}
                className="px-4 py-2 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors"
              >
                Chỉnh sửa hồ sơ
              </button>
            )}
            <button
              onClick={() => setSelectedEmployeeDetail(null)}
              className="px-4 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: ADD / EDIT EMPLOYEE */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingEmployee ? `Cập Nhật Hồ Sơ - ${editingEmployee.fullName}` : 'Khởi Tạo Nhân Sự Mới (Quick Onboarding)'}
      >
        <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs max-h-[80vh] overflow-y-auto pr-1">
          {formError && (
            <div className="p-3 rounded-sm bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          {/* If Creating: Show Onboarding Notice Banner */}
          {!editingEmployee ? (
            <div className="p-3 bg-blue-50/80 border border-blue-200/90 rounded-sm text-blue-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold">Quy trình Onboarding tinh gọn:</span> Bạn chỉ cần nhập các thông tin công việc cơ bản để cấp tài khoản và bố trí vị trí. Thông tin CCCD/CMND, Mã số thuế và Tài khoản ngân hàng sẽ được hoàn thiện sau khi ký hợp đồng hoặc do nhân sự tự cập nhật qua cổng tự phục vụ (ESS).
              </div>
            </div>
          ) : (
            /* If Editing: Show Sub-Tabs */
            <div className="flex items-center gap-1 border-b border-slate-200 mb-2">
              <button
                type="button"
                onClick={() => setEditModalTab('JOB')}
                className={`px-3 py-2 font-medium text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
                  editModalTab === 'JOB'
                    ? 'border-blue-600 text-blue-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Vị trí & Đãi ngộ</span>
              </button>
              <button
                type="button"
                onClick={() => setEditModalTab('LEGAL')}
                className={`px-3 py-2 font-medium text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
                  editModalTab === 'LEGAL'
                    ? 'border-blue-600 text-blue-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pháp lý & Tài chính</span>
              </button>
            </div>
          )}

          {/* TAB 1 (JOB & ORGANIZATION) - Shown on Create OR when editModalTab === 'JOB' */}
          {(!editingEmployee || editModalTab === 'JOB') && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Mã Nhân Viên *</label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingEmployee)}
                    placeholder="VD: NN-EMP-022"
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value.toUpperCase() })}
                    className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 font-mono focus:outline-none focus:border-blue-500 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Họ và Tên *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Email Công Ty *</label>
                  <input
                    type="email"
                    required
                    disabled={Boolean(editingEmployee)}
                    placeholder="a.nguyen@nexnova.tech"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    placeholder="0912345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Department and Cadre Classification */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-sm border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Phòng Ban Trực Thuộc *</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => {
                      const newDeptId = e.target.value;
                      const matchedDept = departments.find((d) => d.id === newDeptId);
                      const updated: any = {
                        ...formData,
                        departmentId: newDeptId,
                        department: matchedDept?.name || formData.department,
                      };
                      if (!editingEmployee) {
                        updated.employeeCode = generateNextEmployeeCode(newDeptId, employees, departments);
                      }
                      setFormData(updated);
                    }}
                    className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Phân loại Cấp bậc *</label>
                  <select
                    value={formData.cadreType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cadreType: e.target.value,
                        isCadre: e.target.value !== 'STAFF',
                      })
                    }
                    className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="STAFF">Nhân Viên Chuyên Môn</option>
                    <option value="MANAGEMENT">Cán Bộ Quản Lý (Trưởng nhóm / PM)</option>
                    <option value="LEADERSHIP">Cán Bộ Lãnh Đạo (Trưởng/Phó Phòng)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Chức Danh Chuyên Môn *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Senior Backend Engineer"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Quản lý trực tiếp (Line Manager)</label>
                  <select
                    value={formData.lineManagerId}
                    onChange={(e) => setFormData({ ...formData, lineManagerId: e.target.value })}
                    className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Ban Tổng Giám Đốc --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.employeeCode}) - {emp.position}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Lương cơ bản (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                    className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Phụ cấp (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.allowance}
                    onChange={(e) => setFormData({ ...formData, allowance: Number(e.target.value) })}
                    className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Quỹ phép năm (ngày)</label>
                  <input
                    type="number"
                    value={formData.annualLeaveBalance}
                    onChange={(e) => setFormData({ ...formData, annualLeaveBalance: Number(e.target.value) })}
                    className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2 (LEGAL & FINANCIAL) - Shown ONLY when Editing AND editModalTab === 'LEGAL' */}
          {editingEmployee && editModalTab === 'LEGAL' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  Thông tin định danh pháp lý và ngân hàng được dùng để xuất Hợp đồng lao động, đóng Bảo hiểm xã hội và chi trả bảng lương hàng tháng.
                </div>
              </div>

              {/* Legal Identity Section */}
              <div className="space-y-3">
                <h5 className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Thông tin định danh cá nhân</span>
                </h5>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Số CCCD / CMND</label>
                    <input
                      type="text"
                      placeholder="001098000123"
                      value={formData.idCardNumber}
                      onChange={(e) => setFormData({ ...formData, idCardNumber: e.target.value })}
                      className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Ngày cấp CCCD</label>
                    <input
                      type="date"
                      value={formData.idCardIssueDate}
                      onChange={(e) => setFormData({ ...formData, idCardIssueDate: e.target.value })}
                      className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Nơi cấp CCCD</label>
                    <input
                      type="text"
                      placeholder="Cục Cảnh sát QLHC về TTXH"
                      value={formData.idCardIssuePlace}
                      onChange={(e) => setFormData({ ...formData, idCardIssuePlace: e.target.value })}
                      className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Mã số thuế cá nhân (MST)</label>
                    <input
                      type="text"
                      placeholder="8345678901"
                      value={formData.taxCode}
                      onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                      className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Mã số sổ BHXH</label>
                    <input
                      type="text"
                      placeholder="0123456789"
                      value={formData.socialInsuranceNumber}
                      onChange={(e) => setFormData({ ...formData, socialInsuranceNumber: e.target.value })}
                      className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Banking Details */}
              <div className="space-y-3 pt-2">
                <h5 className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <Landmark className="w-4 h-4 text-emerald-600" />
                  <span>Tài khoản ngân hàng chi trả lương</span>
                </h5>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Số tài khoản</label>
                    <input
                      type="text"
                      placeholder="1023456789"
                      value={formData.bankAccountNumber}
                      onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                      className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Tên ngân hàng</label>
                    <input
                      type="text"
                      placeholder="Vietcombank, MB, Techcombank..."
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Chi nhánh</label>
                    <input
                      type="text"
                      placeholder="Sở Giao Dịch Hà Nội"
                      value={formData.bankBranch}
                      onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                      className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-3.5 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="h-9 px-4 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-9 px-5 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-none disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Đang lưu...' : editingEmployee ? 'Cập Nhật Hồ Sơ' : 'Khởi Tạo Nhân Sự'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
