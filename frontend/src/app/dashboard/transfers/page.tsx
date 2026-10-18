'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { 
  ArrowRightLeft, 
  Plus, 
  Search, 
  Calendar, 
  Building2, 
  User, 
  DollarSign, 
  FileText, 
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

interface TransferRecord {
  id: string;
  decisionNumber: string;
  transferDate: string;
  fromDepartment: string;
  toDepartment: string;
  fromPosition: string;
  toPosition: string;
  oldSalary: number;
  newSalary: number;
  reason: string;
  status: string;
  employee: {
    id: string;
    fullName: string;
    employeeCode: string;
    avatarUrl?: string;
  };
}

interface EmployeeOption {
  id: string;
  fullName: string;
  employeeCode: string;
  department: string;
  position: string;
  baseSalary: number;
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    decisionNumber: `QĐ-TC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    transferDate: new Date().toISOString().split('T')[0],
    fromDepartment: '',
    toDepartment: '',
    fromPosition: '',
    toPosition: '',
    oldSalary: 0,
    newSalary: 0,
    reason: '',
  });

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.get('/api/transfers');
      if (res.success) {
        setTransfers(res.data || []);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải lịch sử thuyên chuyển:', err);
      setErrorMsg(err.message || 'Không thể tải lịch sử thuyên chuyển');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/api/employees');
      if (res.success) {
        setEmployees(res.data || []);
      }
    } catch (err: any) {
      console.error('Lỗi tải danh sách nhân viên:', err);
    }
  };

  useEffect(() => {
    fetchTransfers();
    fetchEmployees();
  }, []);

  const handleSelectEmployee = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setFormData(prev => ({
        ...prev,
        employeeId: empId,
        fromDepartment: emp.department,
        fromPosition: emp.position,
        oldSalary: emp.baseSalary,
        toDepartment: emp.department,
        toPosition: emp.position,
        newSalary: emp.baseSalary,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) {
      alert('Vui lòng chọn nhân viên!');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/api/transfers', formData);

      if (res.success) {
        alert('Tạo quyết định điều động công tác thành công!');
        setShowModal(false);
        fetchTransfers();
        fetchEmployees();
        // Reset form
        setFormData({
          employeeId: '',
          decisionNumber: `QĐ-TC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          transferDate: new Date().toISOString().split('T')[0],
          fromDepartment: '',
          toDepartment: '',
          fromPosition: '',
          toPosition: '',
          oldSalary: 0,
          newSalary: 0,
          reason: '',
        });
      }
    } catch (err: any) {
      console.error(err);
      alert(`Lỗi: ${err.message || 'Không thể tạo quyết định'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTransfers = transfers.filter(t => 
    t.decisionNumber?.toLowerCase().includes(search.toLowerCase()) ||
    t.employee?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    t.employee?.employeeCode?.toLowerCase().includes(search.toLowerCase()) ||
    t.toDepartment?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Thuyên chuyển & Điều động
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản trị quyết định luân chuyển phòng ban, bổ nhiệm chức danh và thay đổi bậc lương
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-sm shadow-none transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo quyết định</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-sm bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3 shadow-none">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-none flex items-center gap-3.5">
          <div className="p-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-sm">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Lượt luân chuyển</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{transfers.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-none flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Đã thi hành</p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">
              {transfers.filter(t => t.status === 'COMPLETED').length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-none flex items-center gap-3.5">
          <div className="p-2.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-sm">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Trong năm nay</p>
            <p className="text-2xl font-bold text-amber-600 mt-0.5">
              {transfers.filter(t => new Date(t.transferDate).getFullYear() === new Date().getFullYear()).length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-none p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo số QĐ, tên nhân viên, phòng ban..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-sm border border-slate-100 shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Số Quyết Định & Ngày</th>
                <th className="px-6 py-4">Cán Bộ / Nhân Viên</th>
                <th className="px-6 py-4">Điều Động Phòng Ban</th>
                <th className="px-6 py-4">Bổ Nhiệm Chức Vụ</th>
                <th className="px-6 py-4">Điều Chỉnh Lương</th>
                <th className="px-6 py-4">Lý Do / Mục Đích</th>
                <th className="px-6 py-4 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Đang tải dữ liệu thuyên chuyển công tác...
                  </td>
                </tr>
              ) : filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Chưa có quyết định điều động công tác nào.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{t.decisionNumber}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(t.transferDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{t.employee?.fullName}</div>
                      <div className="text-xs text-indigo-600 font-mono">{t.employee?.employeeCode}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{t.fromDepartment}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{t.toDepartment}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-500">{t.fromPosition}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-semibold text-slate-800">{t.toPosition}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <span className="text-slate-400 line-through">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.oldSalary)}
                        </span>
                        <div className="font-semibold text-emerald-600">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.newSalary)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-600 max-w-xs truncate block" title={t.reason}>
                        {t.reason || 'Điều động công tác theo nhu cầu tổ chức'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Đã thực hiện
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ban hành Quyết định Điều động */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-sm max-w-2xl w-full p-6 shadow-none border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
              <span>Ban Hành Quyết Định Thuyên Chuyển / Bổ Nhiệm</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Số Quyết Định <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.decisionNumber}
                    onChange={(e) => setFormData({ ...formData, decisionNumber: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Ngày Hiệu Lực <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.transferDate}
                    onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Chọn Cán Bộ / Nhân Viên <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.employeeId}
                  onChange={(e) => handleSelectEmployee(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">-- Chọn nhân sự điều động --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeCode}) - Hiện tại: {emp.department} | {emp.position}
                    </option>
                  ))}
                </select>
              </div>

              {/* Thông tin luân chuyển */}
              <div className="p-4 bg-slate-50 rounded-sm border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Điều Chuyển Đơn Vị & Chức Vụ</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Phòng ban hiện tại</span>
                    <input
                      type="text"
                      disabled
                      value={formData.fromDepartment}
                      className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-blue-600 block mb-1">Phòng ban chuyển đến *</span>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Phòng Kế Toán / Ban Dự Án Cloud"
                      value={formData.toDepartment}
                      onChange={(e) => setFormData({ ...formData, toDepartment: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-sm text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Chức vụ hiện tại</span>
                    <input
                      type="text"
                      disabled
                      value={formData.fromPosition}
                      className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-blue-600 block mb-1">Chức vụ mới được bổ nhiệm *</span>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Trưởng nhóm Kỹ thuật / Chuyên viên"
                      value={formData.toPosition}
                      onChange={(e) => setFormData({ ...formData, toPosition: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-sm text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Mức lương cũ (VNĐ)</span>
                    <input
                      type="text"
                      disabled
                      value={new Intl.NumberFormat('vi-VN').format(formData.oldSalary)}
                      className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-emerald-600 block mb-1">Mức lương mới (VNĐ) *</span>
                    <input
                      type="number"
                      required
                      min={0}
                      step={500000}
                      value={formData.newSalary}
                      onChange={(e) => setFormData({ ...formData, newSalary: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-sm text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Lý Do / Căn Cứ Điều Động
                </label>
                <textarea
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Căn cứ theo yêu cầu mở rộng dự án AI Cloud và đề xuất của Hội đồng quản trị..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-sm transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-sm shadow-none transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Đang Xử Lý...' : 'Ký Quyết Định'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
