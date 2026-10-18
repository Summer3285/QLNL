'use client';

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { api } from '../lib/api';
import { PayrollRecord } from '../types';
import { formatVND } from '../lib/utils';
import {
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Building2,
  User,
  CreditCard,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payrollId: string | null;
  initialPayroll?: PayrollRecord | null;
  onMarkAsPaid?: (payrollId: string) => Promise<void>;
  isHR?: boolean;
}

export default function PayslipModal({
  isOpen,
  onClose,
  payrollId,
  initialPayroll,
  onMarkAsPaid,
  isHR,
}: PayslipModalProps) {
  const [data, setData] = useState<PayrollRecord | null>(initialPayroll || null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showTaxDetails, setShowTaxDetails] = useState(false);

  useEffect(() => {
    if (isOpen && payrollId) {
      setLoading(true);
      api
        .get(`/api/payroll/${payrollId}`)
        .then((res) => {
          if (res.success && res.data) {
            setData(res.data);
          } else if (initialPayroll) {
            setData(initialPayroll);
          }
        })
        .catch((err) => {
          console.error('Lỗi tải chi tiết phiếu lương:', err);
          if (initialPayroll) setData(initialPayroll);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setData(initialPayroll || null);
    }
  }, [isOpen, payrollId, initialPayroll]);

  if (!isOpen) return null;

  const p = data;

  const handleDownloadPdf = async () => {
    if (!p) return;
    setDownloading(true);
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
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const proratedBase = p
    ? Math.round((p.baseSalary / p.standardDays) * p.actualWorkDays)
    : 0;
  const reward = p?.rewardAmount || 0;
  const gross = proratedBase + (p?.allowance || 0) + reward;

  const bhxh =
    p?.bhxh ||
    Math.round(
      Math.min(p?.insuranceSalary || p?.baseSalary || 0, 46800000) * 0.08
    );
  const bhyt =
    p?.bhyt ||
    Math.round(
      Math.min(p?.insuranceSalary || p?.baseSalary || 0, 46800000) * 0.015
    );
  const bhtn =
    p?.bhtn ||
    Math.round(
      Math.min(p?.insuranceSalary || p?.baseSalary || 0, 99200000) * 0.01
    );

  const totalDeductions = (p?.deductions || 0) + (p?.tax || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Phiếu Lương Điện Tử - Tháng ${p?.month || ''}/${p?.year || ''}`}
      maxWidth="max-w-3xl"
    >
      {loading && !p ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          Đang tải thông tin chi tiết phiếu lương...
        </div>
      ) : p ? (
        <div className="space-y-6 text-xs text-slate-800">
          {/* Header Banner */}
          <div className="bg-slate-900 text-white rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] tracking-wider uppercase text-slate-400 font-semibold">
                NexNova Technologies JSC
              </div>
              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
                PHIẾU LƯƠNG ĐIỆN TỬ (PAYSLIP)
              </h2>
              <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                Kỳ chi trả: Tháng {p.month} / Năm {p.year} • MST: 0108992834
              </div>
            </div>

            <div>
              {p.isPaid ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ĐÃ THANH TOÁN</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Clock className="w-3.5 h-3.5" />
                  <span>CHỜ THANH TOÁN</span>
                </span>
              )}
            </div>
          </div>

          {/* Employee & Bank Info Grid */}
          <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <User className="w-3.5 h-3.5" />
                <span>Nhân viên thụ hưởng</span>
              </div>
              <div className="text-sm font-bold text-slate-900">{p.employee?.fullName}</div>
              <div className="text-[11px] text-slate-500">
                Mã NV: <span className="font-mono text-blue-700 font-semibold">{p.employee?.employeeCode}</span>
                {' • '}
                <span>{p.employee?.position}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Phòng ban: <span className="font-medium text-slate-700">{p.employee?.department}</span>
              </div>
            </div>

            <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-4">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Tài khoản nhận lương</span>
              </div>
              <div className="text-xs font-mono font-bold text-slate-900">
                {p.employee?.bankAccountNumber || 'Chưa cập nhật STK'}
              </div>
              <div className="text-[11px] text-slate-500">
                Ngày công tính lương: <strong className="text-slate-900 font-mono">{p.actualWorkDays}</strong> / {p.standardDays} ngày
                {p.actualWorkDays >= p.standardDays && (
                  <span className="text-emerald-600 font-medium ml-1"> (Đủ công)</span>
                )}
              </div>
              {p.insuranceSalary && (
                <div className="text-[11px] text-slate-500">
                  Lương đóng BHXH: <strong className="text-blue-700 font-mono">{formatVND(p.insuranceSalary)}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="border border-slate-200 rounded-sm overflow-hidden bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">Khoản mục</th>
                  <th className="px-4 py-2.5">Căn cứ / Diễn giải</th>
                  <th className="px-4 py-2.5 text-right">Số tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* I. EARNINGS */}
                <tr className="bg-blue-50/50">
                  <td colSpan={3} className="px-4 py-2 font-bold text-blue-900 uppercase text-[11px]">
                    I. Thu nhập & Phụ cấp (Earnings)
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-slate-800">1. Lương cơ bản thoả thuận</td>
                  <td className="px-4 py-2.5 text-slate-500">Hợp đồng lao động</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                    {formatVND(p.baseSalary)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-slate-800">2. Lương theo ngày công làm việc</td>
                  <td className="px-4 py-2.5 text-slate-500">
                    Tỷ lệ {p.actualWorkDays}/{p.standardDays} ngày công
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-medium text-slate-900">
                    {formatVND(proratedBase)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-slate-800">3. Phụ cấp hàng tháng</td>
                  <td className="px-4 py-2.5 text-slate-500">Ăn trưa, đi lại, điện thoại</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                    {formatVND(p.allowance)}
                  </td>
                </tr>
                {reward > 0 && (
                  <tr>
                    <td className="px-4 py-2.5 text-slate-800">4. Thưởng hiệu suất / Dự án</td>
                    <td className="px-4 py-2.5 text-slate-500">Khen thưởng tháng</td>
                    <td className="px-4 py-2.5 text-right font-mono text-emerald-700 font-semibold">
                      +{formatVND(reward)}
                    </td>
                  </tr>
                )}
                <tr className="bg-slate-50/80 font-semibold">
                  <td className="px-4 py-2.5 text-slate-900">TỔNG THU NHẬP (GROSS)</td>
                  <td className="px-4 py-2.5 text-slate-500">Trước khi trích nộp</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                    {formatVND(gross)}
                  </td>
                </tr>

                {/* II. DEDUCTIONS */}
                <tr className="bg-rose-50/40">
                  <td colSpan={3} className="px-4 py-2 font-bold text-rose-900 uppercase text-[11px]">
                    II. Các khoản khấu trừ bắt buộc & Thuế (Deductions & Taxes)
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-slate-800">5. Bảo hiểm xã hội (BHXH 8%)</td>
                  <td className="px-4 py-2.5 text-slate-500">
                    Trần trích nộp: {formatVND(Math.min(p.insuranceSalary || p.baseSalary, 46800000))}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-rose-600">
                    -{formatVND(bhxh)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-slate-800">6. Bảo hiểm y tế (BHYT 1.5%)</td>
                  <td className="px-4 py-2.5 text-slate-500">Căn cứ lương đóng BHXH</td>
                  <td className="px-4 py-2.5 text-right font-mono text-rose-600">
                    -{formatVND(bhyt)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-slate-800">7. Bảo hiểm thất nghiệp (BHTN 1%)</td>
                  <td className="px-4 py-2.5 text-slate-500">Trần vùng I: 99.200.000 đ</td>
                  <td className="px-4 py-2.5 text-right font-mono text-rose-600">
                    -{formatVND(bhtn)}
                  </td>
                </tr>
                <tr className="text-slate-500 italic">
                  <td className="px-4 py-2 text-slate-600">Giảm trừ gia cảnh bản thân</td>
                  <td className="px-4 py-2 text-slate-400">Nghị quyết 954/2020/UBTVQH14</td>
                  <td className="px-4 py-2 text-right font-mono text-slate-500">
                    -11,000,000 đ
                  </td>
                </tr>
                {p.taxableIncome !== undefined && p.taxableIncome > 0 && (
                  <tr className="bg-slate-50/60 font-medium">
                    <td className="px-4 py-2 text-slate-700">Thu nhập tính thuế (TNTT)</td>
                    <td className="px-4 py-2 text-slate-400">Sau khi trừ BH & Gia cảnh</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-700">
                      {formatVND(p.taxableIncome)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="px-4 py-2.5 text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span>8. Thuế thu nhập cá nhân (TNCN)</span>
                      {p.breakdown?.taxBrackets && (
                        <button
                          type="button"
                          onClick={() => setShowTaxDetails(!showTaxDetails)}
                          className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          {showTaxDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          <span>{showTaxDetails ? 'Ẩn biểu thuế' : 'Xem 7 bậc'}</span>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">Biểu lũy tiến từng phần 7 bậc</td>
                  <td className="px-4 py-2.5 text-right font-mono text-rose-600 font-medium">
                    -{formatVND(p.tax)}
                  </td>
                </tr>

                {/* 7-Tier Tax Details Collapsible */}
                {showTaxDetails && p.breakdown?.taxBrackets && (
                  <tr>
                    <td colSpan={3} className="px-4 py-3 bg-slate-50/90 border-t border-b border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-700 mb-2">
                        Chi tiết tính thuế TNCN theo từng bậc (Thông tư 111/2013/TT-BTC):
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-[10px] text-center font-mono">
                        {p.breakdown.taxBrackets.map((b) => (
                          <div
                            key={b.tier}
                            className={`p-1.5 rounded-sm border ${
                              b.taxAmount > 0
                                ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}
                          >
                            <div className="font-bold">{b.bracketName}</div>
                            <div className="text-[9px]">{b.rate * 100}%</div>
                            <div className="mt-1">{b.taxAmount > 0 ? formatVND(b.taxAmount) : '0'}</div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}

                <tr className="bg-slate-50/80 font-semibold">
                  <td className="px-4 py-2.5 text-slate-900">TỔNG CÁC KHOẢN KHẨU TRỪ</td>
                  <td className="px-4 py-2.5 text-slate-500">BHXH + BHYT + BHTN + Thuế</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-rose-600">
                    -{formatVND(totalDeductions)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* NET TAKE-HOME SALARY HIGHLIGHT */}
          <div className="bg-slate-900 border border-slate-800 rounded-sm p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">
                THỰC LĨNH CHUYỂN KHOẢN (NET TAKE-HOME)
              </span>
              <span className="text-xs text-slate-300 mt-0.5 block">
                Tổng thu nhập thực nhận chuyển vào số tài khoản ngân hàng
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-sky-400">
              {formatVND(p.netSalary)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>In phiếu lương</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-none disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading ? 'Đang xuất PDF...' : 'Tải File PDF'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {isHR && !p.isPaid && onMarkAsPaid && (
                <button
                  type="button"
                  onClick={() => onMarkAsPaid(p.id)}
                  className="h-9 px-4 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                >
                  Xác nhận chi trả ngay
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
