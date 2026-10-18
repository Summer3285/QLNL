'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import { formatVND, formatDate } from '../../../lib/utils';
import Modal from '../../../components/Modal';
import {
  Trophy,
  AlertOctagon,
  Plus,
  Trash2,
} from 'lucide-react';

export default function RewardsPage() {
  const { isHR, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'rewards' | 'disciplines'>('rewards');
  const [rewards, setRewards] = useState<any[]>([]);
  const [disciplines, setDisciplines] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [isDisciplineModalOpen, setIsDisciplineModalOpen] = useState(false);

  const [rewardForm, setRewardForm] = useState({
    employeeId: '',
    decisionNumber: '',
    title: '',
    rewardType: 'Bằng khen',
    amount: 2000000,
    decisionDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const [disciplineForm, setDisciplineForm] = useState({
    employeeId: '',
    decisionNumber: '',
    form: 'Khiển trách',
    penaltyAmount: 500000,
    decisionDate: new Date().toISOString().split('T')[0],
    effectiveDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rewRes, disRes, empRes] = await Promise.all([
        api.get('/api/rewards'),
        api.get('/api/rewards/disciplines'),
        api.get('/api/employees'),
      ]);

      if (rewRes.success) setRewards(rewRes.data);
      if (disRes.success) setDisciplines(disRes.data);
      if (empRes.success && empRes.data.length > 0) {
        setEmployees(empRes.data);
        if (!rewardForm.employeeId) {
          setRewardForm((prev) => ({ ...prev, employeeId: empRes.data[0].id }));
          setDisciplineForm((prev) => ({ ...prev, employeeId: empRes.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu khen thưởng/kỷ luật:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/rewards', {
        ...rewardForm,
        amount: Number(rewardForm.amount),
      });
      if (res.success) {
        setIsRewardModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo khen thưởng.');
    }
  };

  const handleCreateDiscipline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/rewards/disciplines', {
        ...disciplineForm,
        penaltyAmount: Number(disciplineForm.penaltyAmount),
      });
      if (res.success) {
        setIsDisciplineModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo kỷ luật.');
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa quyết định khen thưởng này?')) return;
    try {
      const res = await api.delete(`/api/rewards/${id}`);
      if (res.success) fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa khen thưởng.');
    }
  };

  const handleDeleteDiscipline = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa quyết định kỷ luật này?')) return;
    try {
      const res = await api.delete(`/api/rewards/disciplines/${id}`);
      if (res.success) fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa kỷ luật.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Khen thưởng & Kỷ luật
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lưu vết thi đua khen thưởng, xử lý chế tài kỷ luật và liên thông tiền thưởng bảng lương
          </p>
        </div>

        {isHR && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsRewardModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-none"
            >
              <Plus className="w-4 h-4" />
              <span>Khen thưởng</span>
            </button>
            <button
              onClick={() => setIsDisciplineModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-sm transition-colors shadow-none"
            >
              <Plus className="w-4 h-4 text-rose-600" />
              <span>Kỷ luật</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-3.5 py-1.5 rounded-sm text-xs font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'rewards'
              ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-none'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Khen thưởng ({rewards.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('disciplines')}
          className={`px-3.5 py-1.5 rounded-sm text-xs font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'disciplines'
              ? 'bg-red-50 text-red-800 border border-red-300 shadow-none'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
          <span>Kỷ luật ({disciplines.length})</span>
        </button>
      </div>

      {/* Tab 1: Rewards Table */}
      {activeTab === 'rewards' && (
        <div className="bg-white border border-slate-200/80 rounded-sm overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Số Quyết Định</th>
                  <th className="px-5 py-3.5">Cán bộ được khen</th>
                  <th className="px-5 py-3.5">Phòng ban</th>
                  <th className="px-5 py-3.5">Danh hiệu / Hình thức</th>
                  <th className="px-5 py-3.5">Mức tiền thưởng</th>
                  <th className="px-5 py-3.5">Ngày quyết định</th>
                  <th className="px-5 py-3.5">Lý do thành tích</th>
                  {isHR && <th className="px-5 py-3.5 text-right">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rewards.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      Chưa có quyết định khen thưởng nào.
                    </td>
                  </tr>
                ) : (
                  rewards.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-amber-700 font-semibold">
                        {r.decisionNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{r.employee?.fullName}</div>
                        <div className="text-[11px] font-mono text-blue-600">
                          {r.employee?.employeeCode}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{r.employee?.department}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          {r.title} ({r.rewardType})
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-emerald-700">
                        {formatVND(r.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{formatDate(r.decisionDate)}</td>
                      <td className="px-5 py-3.5 text-slate-700 max-w-xs">{r.reason}</td>
                      {isHR && (
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleDeleteReward(r.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Disciplines Table */}
      {activeTab === 'disciplines' && (
        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Số Quyết Định</th>
                  <th className="px-5 py-3.5">Cán bộ vi phạm</th>
                  <th className="px-5 py-3.5">Phòng ban</th>
                  <th className="px-5 py-3.5">Hình thức kỷ luật</th>
                  <th className="px-5 py-3.5">Mức khấu trừ/phạt</th>
                  <th className="px-5 py-3.5">Ngày ban hành</th>
                  <th className="px-5 py-3.5">Lý do kỷ luật</th>
                  <th className="px-5 py-3.5">Hiệu lực</th>
                  {isHR && <th className="px-5 py-3.5 text-right">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {disciplines.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400">
                      Chưa có quyết định kỷ luật nào.
                    </td>
                  </tr>
                ) : (
                  disciplines.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-rose-700 font-semibold">
                        {d.decisionNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{d.employee?.fullName}</div>
                        <div className="text-[11px] font-mono text-blue-600">
                          {d.employee?.employeeCode}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{d.employee?.department}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                          {d.form}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-rose-600 font-semibold">
                        {d.penaltyAmount > 0 ? `- ${formatVND(d.penaltyAmount)}` : 'Không phạt tiền'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{formatDate(d.decisionDate)}</td>
                      <td className="px-5 py-3.5 text-slate-700 max-w-xs">{d.reason}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                          {d.status}
                        </span>
                      </td>
                      {isHR && (
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleDeleteDiscipline(d.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add Reward */}
      <Modal
        isOpen={isRewardModalOpen}
        onClose={() => setIsRewardModalOpen(false)}
        title="Lập Quyết Định Khen Thưởng Cán Bộ"
      >
        <form onSubmit={handleCreateReward} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Chọn Cán Bộ *</label>
              <select
                value={rewardForm.employeeId}
                onChange={(e) => setRewardForm({ ...rewardForm, employeeId: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employeeCode} - {emp.fullName} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Số Quyết Định *</label>
              <input
                type="text"
                required
                placeholder="VD: QD-KT-2026-003"
                value={rewardForm.decisionNumber}
                onChange={(e) => setRewardForm({ ...rewardForm, decisionNumber: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Danh Hiệu / Tên Khen Thưởng *</label>
              <input
                type="text"
                required
                placeholder="VD: Lao động tiên tiến, Thưởng nóng dự án"
                value={rewardForm.title}
                onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Hình Thức Khen Thưởng</label>
              <select
                value={rewardForm.rewardType}
                onChange={(e) => setRewardForm({ ...rewardForm, rewardType: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Bằng khen">Bằng khen</option>
                <option value="Giấy khen">Giấy khen</option>
                <option value="Thưởng nóng">Thưởng nóng</option>
                <option value="Chiến sĩ thi đua">Chiến sĩ thi đua cấp cơ sở</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Mức tiền thưởng (VNĐ)</label>
              <input
                type="number"
                min={0}
                step={500000}
                value={rewardForm.amount}
                onChange={(e) => setRewardForm({ ...rewardForm, amount: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Ngày Ban Hành Quyết Định *</label>
              <input
                type="date"
                required
                value={rewardForm.decisionDate}
                onChange={(e) => setRewardForm({ ...rewardForm, decisionDate: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Lý Do / Thành Tích Khen Thưởng *</label>
            <textarea
              required
              rows={3}
              placeholder="Ghi rõ thành tích xuất sắc, dự án hoàn thành vượt chỉ tiêu..."
              value={rewardForm.reason}
              onChange={(e) => setRewardForm({ ...rewardForm, reason: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-sm p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsRewardModalOpen(false)}
              className="px-4 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-none"
            >
              Ký Quyết Định Khen Thưởng
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Add Discipline */}
      <Modal
        isOpen={isDisciplineModalOpen}
        onClose={() => setIsDisciplineModalOpen(false)}
        title="Lập Quyết Định Kỷ Luật Cán Bộ"
      >
        <form onSubmit={handleCreateDiscipline} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Chọn Cán Bộ Vi Phạm *</label>
              <select
                value={disciplineForm.employeeId}
                onChange={(e) => setDisciplineForm({ ...disciplineForm, employeeId: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employeeCode} - {emp.fullName} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Số Quyết Định Kỷ Luật *</label>
              <input
                type="text"
                required
                placeholder="VD: QD-KL-2026-002"
                value={disciplineForm.decisionNumber}
                onChange={(e) => setDisciplineForm({ ...disciplineForm, decisionNumber: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Hình Thức Kỷ Luật *</label>
              <select
                value={disciplineForm.form}
                onChange={(e) => setDisciplineForm({ ...disciplineForm, form: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Khiển trách">Khiển trách</option>
                <option value="Cảnh cáo">Cảnh cáo</option>
                <option value="Hạ bậc lương">Hạ bậc lương</option>
                <option value="Buộc thôi việc">Buộc thôi việc / Sa thải</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Tiền phạt khấu trừ (VNĐ)</label>
              <input
                type="number"
                min={0}
                step={100000}
                value={disciplineForm.penaltyAmount}
                onChange={(e) => setDisciplineForm({ ...disciplineForm, penaltyAmount: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Ngày Ban Hành Quyết Định *</label>
              <input
                type="date"
                required
                value={disciplineForm.decisionDate}
                onChange={(e) => setDisciplineForm({ ...disciplineForm, decisionDate: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Ngày Bắt Đầu Hiệu Lực *</label>
              <input
                type="date"
                required
                value={disciplineForm.effectiveDate}
                onChange={(e) => setDisciplineForm({ ...disciplineForm, effectiveDate: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Hành Vi Vi Phạm / Lý Do Kỷ Luật *</label>
            <textarea
              required
              rows={3}
              placeholder="Nêu rõ hành vi vi phạm nội quy, quy chế công ty..."
              value={disciplineForm.reason}
              onChange={(e) => setDisciplineForm({ ...disciplineForm, reason: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-sm p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsDisciplineModalOpen(false)}
              className="px-4 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-sm bg-red-600 hover:bg-red-700 text-white font-medium transition-all shadow-none"
            >
              Ký Quyết Định Kỷ Luật
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
