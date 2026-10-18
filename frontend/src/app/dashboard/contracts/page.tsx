'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import { Contract, EmployeeProfile } from '../../../types';
import { formatVND, formatDate } from '../../../lib/utils';
import Modal from '../../../components/Modal';
import {
  FileSignature,
  Plus,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Briefcase,
  Building2,
  DollarSign,
  Edit2,
  Trash2,
  Eye,
  ShieldCheck,
  FileText,
  UserCheck,
  Download,
} from 'lucide-react';

export default function ContractsPage() {
  const { isHR, isAdmin } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    probation: 0,
    indefinite: 0,
    expiringSoon: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'EXPIRING'>('ALL');

  // Modals
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    contractNumber: '',
    employeeId: '',
    contractType: 'DEFINITE_1Y',
    jobTitle: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    signedDate: new Date().toISOString().split('T')[0],
    salaryInsurance: 20000000,
    status: 'ACTIVE',
    workingTime: 'Toàn thời gian (40h/tuần)',
    note: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contractsRes, statsRes, empsRes] = await Promise.all([
        api.get('/api/contracts'),
        api.get('/api/contracts/stats'),
        api.get('/api/employees'),
      ]);

      if (contractsRes.success && contractsRes.data) {
        setContracts(contractsRes.data);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (empsRes.success && empsRes.data) {
        setEmployees(empsRes.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu hợp đồng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredContracts = contracts.filter((c) => {
    if (activeTab === 'EXPIRING' && !c.isExpiringSoon) return false;
    if (typeFilter !== 'ALL' && c.contractType !== typeFilter) return false;
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;

    if (search.trim()) {
      const term = search.toLowerCase();
      const matchNum = c.contractNumber.toLowerCase().includes(term);
      const matchName = c.employee?.fullName.toLowerCase().includes(term);
      const matchCode = c.employee?.employeeCode.toLowerCase().includes(term);
      const matchDept = c.employee?.department?.toLowerCase().includes(term);
      return matchNum || matchName || matchCode || matchDept;
    }
    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingContract(null);
    const nextSeq = String(contracts.length + 1).padStart(3, '0');
    const firstEmp = employees[0];
    setFormData({
      contractNumber: `HĐLĐ-2026/${nextSeq}`,
      employeeId: firstEmp?.id || '',
      contractType: 'DEFINITE_1Y',
      jobTitle: firstEmp?.position || '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      signedDate: new Date().toISOString().split('T')[0],
      salaryInsurance: firstEmp ? Math.round(firstEmp.baseSalary * 0.8) : 20000000,
      status: 'ACTIVE',
      workingTime: 'Toàn thời gian (40h/tuần)',
      note: '',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (c: Contract) => {
    setEditingContract(c);
    setFormData({
      contractNumber: c.contractNumber,
      employeeId: c.employeeId,
      contractType: c.contractType,
      jobTitle: c.jobTitle || c.employee?.position || '',
      startDate: c.startDate ? c.startDate.split('T')[0] : '',
      endDate: c.endDate ? c.endDate.split('T')[0] : '',
      signedDate: c.signedDate ? c.signedDate.split('T')[0] : '',
      salaryInsurance: c.salaryInsurance,
      status: c.status,
      workingTime: c.workingTime || 'Toàn thời gian (40h/tuần)',
      note: c.note || '',
    });
    setIsFormModalOpen(true);
  };

  const handleSaveContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        endDate: formData.contractType === 'INDEFINITE' ? null : formData.endDate,
      };

      if (editingContract) {
        const res = await api.put(`/api/contracts/${editingContract.id}`, payload);
        if (res.success) {
          setIsFormModalOpen(false);
          fetchData();
        }
      } else {
        const res = await api.post('/api/contracts', payload);
        if (res.success) {
          setIsFormModalOpen(false);
          fetchData();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu hợp đồng lao động.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContract = async (id: string, num: string) => {
    if (!confirm(`Bạn có chắc muốn xóa hợp đồng ${num}?`)) return;
    try {
      const res = await api.delete(`/api/contracts/${id}`);
      if (res.success) {
        fetchData();
        if (selectedContract?.id === id) setSelectedContract(null);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa hợp đồng.');
    }
  };

  const getContractTypeBadge = (type: string) => {
    switch (type) {
      case 'INDEFINITE':
        return (
          <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Không thời hạn
          </span>
        );
      case 'DEFINITE_3Y':
        return (
          <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Có thời hạn 3 năm
          </span>
        );
      case 'DEFINITE_1Y':
        return (
          <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            Có thời hạn 1 năm
          </span>
        );
      case 'PROBATION':
        return (
          <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Thử việc (2 tháng)
          </span>
        );
      case 'SEASONAL':
        return (
          <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Thời vụ / CTV
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {type}
          </span>
        );
    }
  };

  const getStatusBadge = (c: Contract) => {
    if (c.status === 'EXPIRED') {
      return (
        <span className="px-2 py-0.5 rounded-sm text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
          Đã hết hạn
        </span>
      );
    }
    if (c.status === 'TERMINATED') {
      return (
        <span className="px-2 py-0.5 rounded-sm text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          Đã chấm dứt
        </span>
      );
    }
    if (c.isExpiringSoon) {
      return (
        <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
          <span>Còn {c.daysRemaining} ngày</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-sm text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
        <span>Hiệu lực</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Hợp đồng lao động
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản trị thời hạn ký kết, loại hợp đồng và căn cứ tham gia bảo hiểm
          </p>
        </div>

        {isHR && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-none shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Ký hợp đồng mới</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-sm p-4 shadow-none">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-500">Tổng hợp đồng</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-sm p-4 shadow-none">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-500">Đang hiệu lực</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-sm p-4 shadow-none">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-500">Không thời hạn</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.indefinite}</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-sm p-4 shadow-none">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-500">Sắp hết hạn (&lt; 30 ngày)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className={`text-2xl font-bold mt-1 ${stats.expiringSoon > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {stats.expiringSoon}
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-3 shadow-none">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Quick tab toggle */}
          <div className="bg-slate-100 p-0.5 rounded-sm flex items-center gap-1 border border-slate-200 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex-1 md:flex-none px-3.5 h-8 rounded-sm text-xs font-medium transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-white text-blue-700 shadow-none'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả hợp đồng ({contracts.length})
            </button>
            <button
              onClick={() => setActiveTab('EXPIRING')}
              className={`flex-1 md:flex-none px-3.5 h-8 rounded-sm text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'EXPIRING'
                  ? 'bg-white text-amber-800 shadow-none font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Cảnh báo hết hạn ({stats.expiringSoon})</span>
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Đang hiển thị: <span className="font-bold text-slate-900">{filteredContracts.length}</span> hợp đồng
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 pt-2 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Tìm theo số HĐ, họ tên, mã nhân viên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 bg-slate-50 border border-slate-200 rounded-sm pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-500 shrink-0">Loại HĐ:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 bg-slate-50 border border-slate-200 rounded-sm px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 w-full md:w-44"
            >
              <option value="ALL">Tất cả loại HĐ</option>
              <option value="INDEFINITE">Không thời hạn</option>
              <option value="DEFINITE_3Y">Có thời hạn 3 năm</option>
              <option value="DEFINITE_1Y">Có thời hạn 1 năm</option>
              <option value="PROBATION">Thử việc (2 tháng)</option>
              <option value="SEASONAL">Thời vụ / CTV</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-500 shrink-0">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 bg-slate-50 border border-slate-200 rounded-sm px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 w-full md:w-36"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hiệu lực</option>
              <option value="EXPIRED">Đã hết hạn</option>
              <option value="TERMINATED">Đã chấm dứt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3">Số HĐ</th>
                <th className="px-5 py-3">Nhân sự</th>
                <th className="px-5 py-3">Phòng ban & Chức vụ</th>
                <th className="px-5 py-3">Loại hợp đồng</th>
                <th className="px-5 py-3">Thời hạn</th>
                <th className="px-5 py-3 text-right">Lương đóng BH</th>
                <th className="px-5 py-3 text-center">Trạng thái</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContracts.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedContract(c)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {c.contractNumber}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold flex items-center justify-center text-xs shrink-0">
                        {c.employee?.fullName.slice(0, 2).toUpperCase() || 'NV'}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{c.employee?.fullName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{c.employee?.employeeCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-800">{c.employee?.department}</div>
                    <div className="text-[11px] text-slate-400">{c.jobTitle || c.employee?.position}</div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {getContractTypeBadge(c.contractType)}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="font-mono text-slate-800">
                      {formatDate(c.startDate)}
                      <span className="text-slate-400 mx-1">→</span>
                      {c.endDate ? formatDate(c.endDate) : <span className="text-emerald-700 font-semibold">Vô thời hạn</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                    {formatVND(c.salaryInsurance)}
                  </td>
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    {getStatusBadge(c)}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedContract(c)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                        title="Xem hợp đồng"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {isHR && (
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteContract(c.id, c.contractNumber)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors"
                          title="Xóa hợp đồng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                    Không tìm thấy hợp đồng lao động nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: VIEW CONTRACT DETAIL */}
      <Modal
        isOpen={Boolean(selectedContract)}
        onClose={() => setSelectedContract(null)}
        title={`Chi Tiết Hợp Đồng Lao Động - ${selectedContract?.contractNumber}`}
      >
        <div className="space-y-5 text-xs">
          {/* Header Card */}
          <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Mã số hợp đồng</span>
              <h4 className="text-base font-bold text-blue-700 font-mono mt-0.5">{selectedContract?.contractNumber}</h4>
              <p className="text-slate-500 mt-0.5">Ngày ký kết: {selectedContract ? formatDate(selectedContract.signedDate) : ''}</p>
            </div>
            <div className="text-right">
              {selectedContract && getStatusBadge(selectedContract)}
            </div>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 p-4 bg-white border border-slate-200 rounded-sm">
              <h5 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Bên B - Người Lao Động</span>
              </h5>
              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Họ và tên:</span>
                  <span className="font-bold text-slate-900">{selectedContract?.employee?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã nhân viên:</span>
                  <span className="font-mono text-blue-600 font-semibold">{selectedContract?.employee?.employeeCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phòng ban:</span>
                  <span className="font-medium text-slate-900">{selectedContract?.employee?.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vị trí đảm nhiệm:</span>
                  <span className="font-medium text-slate-900">{selectedContract?.jobTitle || selectedContract?.employee?.position}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-white border border-slate-200 rounded-sm">
              <h5 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <FileSignature className="w-4 h-4 text-emerald-600" />
                <span>Điều Khoản & Thời Hạn Hợp Đồng</span>
              </h5>
              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Hình thức HĐ:</span>
                  <span>{selectedContract && getContractTypeBadge(selectedContract.contractType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngày hiệu lực:</span>
                  <span className="font-mono text-slate-900 font-medium">{selectedContract ? formatDate(selectedContract.startDate) : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngày hết hạn:</span>
                  <span className="font-mono text-slate-900 font-medium">
                    {selectedContract?.endDate ? formatDate(selectedContract.endDate) : 'Không xác định thời hạn'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lương đóng BHXH:</span>
                  <span className="font-mono text-slate-900 font-bold">{formatVND(selectedContract?.salaryInsurance || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chế độ làm việc:</span>
                  <span className="text-slate-900">{selectedContract?.workingTime || 'Toàn thời gian'}</span>
                </div>
              </div>
            </div>
          </div>

          {selectedContract?.note && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm">
              <span className="font-semibold text-slate-700 block mb-1">Ghi chú hợp đồng:</span>
              <p className="text-slate-600">{selectedContract.note}</p>
            </div>
          )}

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
            <button
              onClick={() => setSelectedContract(null)}
              className="px-4 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: CREATE / EDIT CONTRACT */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingContract ? `Chỉnh Sửa Hợp Đồng - ${editingContract.contractNumber}` : 'Ký Kết Hợp Đồng Lao Động Mới'}
      >
        <form onSubmit={handleSaveContract} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Số Hợp Đồng *</label>
              <input
                type="text"
                required
                value={formData.contractNumber}
                onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value.toUpperCase() })}
                placeholder="VD: HĐLĐ-2026/022"
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 font-mono text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Nhân Sự Ký Kết *</label>
              <select
                disabled={Boolean(editingContract)}
                value={formData.employeeId}
                onChange={(e) => {
                  const emp = employees.find((emp) => emp.id === e.target.value);
                  setFormData({
                    ...formData,
                    employeeId: e.target.value,
                    jobTitle: emp?.position || formData.jobTitle,
                    salaryInsurance: emp ? Math.round(emp.baseSalary * 0.8) : formData.salaryInsurance,
                  });
                }}
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500 disabled:bg-slate-100"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employeeCode}) - {emp.department}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Loại Hợp Đồng *</label>
              <select
                value={formData.contractType}
                onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="INDEFINITE">Không xác định thời hạn</option>
                <option value="DEFINITE_3Y">Có thời hạn 3 năm (36 tháng)</option>
                <option value="DEFINITE_1Y">Có thời hạn 1 năm (12 tháng)</option>
                <option value="PROBATION">Thử việc (60 ngày)</option>
                <option value="SEASONAL">Hợp đồng thời vụ / CTV</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Chức Danh Công Việc</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="VD: Kỹ sư Phần mềm cao cấp"
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Ngày Bắt Đầu *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Ngày Kết Thúc</label>
              <input
                type="date"
                disabled={formData.contractType === 'INDEFINITE'}
                value={formData.contractType === 'INDEFINITE' ? '' : formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Ngày Ký</label>
              <input
                type="date"
                value={formData.signedDate}
                onChange={(e) => setFormData({ ...formData, signedDate: e.target.value })}
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Mức Lương Đóng BHXH (VNĐ) *</label>
              <input
                type="number"
                required
                value={formData.salaryInsurance}
                onChange={(e) => setFormData({ ...formData, salaryInsurance: Number(e.target.value) })}
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 font-mono text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Trạng Thái Hợp Đồng</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="ACTIVE">Hiệu lực</option>
                <option value="EXPIRED">Hết hạn</option>
                <option value="TERMINATED">Chấm dứt trước hạn</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Ghi Chú Hợp Đồng</label>
            <textarea
              rows={2}
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Quy định kèm theo, phụ lục hợp đồng..."
              className="w-full bg-white border border-slate-300 rounded-sm p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3.5 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="h-9 px-4 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-9 px-4 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-none disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Đang lưu...' : editingContract ? 'Cập nhật' : 'Ký hợp đồng'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
