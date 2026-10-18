'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../../lib/api';
import {
  UserCheck,
  Plus,
  Search,
  Calendar,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserPlus,
  Mail,
  Phone,
  Briefcase,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  ChevronLeft,
  X,
  FileText,
  Filter,
  Check,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface RecruitmentPlan {
  id: string;
  title: string;
  department: string;
  departmentId?: string;
  position: string;
  quantity: number;
  deadline: string;
  status: string;
  requirements: string;
  createdAt: string;
  _count?: {
    candidates: number;
  };
}

interface Candidate {
  id: string;
  planId: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  probationMonths?: number;
  probationStartDate?: string;
  probationEndDate?: string;
  notes?: string;
  createdAt: string;
  daysRemaining?: number;
  isExpiringSoon?: boolean;
  isExpired?: boolean;
  isOverdue?: boolean;
  plan?: {
    id: string;
    title: string;
    department: string;
    position: string;
  };
}

interface Department {
  id: string;
  code: string;
  name: string;
  location?: string;
}

const PIPELINE_STAGES = [
  {
    key: 'APPLIED',
    label: 'Tiếp Nhận Hồ Sơ',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    headerBorder: 'border-t-slate-400',
    columnBg: 'bg-slate-50/60',
    description: 'Hồ sơ mới tiếp nhận & sơ loại ban đầu',
  },
  {
    key: 'INTERVIEWING',
    label: 'Phỏng Vấn',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    headerBorder: 'border-t-indigo-500',
    columnBg: 'bg-indigo-50/20',
    description: 'Vòng phỏng vấn chuyên môn & văn hóa',
  },
  {
    key: 'OFFERED',
    label: 'Đề Nghị Tuyển Dụng',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    headerBorder: 'border-t-amber-500',
    columnBg: 'bg-amber-50/20',
    description: 'Đã gửi thư mời nhận việc (Offer Letter)',
  },
  {
    key: 'HIRED',
    label: 'Tiếp Nhận / Thử Việc',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    headerBorder: 'border-t-emerald-500',
    columnBg: 'bg-emerald-50/20',
    description: 'Đã onboard thành nhân viên / thử việc',
  },
  {
    key: 'REJECTED',
    label: 'Không Phù Hợp',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    headerBorder: 'border-t-rose-400',
    columnBg: 'bg-rose-50/20',
    description: 'Không trúng tuyển hoặc từ chối offer',
  },
];

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState<'PIPELINE' | 'PLANS' | 'PROBATION'>('PIPELINE');
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');

  const [plans, setPlans] = useState<RecruitmentPlan[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [alerts, setAlerts] = useState<Candidate[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [filterPlanId, setFilterPlanId] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Plans
  const [planForm, setPlanForm] = useState({
    title: '',
    department: 'Ban Kỹ Thuật & AI',
    departmentId: '',
    position: 'Kỹ sư AI Cloud',
    quantity: 2,
    deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    requirements: '',
  });

  // Form New Candidate
  const [candForm, setCandForm] = useState({
    planId: '',
    fullName: '',
    email: '',
    phone: '',
    status: 'APPLIED',
    probationMonths: 2,
    notes: '',
  });

  // Form Onboard One-Click
  const [onboardForm, setOnboardForm] = useState({
    employeeCode: '',
    gender: 'Nam',
    departmentId: '',
    departmentName: '',
    position: '',
    contractType: 'PROBATION',
    baseSalary: 15000000,
    salaryInsurance: 12750000, // 85% lương cơ sở theo luật
    joinDate: new Date().toISOString().split('T')[0],
    passwordPlain: 'password123',
  });

  // Normalize candidate status for pipeline view
  const normalizeStatus = (status: string) => {
    if (status === 'PROBATION' || status === 'OFFER_ACCEPTED') return 'HIRED';
    return status;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [plansRes, candsRes, alertsRes, deptsRes] = await Promise.all([
        api.get('/api/recruitment/plans'),
        api.get('/api/recruitment/candidates'),
        api.get('/api/recruitment/probation-alerts'),
        api.get('/api/departments'),
      ]);

      if (plansRes.success) {
        setPlans(plansRes.data || []);
        if (plansRes.data?.length > 0 && !candForm.planId) {
          setCandForm((prev) => ({ ...prev, planId: plansRes.data[0].id }));
        }
      }
      if (candsRes.success) {
        setCandidates(candsRes.data || []);
      }
      if (alertsRes.success) {
        setAlerts(alertsRes.data || []);
      }
      if (deptsRes.success) {
        setDepartments(deptsRes.data || []);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu tuyển dụng:', err);
      setErrorMsg(err.message || 'Không thể tải dữ liệu tuyển dụng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchPlan = filterPlanId === 'ALL' || c.planId === filterPlanId;
      const matchSearch =
        search.trim() === '' ||
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        (c.plan?.position && c.plan.position.toLowerCase().includes(search.toLowerCase()));
      return matchPlan && matchSearch;
    });
  }, [candidates, filterPlanId, search]);

  // Stage change handler
  const handleUpdateStatus = async (candidateId: string, newStatus: string) => {
    try {
      const res = await api.put(`/api/recruitment/candidates/${candidateId}/status`, {
        status: newStatus,
      });
      if (res.success) {
        setCandidates((prev) =>
          prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
        );
      }
    } catch (err: any) {
      console.error(err);
      alert(`Lỗi: ${err.message || 'Không thể cập nhật giai đoạn'}`);
    }
  };

  // Open Onboard Modal
  const handleOpenOnboardModal = async (c: Candidate) => {
    setSelectedCandidate(c);
    try {
      // Gợi ý mã nhân viên tự động từ server
      let suggestedCode = 'NV-022';
      try {
        const codeRes = await api.get('/api/recruitment/candidates/next-code');
        if (codeRes.success && codeRes.data?.nextCode) {
          suggestedCode = codeRes.data.nextCode;
        }
      } catch (e) {
        // Fallback
      }

      const deptName = c.plan?.department || 'Ban Kỹ Thuật & AI';
      const matchedDept = departments.find((d) => d.name === deptName);

      const defaultSalary = 15000000;
      const defaultInsurance = Math.round(defaultSalary * 0.85);

      setOnboardForm({
        employeeCode: suggestedCode,
        gender: 'Nam',
        departmentId: matchedDept ? matchedDept.id : '',
        departmentName: deptName,
        position: c.plan?.position || 'Chuyên viên kỹ thuật',
        contractType: 'PROBATION',
        baseSalary: defaultSalary,
        salaryInsurance: defaultInsurance,
        joinDate: new Date().toISOString().split('T')[0],
        passwordPlain: 'password123',
      });

      setShowOnboardModal(true);
    } catch (err: any) {
      console.error(err);
      alert(`Lỗi chuẩn bị dữ liệu: ${err.message}`);
    }
  };

  // Handle Salary Change in Onboard Modal (Auto-calc 85% for probation)
  const handleSalaryChange = (newBaseSalary: number, contractType: string) => {
    let insurance = newBaseSalary;
    if (contractType === 'PROBATION') {
      insurance = Math.round(newBaseSalary * 0.85);
    }
    setOnboardForm((prev) => ({
      ...prev,
      baseSalary: newBaseSalary,
      salaryInsurance: insurance,
    }));
  };

  // Submit Onboard Modal (Convert Candidate to Employee)
  const handleSubmitOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    try {
      setSubmitting(true);
      const res = await api.post(`/api/recruitment/candidates/${selectedCandidate.id}/convert`, onboardForm);
      if (res.success) {
        alert(
          `🎉 Tiếp nhận thành công!\n` +
          `• Nhân sự: ${res.data?.employee?.fullName} (${res.data?.employee?.employeeCode})\n` +
          `• Tài khoản: ${res.data?.user?.email}\n` +
          `• Số hợp đồng: ${res.data?.contract?.contractNumber}\n` +
          `Trạng thái ứng viên đã được chuyển thành "Đã Tiếp Nhận / Thử Việc".`
        );
        setShowOnboardModal(false);
        fetchData();
      }
    } catch (err: any) {
      console.error(err);
      alert(`Lỗi chuyển đổi nhân sự: ${err.message || 'Không thể hoàn tất tiếp nhận.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Create Plan
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/api/recruitment/plans', planForm);
      if (res.success) {
        alert('Tạo kế hoạch tuyển dụng thành công!');
        setShowPlanModal(false);
        fetchData();
      }
    } catch (err: any) {
      console.error(err);
      alert(`Lỗi: ${err.message || 'Không thể tạo kế hoạch'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Create Candidate
  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candForm.planId) {
      alert('Vui lòng chọn Kế hoạch tuyển dụng tiếp nhận.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.post('/api/recruitment/candidates', candForm);
      if (res.success) {
        alert('Thêm ứng viên vào quy trình tuyển dụng thành công!');
        setShowCandidateModal(false);
        setCandForm((prev) => ({
          ...prev,
          fullName: '',
          email: '',
          phone: '',
          notes: '',
        }));
        fetchData();
      }
    } catch (err: any) {
      console.error(err);
      alert(`Lỗi: ${err.message || 'Không thể tạo ứng viên'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Tuyển dụng & Tiếp nhận
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quy trình tuyển dụng Kanban 5 giai đoạn & tiếp nhận ứng viên thành nhân viên chính thức
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCandidateModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-sm shadow-none transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Thêm Ứng Viên</span>
          </button>
          <button
            onClick={() => setShowPlanModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-xs rounded-sm shadow-none transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Tạo Kế Hoạch</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-sm bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 shadow-none">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Probation Alert Banner */}
      {alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm p-3.5 flex items-start gap-3 shadow-none">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-amber-900">
              Cảnh báo: Có {alerts.length} nhân sự sắp hết hạn hoặc quá hạn thử việc!
            </h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Thời gian thử việc còn dưới 15 ngày. Vui lòng tiến hành đánh giá và ký hợp đồng lao động chính thức.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {alerts.map((a) => (
                <span
                  key={a.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white border border-amber-200 rounded-sm text-xs font-medium text-amber-900 shadow-none"
                >
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>{a.fullName} ({a.plan?.position || 'Nhân sự'})</span>
                  {a.isOverdue ? (
                    <span className="text-rose-600 font-bold">Quá hạn {Math.abs(a.daysRemaining || 0)} ngày</span>
                  ) : (
                    <span className="text-amber-700">Còn {a.daysRemaining} ngày</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats (4 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-sm border border-slate-200 shadow-none">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Kế hoạch mở</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {plans.length}
            <span className="text-xs font-normal text-slate-500 ml-1.5">
              ({plans.reduce((acc, p) => acc + p.quantity, 0)} chỉ tiêu)
            </span>
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-sm border border-slate-200 shadow-none">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Tổng ứng viên</span>
            <UserCheck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{candidates.length}</p>
        </div>

        <div className="bg-white p-3.5 rounded-sm border border-slate-200 shadow-none">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Đang phỏng vấn & Offer</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-amber-600 mt-1">
            {candidates.filter((c) => ['INTERVIEWING', 'OFFERED'].includes(c.status)).length}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-sm border border-slate-200 shadow-none">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Đã tiếp nhận / Thử việc</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            {candidates.filter((c) => ['HIRED', 'PROBATION', 'OFFER_ACCEPTED'].includes(c.status)).length}
          </p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('PIPELINE')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'PIPELINE'
              ? 'border-blue-600 text-blue-600 bg-blue-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Quy Trình Pipeline ({filteredCandidates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PLANS')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'PLANS'
              ? 'border-blue-600 text-blue-600 bg-blue-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Kế Hoạch Tuyển Dụng ({plans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PROBATION')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'PROBATION'
              ? 'border-blue-600 text-blue-600 bg-blue-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Theo Dõi Thử Việc ({candidates.filter((c) => normalizeStatus(c.status) === 'HIRED').length})</span>
          {alerts.length > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-sm font-bold">
              {alerts.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: PIPELINE & KANBAN / TABLE */}
      {activeTab === 'PIPELINE' && (
        <div className="space-y-3.5">
          {/* Controls Bar: Filter Plan, Search, View Mode Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-2.5 rounded-sm border border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Plan */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">Kế hoạch:</span>
                <select
                  value={filterPlanId}
                  onChange={(e) => setFilterPlanId(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-sm bg-white text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">Tất cả kế hoạch ({candidates.length})</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.position})
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm tên, email, SĐT..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* View Mode Toggle: Kanban vs Table */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-sm border border-slate-200 self-end sm:self-auto">
              <button
                onClick={() => setViewMode('KANBAN')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-sm transition-colors ${
                  viewMode === 'KANBAN'
                    ? 'bg-white text-slate-900 shadow-none border border-slate-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Chế độ xem Kanban Pipeline"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-sm transition-colors ${
                  viewMode === 'TABLE'
                    ? 'bg-white text-slate-900 shadow-none border border-slate-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Chế độ xem Bảng danh sách"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Danh sách</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: KANBAN BOARD */}
          {viewMode === 'KANBAN' && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 overflow-x-auto pb-4">
              {PIPELINE_STAGES.map((stage, stageIdx) => {
                const stageCandidates = filteredCandidates.filter(
                  (c) => normalizeStatus(c.status) === stage.key
                );

                return (
                  <div
                    key={stage.key}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const candId = e.dataTransfer.getData('text/plain');
                      if (candId) handleUpdateStatus(candId, stage.key);
                    }}
                    className={`flex flex-col rounded-sm border border-slate-200 border-t-2 ${stage.headerBorder} ${stage.columnBg} min-h-[500px]`}
                  >
                    {/* Stage Header */}
                    <div className="p-2.5 bg-white border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold text-slate-800 truncate" title={stage.label}>
                          {stage.label}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded-sm border ${stage.badgeClass}`}>
                        {stageCandidates.length}
                      </span>
                    </div>

                    {/* Stage Card List */}
                    <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[720px]">
                      {stageCandidates.length === 0 ? (
                        <div className="h-28 border border-dashed border-slate-200 rounded-sm flex items-center justify-center p-2 text-center text-slate-400 text-xs">
                          Kéo thả hoặc chuyển ứng viên vào đây
                        </div>
                      ) : (
                        stageCandidates.map((c) => (
                          <div
                            key={c.id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('text/plain', c.id)}
                            className="bg-white p-3 rounded-sm border border-slate-200 hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing group space-y-2"
                          >
                            {/* Card Top: Name & Position */}
                            <div>
                              <div className="flex items-start justify-between gap-1">
                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                  {c.fullName}
                                </h4>
                                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                  {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                              <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                                {c.plan?.position || 'Vị trí chuyên môn'}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {c.plan?.department || 'Khối vận hành'}
                              </p>
                            </div>

                            {/* Contact Badges */}
                            <div className="text-[11px] text-slate-500 space-y-0.5 border-t border-slate-100 pt-1.5">
                              <div className="flex items-center gap-1.5 truncate" title={c.email}>
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{c.email}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{c.phone}</span>
                              </div>
                            </div>

                            {/* Candidate Notes if any */}
                            {c.notes && (
                              <p className="text-[10px] text-slate-500 italic bg-slate-50 p-1.5 rounded-sm line-clamp-2 border border-slate-100">
                                {c.notes}
                              </p>
                            )}

                            {/* Action Buttons: Next/Prev Stage & Onboard */}
                            <div className="border-t border-slate-100 pt-2 flex items-center justify-between gap-1">
                              {/* Left / Prev Stage */}
                              {stageIdx > 0 ? (
                                <button
                                  onClick={() => handleUpdateStatus(c.id, PIPELINE_STAGES[stageIdx - 1].key)}
                                  className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-sm"
                                  title={`Lùi về: ${PIPELINE_STAGES[stageIdx - 1].label}`}
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                              ) : <span className="w-5" />}

                              {/* Onboard Button (Highlight on OFFERED or HIRED) */}
                              {(stage.key === 'OFFERED' || stage.key === 'HIRED' || c.status === 'PROBATION') ? (
                                <button
                                  onClick={() => handleOpenOnboardModal(c)}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-[11px] font-semibold transition-colors"
                                  title="Chuyển đổi thành nhân viên chính thức & ký hợp đồng"
                                >
                                  <UserCheck className="w-3 h-3" />
                                  <span>Tiếp nhận</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenOnboardModal(c)}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-sm text-[10px] transition-colors"
                                  title="Mở form tiếp nhận thành nhân sự"
                                >
                                  <span>Onboard</span>
                                </button>
                              )}

                              {/* Right / Next Stage */}
                              {stageIdx < PIPELINE_STAGES.length - 1 ? (
                                <button
                                  onClick={() => handleUpdateStatus(c.id, PIPELINE_STAGES[stageIdx + 1].key)}
                                  className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-sm"
                                  title={`Tiến tới: ${PIPELINE_STAGES[stageIdx + 1].label}`}
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              ) : <span className="w-5" />}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 2: TABLE VIEW */}
          {viewMode === 'TABLE' && (
            <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Ứng Viên</th>
                      <th className="px-4 py-3">Kế Hoạch & Vị Trí</th>
                      <th className="px-4 py-3 text-center">Giai Đoạn Pipeline</th>
                      <th className="px-4 py-3">Ngày Nộp / Ghi Chú</th>
                      <th className="px-4 py-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                          Không tìm thấy ứng viên nào phù hợp bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map((c) => {
                        const currentStage = PIPELINE_STAGES.find((s) => s.key === normalizeStatus(c.status)) || PIPELINE_STAGES[0];
                        return (
                          <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900">{c.fullName}</div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>
                                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-800">{c.plan?.position || 'Kỹ sư'}</div>
                              <div className="text-[11px] text-slate-500">{c.plan?.title || 'Chung'}</div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <select
                                value={normalizeStatus(c.status)}
                                onChange={(e) => handleUpdateStatus(c.id, e.target.value)}
                                className={`px-2 py-0.5 text-xs font-semibold rounded-sm border ${currentStage.badgeClass} focus:outline-none`}
                              >
                                {PIPELINE_STAGES.map((s) => (
                                  <option key={s.key} value={s.key}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-[11px] text-slate-500">
                              <div>Nộp: {new Date(c.createdAt).toLocaleDateString('vi-VN')}</div>
                              {c.notes && (
                                <div className="text-slate-400 truncate max-w-xs" title={c.notes}>
                                  {c.notes}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleOpenOnboardModal(c)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-xs font-medium transition-colors"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Tiếp Nhận Nhân Sự</span>
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
        </div>
      )}

      {/* TAB 2: KẾ HOẠCH TUYỂN DỤNG */}
      {activeTab === 'PLANS' && (
        <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Tên Kế Hoạch / Vị Trí</th>
                  <th className="px-4 py-3">Phòng Ban Tiếp Nhận</th>
                  <th className="px-4 py-3 text-center">Chỉ Tiêu</th>
                  <th className="px-4 py-3 text-center">Ứng Viên</th>
                  <th className="px-4 py-3">Hạn Hoàn Thành</th>
                  <th className="px-4 py-3">Yêu Cầu Năng Lực</th>
                  <th className="px-4 py-3 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      Chưa có kế hoạch tuyển dụng nào được phê duyệt.
                    </td>
                  </tr>
                ) : (
                  plans.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{p.title}</div>
                        <div className="text-[11px] text-blue-600 font-medium mt-0.5">{p.position}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">{p.department}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-slate-800">{p.quantity}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded-sm font-bold text-[11px]">
                          {p._count?.candidates || candidates.filter((c) => c.planId === p.id).length} hồ sơ
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(p.deadline).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-slate-500" title={p.requirements}>
                        {p.requirements || 'Tốt nghiệp Đại học chuyên ngành'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.status === 'OPEN' ? 'Đang tuyển' : p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: THEO DÕI THỬ VIỆC */}
      {activeTab === 'PROBATION' && (
        <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Nhân Sự Thử Việc</th>
                  <th className="px-4 py-3">Vị Trí & Khối</th>
                  <th className="px-4 py-3">Thời Gian Thử Việc</th>
                  <th className="px-4 py-3 text-center">Thời Hạn Còn Lại</th>
                  <th className="px-4 py-3 text-center">Trạng Thái</th>
                  <th className="px-4 py-3 text-right">Thao Tác Nghiệp Vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.filter((c) => normalizeStatus(c.status) === 'HIRED').length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      Chưa có nhân sự trong danh sách theo dõi thử việc.
                    </td>
                  </tr>
                ) : (
                  candidates
                    .filter((c) => normalizeStatus(c.status) === 'HIRED')
                    .map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{c.fullName}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{c.plan?.position || 'Chuyên viên'}</div>
                          <div className="text-[11px] text-slate-500">{c.plan?.department || 'Kỹ thuật'}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {c.probationStartDate && c.probationEndDate ? (
                            <div>
                              <div>Từ: {new Date(c.probationStartDate).toLocaleDateString('vi-VN')}</div>
                              <div>Đến: {new Date(c.probationEndDate).toLocaleDateString('vi-VN')}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400">2 tháng (Quy chuẩn)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {c.daysRemaining !== undefined ? (
                            c.isOverdue ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-sm font-bold">
                                <AlertTriangle className="w-3 h-3" /> Quá hạn {Math.abs(c.daysRemaining)} ngày
                              </span>
                            ) : c.isExpiringSoon ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-sm font-bold">
                                <Clock className="w-3 h-3" /> Còn {c.daysRemaining} ngày
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-sm">
                                Còn {c.daysRemaining} ngày
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400">--</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Đã Tiếp Nhận
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleOpenOnboardModal(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-sm text-xs font-medium transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span>Ký HĐ Chính Thức</span>
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ONBOARD ONE-CLICK (TIẾP NHẬN ỨNG VIÊN THÀNH NHÂN VIÊN CHÍNH THỨC) */}
      {showOnboardModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-sm max-w-2xl w-full p-5 shadow-none border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-sm border border-emerald-100">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Tiếp Nhận Nhân Sự Chính Thức (Onboarding)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chuyển ứng viên trúng tuyển thành nhân viên, tự động tạo hồ sơ & hợp đồng lao động
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitOnboard} className="space-y-4 pt-3.5">
              {/* Candidate Info Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-sm p-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-slate-500">Ứng viên: </span>
                  <span className="text-xs font-bold text-slate-900">{selectedCandidate.fullName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Email: </span>
                  <span className="text-xs font-medium text-slate-800">{selectedCandidate.email}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500">SĐT: </span>
                  <span className="text-xs font-medium text-slate-800">{selectedCandidate.phone}</span>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Employee Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã Nhân Viên (Code) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={onboardForm.employeeCode}
                    onChange={(e) => setOnboardForm({ ...onboardForm, employeeCode: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500 font-mono uppercase"
                    placeholder="NV-022"
                  />
                  <span className="text-[10px] text-slate-400">Hệ thống tự động đề xuất mã tiếp theo</span>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giới Tính
                  </label>
                  <select
                    value={onboardForm.gender}
                    onChange={(e) => setOnboardForm({ ...onboardForm, gender: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phòng Ban Tiếp Nhận <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={onboardForm.departmentId}
                    onChange={(e) => {
                      const dept = departments.find((d) => d.id === e.target.value);
                      setOnboardForm({
                        ...onboardForm,
                        departmentId: e.target.value,
                        departmentName: dept ? dept.name : onboardForm.departmentName,
                      });
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">-- Chọn phòng ban tiếp nhận --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chức Danh / Vị Trí Công Việc <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={onboardForm.position}
                    onChange={(e) => setOnboardForm({ ...onboardForm, position: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500"
                    placeholder="Kỹ sư Lập trình AI"
                  />
                </div>

                {/* Contract Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Loại Hợp Đồng Khởi Tạo <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={onboardForm.contractType}
                    onChange={(e) => {
                      const cType = e.target.value;
                      setOnboardForm({ ...onboardForm, contractType: cType });
                      handleSalaryChange(onboardForm.baseSalary, cType);
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="PROBATION">Hợp đồng thử việc (2 tháng - 85% lương BHXH)</option>
                    <option value="DEFINITE_1Y">Hợp đồng xác định thời hạn 1 năm</option>
                    <option value="DEFINITE_3Y">Hợp đồng xác định thời hạn 3 năm</option>
                    <option value="INDEFINITE">Hợp đồng không xác định thời hạn</option>
                  </select>
                </div>

                {/* Join Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày Bắt Đầu Làm Việc <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={onboardForm.joinDate}
                    onChange={(e) => setOnboardForm({ ...onboardForm, joinDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Base Salary */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mức Lương Cơ Sở (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1000000}
                    step={500000}
                    required
                    value={onboardForm.baseSalary}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      handleSalaryChange(val, onboardForm.contractType);
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">
                    {onboardForm.baseSalary.toLocaleString('vi-VN')} VNĐ/tháng
                  </span>
                </div>

                {/* Salary Insurance */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mức Lương Đóng BHXH (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1000000}
                    step={100000}
                    required
                    value={onboardForm.salaryInsurance}
                    onChange={(e) => setOnboardForm({ ...onboardForm, salaryInsurance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">
                    {onboardForm.contractType === 'PROBATION' ? 'Tự động tính 85% lương cơ sở theo Luật LĐ' : '100% lương cơ sở'}
                  </span>
                </div>
              </div>

              {/* Password Initial & Security note */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-sm p-3 text-xs text-blue-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Khởi tạo tài khoản đăng nhập cho nhân viên mới</span>
                </div>
                <p className="text-blue-700 text-[11px]">
                  Tài khoản người dùng sẽ được tạo tự động với email: <strong>{selectedCandidate.email}</strong>, mật khẩu mặc định: <strong>{onboardForm.passwordPlain}</strong> và vai trò <strong>EMPLOYEE</strong>. Nhân viên có thể đổi mật khẩu tại Cổng ESS sau khi đăng nhập.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-sm transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-xs font-semibold shadow-none transition-colors disabled:opacity-50"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Đang Xử Lý...' : 'Xác Nhận Tiếp Nhận Nhân Viên'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TẠO KẾ HOẠCH TUYỂN DỤNG */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-sm max-w-lg w-full p-5 shadow-none border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Tạo Kế Hoạch Tuyển Dụng Mới</span>
              </h3>
              <button
                onClick={() => setShowPlanModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3 pt-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu Đề Kế Hoạch <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tuyển dụng Kỹ sư AI Quý 4/2026"
                  value={planForm.title}
                  onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phòng Ban Tiếp Nhận <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.department}
                    onChange={(e) => setPlanForm({ ...planForm, department: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vị Trí Cần Tuyển <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.position}
                    onChange={(e) => setPlanForm({ ...planForm, position: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chỉ Tiêu Tuyển Dụng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={planForm.quantity}
                    onChange={(e) => setPlanForm({ ...planForm, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hạn Hoàn Thành <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={planForm.deadline}
                    onChange={(e) => setPlanForm({ ...planForm, deadline: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yêu Cầu Trình Độ & Kinh Nghiệm
                </label>
                <textarea
                  rows={2}
                  placeholder="Yêu cầu từ 2 năm kinh nghiệm thực chiến..."
                  value={planForm.requirements}
                  onChange={(e) => setPlanForm({ ...planForm, requirements: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-sm transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-sm shadow-none transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Đang Lưu...' : 'Phê Duyệt Kế Hoạch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: THÊM ỨNG VIÊN MỚI */}
      {showCandidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-sm max-w-lg w-full p-5 shadow-none border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Thêm Ứng Viên Vào Quy Trình</span>
              </h3>
              <button
                onClick={() => setShowCandidateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCandidate} className="space-y-3 pt-3.5">
              {/* Plan select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kế Hoạch Tuyển Dụng Tiếp Nhận <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={candForm.planId}
                  onChange={(e) => setCandForm({ ...candForm, planId: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">-- Chọn kế hoạch tuyển dụng --</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} - {p.position} ({p.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ Và Tên Ứng Viên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={candForm.fullName}
                  onChange={(e) => setCandForm({ ...candForm, fullName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Liên Hệ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ungvien@gmail.com"
                    value={candForm.email}
                    onChange={(e) => setCandForm({ ...candForm, email: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số Điện Thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0912345678"
                    value={candForm.phone}
                    onChange={(e) => setCandForm({ ...candForm, phone: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giai Đoạn Khởi Tạo
                  </label>
                  <select
                    value={candForm.status}
                    onChange={(e) => setCandForm({ ...candForm, status: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="APPLIED">1. Tiếp Nhận Hồ Sơ</option>
                    <option value="INTERVIEWING">2. Phỏng Vấn</option>
                    <option value="OFFERED">3. Đề Nghị Tuyển Dụng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số Tháng Thử Việc (Dự kiến)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={candForm.probationMonths}
                    onChange={(e) => setCandForm({ ...candForm, probationMonths: parseInt(e.target.value) || 2 })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi Chú Đánh Giá / Nguồn Ứng Tuyển
                </label>
                <textarea
                  rows={2}
                  placeholder="Nguồn LinkedIn / Giới thiệu nội bộ..."
                  value={candForm.notes}
                  onChange={(e) => setCandForm({ ...candForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCandidateModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-sm transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-sm shadow-none transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Đang Tiếp Nhận...' : 'Lưu Hồ Sơ Ứng Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
