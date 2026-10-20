'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import { PayrollRecord, Department } from '../../../types';
import { formatVND } from '../../../lib/utils';
import StatCard from '../../../components/StatCard';
import PayslipModal from '../../../components/PayslipModal';
import Modal from '../../../components/Modal';
import {
  Banknote,
  Calendar,
  Download,
  Calculator,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Building2,
  Filter,
  Eye,
} from 'lucide-react';

export default function PayrollPage() {
  const { user, isHR } = useAuth();
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [year, setYear] = useState<number>(today.getFullYear());
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Payslip Modal State
  const [selectedPayrollId, setSelectedPayrollId] = useState<string | null>(null);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/payroll?month=${month}&year=${year}`);
      if (res.success && res.data) {
        setPayrolls(res.data);
      }

      const deptRes = await api.get('/api/departments');
      if (deptRes.success && deptRes.data) {
        setDepartments(deptRes.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách bảng lương:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [month, year]);

  const handleExecuteRunPayroll = async () => {
    setIsConfirmModalOpen(false);
    setRunning(true);
    setNotification(null);
    try {
      const res = await api.post('/api/payroll/calculate', { month, year });
      if (res.success) {
        setNotification(`Đã tự động tính toán lương thành công cho ${res.data?.length || 0} cán bộ nhân viên.`);
        fetchPayrolls();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tính toán bảng lương.');
    } finally {
      setRunning(false);
    }
  };

  const handleMarkAsPaid = async (payrollId: string) => {
    try {
      const res = await api.put(`/api/payroll/${payrollId}/pay`);
      if (res.success) {
        fetchPayrolls();
        if (selectedPayroll && selectedPayroll.id === payrollId) {
          setSelectedPayroll({ ...selectedPayroll, isPaid: true, paidAt: new Date().toISOString() });
        }
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái chi trả.');
    }
  };

  const handleOpenPayslip = (p: PayrollRecord) => {
    setSelectedPayroll(p);
    setSelectedPayrollId(p.id);
    setIsPayslipOpen(true);
  };

  const handleDownloadPdf = async (p: PayrollRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloadingId(p.id);
    try {
      const response = await fetch(`http://localhost:5000/api/payroll/${p.id}/pdf`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải file PDF.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PhieuLuong_${p.employee?.employeeCode}_T${p.month}_${p.year}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tải phiếu lương PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Department payroll breakdown
  const departmentBreakdown = useMemo(() => {
    const map: Record<string, { count: number; totalNet: number; totalBase: number }> = {};
    payrolls.forEach((p) => {
      const deptName = p.employee?.department || 'Khác';
      if (!map[deptName]) {
        map[deptName] = { count: 0, totalNet: 0, totalBase: 0 };
      }
      map[deptName].count++;
      map[deptName].totalNet += p.netSalary;
      map[deptName].totalBase += p.baseSalary;
    });

    return Object.entries(map).map(([dept, data]) => ({
      department: dept,
      ...data,
    }));
  }, [payrolls]);

  // Filtered payrolls
  const filteredPayrolls = useMemo(() => {
    if (selectedDept === 'ALL') return payrolls;
    return payrolls.filter((p) => p.employee?.department === selectedDept);
  }, [payrolls, selectedDept]);

  // Summary Metrics
  const totalNet = payrolls.reduce((acc, p) => acc + p.netSalary, 0);
  const paidCount = payrolls.filter((p) => p.isPaid).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Bảng lương
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kỳ chi trả tháng {month}/{year} • Đơn vị tiền tệ: VNĐ
          </p>
        </div>

        {isHR && (
          <button
            onClick={() => setIsConfirmModalOpen(true)}
            disabled={running}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-xs disabled:opacity-50"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{running ? 'Đang tính toán...' : 'Tính lương tự động'}</span>
          </button>
        )}
      </div>

      {notification && (
        <div className="p-3 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-none">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          title="Tổng thực lĩnh kỳ này"
          value={formatVND(totalNet)}
          subtitle={`${payrolls.length} nhân sự trong danh sách`}
        />
        <StatCard
          title="Tiến độ chi trả"
          value={`${paidCount} / ${payrolls.length} hồ sơ`}
          trend={paidCount === payrolls.length && payrolls.length > 0 ? 'Hoàn tất chi trả' : 'Đang xử lý'}
          trendUp={paidCount === payrolls.length && payrolls.length > 0}
        />
        <StatCard
          title="Khấu trừ bắt buộc"
          value="10.5% & Lũy tiến"
          subtitle="BHXH, BHYT, BHTN & Thuế TNCN 7 bậc"
        />
      </div>

      {/* Filter & Department Segment Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-sm p-3 space-y-2.5 shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Month/Year selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">Kỳ lương:</span>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="h-8 bg-slate-50 border border-slate-200 rounded-sm px-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="h-8 bg-slate-50 border border-slate-200 rounded-sm px-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>Năm {y}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500">
            Hiển thị: <span className="font-semibold text-slate-800">{filteredPayrolls.length}</span> / {payrolls.length} bản ghi
          </div>
        </div>

        {/* Department Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
          <button
            onClick={() => setSelectedDept('ALL')}
            className={`px-2.5 py-1 rounded-sm text-xs transition-colors shrink-0 ${
              selectedDept === 'ALL'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            Tất cả ({payrolls.length}) • {formatVND(totalNet)}
          </button>

          {departmentBreakdown.map((d) => (
            <button
              key={d.department}
              onClick={() => setSelectedDept(d.department)}
              className={`px-2.5 py-1 rounded-sm text-xs transition-colors shrink-0 ${
                selectedDept === d.department
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {d.department} ({d.count}) • {formatVND(d.totalNet)}
            </button>
          ))}
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white border border-slate-200/80 rounded-sm overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-xs tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Mã NV & Họ Tên</th>
                <th className="px-5 py-3.5">Phòng Ban</th>
                <th className="px-5 py-3.5">Lương cơ bản</th>
                <th className="px-5 py-3.5">Ngày công</th>
                <th className="px-5 py-3.5">Phụ cấp & Thưởng</th>
                <th className="px-5 py-3.5">BHXH (10.5%)</th>
                <th className="px-5 py-3.5">Thuế TNCN</th>
                <th className="px-5 py-3.5 font-bold text-slate-900">Thực lĩnh</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5 text-right">Phiếu lương & PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-400 text-sm">
                    Đang tải dữ liệu bảng lương...
                  </td>
                </tr>
              ) : filteredPayrolls.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-400 text-sm">
                    Chưa có bảng lương cho tháng {month}/{year} của phòng ban đã chọn.
                  </td>
                </tr>
              ) : (
                filteredPayrolls.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => handleOpenPayslip(p)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {p.employee?.fullName}
                      </div>
                      <div className="text-xs font-mono text-blue-600 font-medium">
                        {p.employee?.employeeCode}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-sm text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200/60">
                        {p.employee?.department}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono font-medium text-slate-800 text-sm">
                      <div>{formatVND(p.baseSalary)}</div>
                      {p.insuranceSalary && p.insuranceSalary !== p.baseSalary && (
                        <div className="text-[11px] font-sans text-slate-500 font-normal">
                          Đóng BH: {formatVND(p.insuranceSalary)}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <div className="font-mono font-medium text-slate-800">
                        {p.actualWorkDays} / {p.standardDays}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.actualWorkDays >= p.standardDays ? (
                          <span className="text-emerald-600 font-medium">Đủ công tháng</span>
                        ) : (
                          <span className="text-amber-600 font-medium">Nghỉ {p.standardDays - p.actualWorkDays} ngày</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <div className="font-mono text-slate-700">{formatVND(p.allowance)}</div>
                      {(p.rewardAmount || 0) > 0 && (
                        <div className="text-[11px] font-medium text-emerald-600">
                          +{formatVND(p.rewardAmount || 0)} thưởng
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono text-rose-600 text-sm">
                      - {formatVND(p.deductions)}
                    </td>
                    <td className="px-5 py-4 font-mono text-rose-600 text-sm">
                      - {formatVND(p.tax)}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-900 text-sm">
                      {formatVND(p.netSalary)}
                    </td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      {p.isPaid ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Đã thanh toán
                        </span>
                      ) : isHR ? (
                        <button
                          onClick={() => handleMarkAsPaid(p.id)}
                          className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                        >
                          Xác nhận chi trả
                        </button>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Chờ chi trả
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenPayslip(p)}
                          title="Xem chi tiết phiếu lương điện tử"
                          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-sm bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-medium transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
                        </button>

                        <button
                          onClick={(e) => handleDownloadPdf(p, e)}
                          disabled={downloadingId === p.id}
                          title="Tải Phiếu Lương PDF chuẩn"
                          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors shadow-none disabled:opacity-50"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-600" />
                          <span>{downloadingId === p.id ? '...' : 'PDF'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Running Payroll */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Xác Nhận Tính Lương Tự Động"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-sm text-xs text-blue-900">
            <Calculator className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-blue-950">
                Tính lương toàn doanh nghiệp Tháng {month}/{year}
              </p>
              <p className="mt-1 text-slate-600">
                Hệ thống sẽ tự động tổng hợp dữ liệu chấm công, ngày nghỉ phép, thưởng, và các khoản phạt kỷ luật trong kỳ để trích đóng BHXH, thuế TNCN lũy tiến 7 bậc và tính thực lĩnh cho toàn bộ nhân sự.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Các bản ghi lương của Tháng {month}/{year} đã có sẵn sẽ được cập nhật lại theo số liệu mới nhất. Bạn có chắc chắn muốn tiếp tục?
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(false)}
              className="px-3 py-1.5 rounded-sm border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleExecuteRunPayroll}
              disabled={running}
              className="px-4 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-none flex items-center gap-1.5"
            >
              <Calculator className="w-4 h-4" />
              <span>{running ? 'Đang tính...' : 'Xác nhận tính lương'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Payslip Modal */}
      <PayslipModal
        isOpen={isPayslipOpen}
        onClose={() => setIsPayslipOpen(false)}
        payrollId={selectedPayrollId}
        initialPayroll={selectedPayroll}
        onMarkAsPaid={handleMarkAsPaid}
        isHR={isHR}
      />
    </div>
  );
}
