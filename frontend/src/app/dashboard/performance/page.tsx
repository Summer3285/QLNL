'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import {
  PerformanceCycle,
  PerformanceReview,
  KpiTemplate,
  KpiCategory,
  KpiCriteria,
} from '../../../types';
import { formatDate } from '../../../lib/utils';
import Modal from '../../../components/Modal';
import {
  Award,
  Star,
  CheckCircle2,
  FileCheck,
  UserCheck,
  Plus,
  Calendar,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Sliders,
  Sparkles,
  TrendingUp,
  Info,
  ShieldCheck,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';

export default function PerformancePage() {
  const { user, isHR } = useAuth();
  const [activeTab, setActiveTab] = useState<'self' | 'manager' | 'calibration' | 'templates'>('self');

  const [cycles, setCycles] = useState<PerformanceCycle[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<PerformanceCycle | null>(null);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [myReview, setMyReview] = useState<PerformanceReview | null>(null);
  const [templates, setTemplates] = useState<KpiTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Self review criteria scores: map criteriaId -> { score: number, note: string }
  const [criteriaScores, setCriteriaScores] = useState<Record<string, { score: number; note: string }>>({});
  const [selfComment, setSelfComment] = useState<string>('');
  const [selfSubmitting, setSelfSubmitting] = useState(false);
  const [selfMessage, setSelfMessage] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Manager evaluation modal
  const [evaluatingReview, setEvaluatingReview] = useState<PerformanceReview | null>(null);
  const [mgrCriteriaScores, setMgrCriteriaScores] = useState<Record<string, { score: number; note: string }>>({});
  const [mgrComment, setMgrComment] = useState<string>('');
  const [finalRating, setFinalRating] = useState<'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT' | 'UNSATISFACTORY'>('EXCELLENT');
  const [mgrSubmitting, setMgrSubmitting] = useState(false);

  // Calibration summary
  const [summaryData, setSummaryData] = useState<any>(null);
  const [calibratingReview, setCalibratingReview] = useState<PerformanceReview | null>(null);
  const [calibratedRating, setCalibratedRating] = useState<string>('GOOD');
  const [calibrationNote, setCalibrationNote] = useState<string>('');
  const [calibrating, setCalibrating] = useState(false);

  // Create Cycle Modal State
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [cycleTitle, setCycleTitle] = useState('');
  const [cycleStart, setCycleStart] = useState('');
  const [cycleEnd, setCycleEnd] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // 1. Fetch Cycles & Templates
  const fetchCycles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/performance/cycles');
      if (res.success && res.data && res.data.length > 0) {
        setCycles(res.data);
        setSelectedCycle(res.data[0]);
      }
    } catch (err) {
      console.error('Lỗi tải kỳ đánh giá:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/api/performance/templates');
      if (res.success && res.data) {
        setTemplates(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải bộ tiêu chí:', err);
    }
  };

  // 2. Fetch Cycle Reviews, My Review & Calibration Data
  const fetchCycleData = async (cycleId: string) => {
    try {
      if (isHR) {
        const res = await api.get(`/api/performance/cycles/${cycleId}/reviews`);
        if (res.success && res.data) {
          setReviews(res.data);
        }

        const sumRes = await api.get(`/api/performance/cycles/${cycleId}/summary`);
        if (sumRes.success && sumRes.data) {
          setSummaryData(sumRes.data);
        }
      }

      const myRes = await api.get(`/api/performance/cycles/${cycleId}/my-review`);
      if (myRes.success && myRes.data) {
        const r = myRes.data;
        setMyReview(r);
        if (r.selfComment) setSelfComment(r.selfComment);

        // Prepopulate existing criteria scores
        if (r.scores && r.scores.length > 0) {
          const map: Record<string, { score: number; note: string }> = {};
          r.scores.forEach((s: any) => {
            map[s.criteriaId] = {
              score: s.selfScore || 5,
              note: s.selfNote || '',
            };
          });
          setCriteriaScores(map);
        }
      } else {
        setMyReview(null);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu chi tiết:', err);
    }
  };

  useEffect(() => {
    fetchCycles();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedCycle) {
      fetchCycleData(selectedCycle.id);
      // Expand all categories by default
      if (selectedCycle.template?.categories) {
        const exp: Record<string, boolean> = {};
        selectedCycle.template.categories.forEach((cat) => {
          exp[cat.id] = true;
        });
        setExpandedCategories(exp);
      }
    }
  }, [selectedCycle, isHR]);

  // Compute live weighted self score
  const liveSelfWeightedScore = useMemo(() => {
    const cats = selectedCycle?.template?.categories;
    if (!cats || cats.length === 0) return null;

    let totalScore = 0;
    let totalCatWeight = 0;

    for (const cat of cats) {
      let catScore = 0;
      let totalCriWeight = 0;

      for (const cri of cat.criteria) {
        const entry = criteriaScores[cri.id];
        const val = entry ? entry.score : 5;
        catScore += val * cri.weight;
        totalCriWeight += cri.weight;
      }

      if (totalCriWeight > 0) {
        const catNorm = catScore / totalCriWeight;
        totalScore += catNorm * cat.weight;
        totalCatWeight += cat.weight;
      }
    }

    if (totalCatWeight > 0) {
      return Number((totalScore / totalCatWeight).toFixed(2));
    }
    return 5;
  }, [selectedCycle, criteriaScores]);

  // Compute live manager weighted score during evaluation
  const liveMgrWeightedScore = useMemo(() => {
    const cats = selectedCycle?.template?.categories;
    if (!cats || cats.length === 0) return null;

    let totalScore = 0;
    let totalCatWeight = 0;

    for (const cat of cats) {
      let catScore = 0;
      let totalCriWeight = 0;

      for (const cri of cat.criteria) {
        const entry = mgrCriteriaScores[cri.id];
        const val = entry ? entry.score : 5;
        catScore += val * cri.weight;
        totalCriWeight += cri.weight;
      }

      if (totalCriWeight > 0) {
        const catNorm = catScore / totalCriWeight;
        totalScore += catNorm * cat.weight;
        totalCatWeight += cat.weight;
      }
    }

    if (totalCatWeight > 0) {
      return Number((totalScore / totalCatWeight).toFixed(2));
    }
    return 5;
  }, [selectedCycle, mgrCriteriaScores]);

  const getRatingBadge = (rating?: string | null) => {
    if (!rating) return <span className="text-slate-400">---</span>;
    switch (rating) {
      case 'EXCELLENT':
        return (
          <span className="px-2.5 py-0.5 rounded-sm text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Xuất Sắc (A+)
          </span>
        );
      case 'GOOD':
        return (
          <span className="px-2.5 py-0.5 rounded-sm text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Tốt (A)
          </span>
        );
      case 'AVERAGE':
        return (
          <span className="px-2.5 py-0.5 rounded-sm text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Đạt Yêu Cầu (B)
          </span>
        );
      case 'NEEDS_IMPROVEMENT':
        return (
          <span className="px-2.5 py-0.5 rounded-sm text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Cần Cải Thiện (C)
          </span>
        );
      case 'UNSATISFACTORY':
        return (
          <span className="px-2.5 py-0.5 rounded-sm text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Không Đạt (D)
          </span>
        );
      default:
        return <span className="text-slate-600">{rating}</span>;
    }
  };

  const getAutoRatingFromScore = (score: number) => {
    if (score >= 4.5) return 'EXCELLENT';
    if (score >= 3.8) return 'GOOD';
    if (score >= 3.0) return 'AVERAGE';
    if (score >= 2.0) return 'NEEDS_IMPROVEMENT';
    return 'UNSATISFACTORY';
  };

  // Submit Self-Review
  const handleSubmitSelfReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCycle) return;
    setSelfSubmitting(true);
    setSelfMessage(null);

    const cats = selectedCycle.template?.categories || [];
    const formattedScores: Array<{ criteriaId: string; selfScore: number; selfNote?: string }> = [];

    cats.forEach((cat) => {
      cat.criteria.forEach((cri) => {
        const val = criteriaScores[cri.id] || { score: 5, note: '' };
        formattedScores.push({
          criteriaId: cri.id,
          selfScore: val.score,
          selfNote: val.note,
        });
      });
    });

    try {
      const res = await api.post(`/api/performance/cycles/${selectedCycle.id}/self-review`, {
        selfComment,
        scores: formattedScores,
      });

      if (res.success) {
        setSelfMessage('Đã nộp thành công bản tự đánh giá KPIs với điểm số có trọng số!');
        fetchCycleData(selectedCycle.id);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi nộp tự đánh giá.');
    } finally {
      setSelfSubmitting(false);
    }
  };

  // Open Manager Evaluation Modal
  const handleOpenEvaluationModal = (rev: PerformanceReview) => {
    setEvaluatingReview(rev);
    setMgrComment(rev.mgrComment || '');

    const map: Record<string, { score: number; note: string }> = {};
    if (selectedCycle?.template?.categories) {
      selectedCycle.template.categories.forEach((cat) => {
        cat.criteria.forEach((cri) => {
          const existingScore = rev.scores?.find((s) => s.criteriaId === cri.id);
          map[cri.id] = {
            score: existingScore?.mgrScore || existingScore?.selfScore || 5,
            note: existingScore?.mgrNote || '',
          };
        });
      });
    }
    setMgrCriteriaScores(map);
    setFinalRating((rev.finalRating as any) || (rev.autoRating as any) || 'EXCELLENT');
  };

  // Submit Manager Evaluation
  const handleSubmitManagerReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingReview || !selectedCycle) return;
    setMgrSubmitting(true);

    const formattedScores: Array<{ criteriaId: string; mgrScore: number; mgrNote?: string }> = [];
    selectedCycle.template?.categories.forEach((cat) => {
      cat.criteria.forEach((cri) => {
        const val = mgrCriteriaScores[cri.id] || { score: 5, note: '' };
        formattedScores.push({
          criteriaId: cri.id,
          mgrScore: val.score,
          mgrNote: val.note,
        });
      });
    });

    try {
      const res = await api.put(`/api/performance/reviews/${evaluatingReview.id}/manager-review`, {
        mgrComment,
        finalRating,
        scores: formattedScores,
      });

      if (res.success) {
        setEvaluatingReview(null);
        fetchCycleData(selectedCycle.id);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu kết quả đánh giá.');
    } finally {
      setMgrSubmitting(false);
    }
  };

  // Open Calibrate Modal
  const handleOpenCalibrateModal = (rev: PerformanceReview) => {
    setCalibratingReview(rev);
    setCalibratedRating(rev.finalRating || rev.autoRating || 'GOOD');
    setCalibrationNote('');
  };

  const handleSaveCalibration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calibratingReview || !selectedCycle) return;
    setCalibrating(true);
    try {
      const res = await api.put(`/api/performance/reviews/${calibratingReview.id}/calibrate`, {
        finalRating: calibratedRating,
        calibrationNote,
      });
      if (res.success) {
        setCalibratingReview(null);
        fetchCycleData(selectedCycle.id);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi hiệu chỉnh xếp loại.');
    } finally {
      setCalibrating(false);
    }
  };

  // Create Cycle
  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/performance/cycles', {
        title: cycleTitle,
        startDate: cycleStart,
        endDate: cycleEnd,
        templateId: selectedTemplateId || undefined,
      });
      if (res.success) {
        setIsCycleModalOpen(false);
        fetchCycles();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo kỳ đánh giá.');
    }
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Đánh giá hiệu suất
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Đánh giá KPI đa tiêu chí, tự đánh giá nhân sự và xếp loại thi đua
          </p>
        </div>

        {isHR && (
          <button
            onClick={() => {
              setIsCycleModalOpen(true);
              if (templates.length > 0) setSelectedTemplateId(templates[0].id);
            }}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-none"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo kỳ đánh giá</span>
          </button>
        )}
      </div>

      {selectedCycle && (
        <div className="bg-white border border-slate-200/90 rounded-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 font-bold shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-200/60">
                  Kỳ đánh giá
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {selectedCycle.template?.name || 'Bộ Tiêu Chí Chuẩn'}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">{selectedCycle.title}</h2>
              <div className="text-xs text-slate-500">
                {formatDate(selectedCycle.startDate)} &rarr; {formatDate(selectedCycle.endDate)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {cycles.length > 1 && (
              <select
                value={selectedCycle.id}
                onChange={(e) => {
                  const found = cycles.find((c) => c.id === e.target.value);
                  if (found) setSelectedCycle(found);
                }}
                className="h-9 bg-white border border-slate-300 rounded-sm px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-none"
              >
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('self')}
          className={`flex items-center gap-1.5 h-8 px-3 rounded-sm transition-colors ${
            activeTab === 'self'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Tự đánh giá</span>
        </button>

        {isHR && (
          <>
            <button
              onClick={() => setActiveTab('manager')}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-sm transition-colors ${
                activeTab === 'manager'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Quản lý đánh giá ({reviews.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('calibration')}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-sm transition-colors ${
                activeTab === 'calibration'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Hiệu chỉnh điểm</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-sm transition-colors ${
                activeTab === 'templates'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Bộ Tiêu Chí KPI & Trọng Số</span>
            </button>
          </>
        )}
      </div>

      {/* TAB 1: SELF EVALUATION */}
      {activeTab === 'self' && (
        <div className="space-y-6">
          {/* Header Card with Real-time Scoring preview */}
          <div className="bg-blue-900 border border-blue-800 rounded-sm p-6 text-white shadow-none relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  {myReview?.status === 'COMPLETED' ? 'Đã Hoàn Tất Đánh Giá' : 'Đang Thực Hiện Tự Đánh Giá'}
                </span>
                <h3 className="text-xl font-bold mt-2">Bản Tự Đánh Giá Hiệu Suất Theo Trọng Số</h3>
                <p className="text-xs text-blue-100/80 mt-1 max-w-xl">
                  Hãy chấm điểm khách quan từ 1 đến 5 sao cho từng tiêu chí thuộc 4 nhóm năng lực. Điểm tổng hợp sẽ được tính toán tự động dựa trên trọng số chuẩn hóa.
                </p>
              </div>

              {/* Score Display Card */}
              <div className="bg-white/10 border border-white/20 rounded-sm p-4 flex items-center gap-5 min-w-[240px]">
                <div className="text-center">
                  <div className="text-[10px] text-blue-200 uppercase font-semibold">Điểm Tự Chấm</div>
                  <div className="text-3xl font-extrabold text-amber-300 font-mono mt-0.5">
                    {liveSelfWeightedScore?.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-blue-200 font-mono">/ 5.00</div>
                </div>

                <div className="h-10 w-px bg-white/20" />

                <div>
                  <div className="text-[10px] text-blue-200 uppercase font-semibold">Dự Kiến Xếp Loại</div>
                  <div className="mt-1">
                    {getRatingBadge(liveSelfWeightedScore ? getAutoRatingFromScore(liveSelfWeightedScore) : 'AVERAGE')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback from Manager if completed */}
          {myReview?.status === 'COMPLETED' && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>KẾT QUẢ PHÊ DUYỆT TỪ QUẢN LÝ / BAN GIÁM ĐỐC:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Xếp loại chung cuộc:</span>
                  {getRatingBadge(myReview.finalRating)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white/80 p-3.5 rounded-sm border border-emerald-100">
                <div>
                  <span className="text-slate-500">Điểm Quản Lý:</span>{' '}
                  <span className="font-bold text-blue-700 font-mono text-sm">{myReview.mgrScore || '---'} / 5.0</span>
                </div>
                <div>
                  <span className="text-slate-500">Điểm Tự Đánh Giá:</span>{' '}
                  <span className="font-bold text-amber-600 font-mono text-sm">{myReview.selfScore || '---'} / 5.0</span>
                </div>
                <div>
                  <span className="text-slate-500">Người đánh giá:</span>{' '}
                  <span className="font-semibold text-slate-800">{myReview.reviewer?.fullName || 'Hội đồng HR'}</span>
                </div>
              </div>

              {myReview.mgrComment && (
                <div className="text-xs text-slate-700 italic bg-white p-3 rounded-sm border border-emerald-100">
                  "{myReview.mgrComment}"
                </div>
              )}
            </div>
          )}

          {selfMessage && (
            <div className="p-3.5 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-none">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span className="font-medium">{selfMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmitSelfReview} className="space-y-6">
            {/* Accordion Categories */}
            {selectedCycle?.template?.categories.map((cat, catIdx) => {
              const isExpanded = expandedCategories[cat.id] ?? true;

              // Calculate category average
              let catSum = 0;
              let catWeightSum = 0;
              cat.criteria.forEach((cri) => {
                const val = criteriaScores[cri.id]?.score ?? 5;
                catSum += val * cri.weight;
                catWeightSum += cri.weight;
              });
              const catAvg = catWeightSum > 0 ? (catSum / catWeightSum).toFixed(2) : '5.00';

              return (
                <div
                  key={cat.id}
                  className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-none transition-all"
                >
                  {/* Category Header */}
                  <div
                    onClick={() => toggleCategory(cat.id)}
                    className="p-5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-sm bg-blue-100/80 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                        {catIdx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h4 className="text-base font-bold text-slate-900">{cat.name}</h4>
                          <span className="px-2.5 py-0.5 rounded-sm text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Trọng số: {(cat.weight * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Gồm {cat.criteria.length} chỉ tiêu chi tiết
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs text-slate-500 block uppercase font-semibold">Điểm nhóm</span>
                        <span className="text-sm font-bold text-slate-900 font-mono">{catAvg} ★</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Criteria Items */}
                  {isExpanded && (
                    <div className="divide-y divide-slate-100 p-2 sm:p-4">
                      {cat.criteria.map((cri) => {
                        const curScore = criteriaScores[cri.id]?.score ?? 5;
                        const curNote = criteriaScores[cri.id]?.note ?? '';

                        return (
                          <div key={cri.id} className="p-4 rounded-sm border border-slate-100 hover:bg-slate-50/60 transition-colors space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-slate-900">{cri.name}</span>
                                  <span className="text-xs font-mono px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-medium">
                                    {(cri.weight * 100).toFixed(0)}% trong nhóm
                                  </span>
                                </div>
                                {cri.description && (
                                  <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                                    <Info className="w-4 h-4 text-blue-500 shrink-0" />
                                    <span>{cri.description}</span>
                                  </p>
                                )}
                              </div>

                              {/* Star grading */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() =>
                                      setCriteriaScores((prev) => ({
                                        ...prev,
                                        [cri.id]: { score: star, note: prev[cri.id]?.note || '' },
                                      }))
                                    }
                                    className={`h-8 px-2.5 rounded-sm border transition-all flex items-center gap-1 font-semibold ${
                                      curScore >= star
                                        ? 'bg-amber-50 border-amber-300 text-amber-600 shadow-none'
                                        : 'bg-white border-slate-200 text-slate-300 hover:border-slate-300'
                                    }`}
                                  >
                                    <Star className={`w-3.5 h-3.5 ${curScore >= star ? 'fill-amber-500 text-amber-500' : ''}`} />
                                    <span className="text-xs">{star}</span>
                                  </button>
                                ))}
                                <span className="text-xs font-medium text-slate-600 ml-1.5 w-24">
                                  {curScore === 5
                                    ? 'Xuất sắc'
                                    : curScore === 4
                                    ? 'Tốt'
                                    : curScore === 3
                                    ? 'Đạt yêu cầu'
                                    : curScore === 2
                                    ? 'Cần cải thiện'
                                    : 'Không đạt'}
                                </span>
                              </div>
                            </div>

                            {/* Note input */}
                            <div>
                              <input
                                type="text"
                                value={curNote}
                                onChange={(e) =>
                                  setCriteriaScores((prev) => ({
                                    ...prev,
                                    [cri.id]: { score: prev[cri.id]?.score ?? 5, note: e.target.value },
                                  }))
                                }
                                placeholder="Ghi chú minh chứng kết quả đạt được, số liệu, dự án..."
                                className="w-full h-9 bg-white border border-slate-200 rounded-sm px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* General Self Comment */}
            <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-none space-y-3">
              <label className="block text-xs font-bold text-slate-900">
                Báo Cáo Tổng Hợp Thành Tích & Đóng Góp Nổi Bật Trong Kỳ *
              </label>
              <textarea
                required
                rows={4}
                value={selfComment}
                onChange={(e) => setSelfComment(e.target.value)}
                placeholder="Tóm tắt những thành tích nổi bật, sáng kiến đã áp dụng, khó khăn đã vượt qua hoặc các mục tiêu đề xuất cho kỳ tiếp theo..."
                className="w-full bg-white border border-slate-200 rounded-sm p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  Trạng thái:{' '}
                  <span className="font-semibold text-slate-900">
                    {myReview?.status === 'COMPLETED'
                      ? 'Đã duyệt xong'
                      : myReview?.status === 'SUBMITTED'
                      ? 'Đã nộp, đang chờ quản lý đánh giá'
                      : 'Bản nháp / Chưa nộp'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={selfSubmitting}
                  className="px-5 py-2 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-none disabled:opacity-50"
                >
                  {selfSubmitting ? 'Đang lưu hệ thống...' : 'Nộp Bản Tự Đánh Giá (Lưu Điểm Trọng Số)'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: MANAGER REVIEW LIST */}
      {activeTab === 'manager' && isHR && (
        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-none">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span>Danh Sách Đánh Giá Của Quản Lý & Phê Duyệt KPI</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Chấm điểm đối chiếu theo từng tiêu chí, hệ thống tự động tính xếp loại và hỗ trợ hiệu chỉnh.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Mã & Họ Tên</th>
                  <th className="px-5 py-3.5">Phòng ban & Vị trí</th>
                  <th className="px-5 py-3.5 text-center">Điểm Tự Chấm</th>
                  <th className="px-5 py-3.5 text-center">Điểm Quản Lý</th>
                  <th className="px-5 py-3.5 text-center">Xếp Loại</th>
                  <th className="px-5 py-3.5 text-center">Trạng Thái</th>
                  <th className="px-5 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      Chưa có nhân viên nào gửi bản tự đánh giá trong kỳ này.
                    </td>
                  </tr>
                ) : (
                  reviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{rev.employee?.fullName}</div>
                        <div className="text-[11px] font-mono text-blue-600">{rev.employee?.employeeCode}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">{rev.employee?.department}</div>
                        <div className="text-[11px] text-slate-500">{rev.employee?.position}</div>
                      </td>
                      <td className="px-5 py-4 text-center font-mono font-bold text-amber-600">
                        {rev.totalSelfScore ? `${rev.totalSelfScore.toFixed(2)} ★` : rev.selfScore ? `${rev.selfScore} ★` : '---'}
                      </td>
                      <td className="px-5 py-4 text-center font-mono font-bold text-blue-600">
                        {rev.totalMgrScore ? `${rev.totalMgrScore.toFixed(2)} ★` : rev.mgrScore ? `${rev.mgrScore} ★` : '---'}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {getRatingBadge(rev.finalRating || rev.autoRating)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[10px] font-bold ${
                            rev.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {rev.status === 'COMPLETED' ? 'Đã hoàn tất' : 'Chờ quản lý'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleOpenEvaluationModal(rev)}
                          className="px-3.5 py-1.5 rounded-sm bg-white hover:bg-slate-50 text-blue-600 hover:text-blue-700 border border-slate-200 font-semibold text-xs transition-all shadow-none"
                        >
                          {rev.status === 'COMPLETED' ? 'Xem & Chấm Lại' : 'Chấm Điểm Đối Chiếu'}
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

      {/* TAB 3: CALIBRATION & SUMMARY */}
      {activeTab === 'calibration' && isHR && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-none">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng Số Đánh Giá</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {summaryData?.totalReviews || reviews.length}
              </div>
              <div className="text-xs text-slate-500 mt-1">Hồ sơ tham gia trong kỳ</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-none">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tỷ Lệ Hoàn Tất</span>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                {summaryData?.totalReviews
                  ? `${((summaryData.completedReviews / summaryData.totalReviews) * 100).toFixed(0)}%`
                  : '0%'}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {summaryData?.completedReviews || 0} / {summaryData?.totalReviews || reviews.length} đã hoàn tất
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-none">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Điểm Trung Bình Công Ty</span>
              <div className="text-2xl font-extrabold text-blue-600 font-mono mt-1">
                {summaryData?.averageOverallScore || '0.00'} ★
              </div>
              <div className="text-xs text-slate-500 mt-1">Thang điểm 5.0 chuẩn hóa</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-none">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tỷ Lệ Xuất Sắc (A+)</span>
              <div className="text-2xl font-extrabold text-indigo-600 mt-1">
                {summaryData?.ratingDistribution?.EXCELLENT || 0} nhân sự
              </div>
              <div className="text-xs text-slate-500 mt-1">Đáp ứng chuẩn phân bổ Gauss</div>
            </div>
          </div>

          {/* Rating Distribution (Bell Curve) */}
          <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-none space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Phân phối xếp loại toàn doanh nghiệp</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kiểm soát tỷ lệ lạm phát điểm số theo chuẩn doanh nghiệp lớn (Top 10-15% Xuất sắc).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {[
                { key: 'EXCELLENT', label: 'Xuất sắc (A+)', color: 'bg-emerald-500', target: '10 - 15%' },
                { key: 'GOOD', label: 'Tốt (A)', color: 'bg-blue-500', target: '30 - 40%' },
                { key: 'AVERAGE', label: 'Đạt (B)', color: 'bg-indigo-500', target: '35 - 45%' },
                { key: 'NEEDS_IMPROVEMENT', label: 'Cần Cải Thiện (C)', color: 'bg-amber-500', target: '5 - 10%' },
                { key: 'UNSATISFACTORY', label: 'Không Đạt (D)', color: 'bg-rose-500', target: '< 5%' },
              ].map((item) => {
                const count = summaryData?.ratingDistribution?.[item.key] || 0;
                const total = summaryData?.totalReviews || 1;
                const pct = ((count / total) * 100).toFixed(0);

                return (
                  <div key={item.key} className="p-4 rounded-sm bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700">{item.label}</span>
                      <span className="text-xs font-extrabold text-slate-900">{count}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-sm overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Thực tế: {pct}%</span>
                      <span>Mục tiêu: {item.target}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Breakdown & Quick Calibration Table */}
          <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-none">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Bảng Xếp Hạng & Hiệu Chỉnh Xếp Loại (BOD / HR Committee)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thực hiện hiệu chỉnh xếp loại cuối cùng trước khi công bố và liên thông lương thưởng.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                  <tr>
                    <th className="px-5 py-3">Thứ Hạng</th>
                    <th className="px-5 py-3">Nhân Viên</th>
                    <th className="px-5 py-3">Phòng Ban</th>
                    <th className="px-5 py-3 text-center">Điểm Có Trọng Số</th>
                    <th className="px-5 py-3 text-center">Hệ Thống Tự Tính</th>
                    <th className="px-5 py-3 text-center">Xếp Loại Chung Cuộc</th>
                    <th className="px-5 py-3 text-right">Hiệu Chỉnh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviews
                    .sort((a, b) => (b.totalWeightedScore || 0) - (a.totalWeightedScore || 0))
                    .map((rev, index) => (
                      <tr key={rev.id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-3.5 font-bold font-mono text-slate-400">#{index + 1}</td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-slate-900">{rev.employee?.fullName}</span>
                          <span className="block text-[10px] text-blue-600 font-mono">
                            {rev.employee?.employeeCode}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">{rev.employee?.department}</td>
                        <td className="px-5 py-3.5 text-center font-mono font-bold text-blue-700">
                          {rev.totalWeightedScore ? `${rev.totalWeightedScore.toFixed(2)} ★` : '---'}
                        </td>
                        <td className="px-5 py-3.5 text-center">{getRatingBadge(rev.autoRating)}</td>
                        <td className="px-5 py-3.5 text-center">{getRatingBadge(rev.finalRating)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleOpenCalibrateModal(rev)}
                            className="px-3 py-1.5 rounded-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-[11px] transition-all shadow-none"
                          >
                            Hiệu Chỉnh Xếp Loại
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TEMPLATES MANAGEMENT */}
      {activeTab === 'templates' && isHR && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-none">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-600" />
                  <span>Bộ Tiêu Chí Đánh Giá KPI Mẫu Đang Áp Dụng</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cấu trúc phân bổ 4 nhóm chỉ tiêu trọng tâm: Kết quả công việc (50%), Năng lực chuyên môn (20%), Năng lực hành vi (20%), Kỷ luật (10%).
                </p>
              </div>
            </div>

            {selectedCycle?.template ? (
              <div className="space-y-4">
                <div className="p-4 rounded-sm bg-blue-50/60 border border-blue-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{selectedCycle.template.name}</span>
                    <p className="text-xs text-slate-600 mt-0.5">{selectedCycle.template.description}</p>
                  </div>
                  <span className="px-3 py-1 rounded-sm bg-blue-600 text-white font-bold text-xs">
                    Mặc Định Chuẩn 2026
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCycle.template.categories.map((cat, idx) => (
                    <div key={cat.id} className="bg-slate-50/70 border border-slate-200 rounded-sm p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-sm bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-xs text-slate-900">{cat.name}</span>
                        </div>
                        <span className="font-bold text-xs font-mono text-blue-700 px-2 py-0.5 rounded-sm bg-blue-50 border border-blue-200">
                          {(cat.weight * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div className="space-y-2">
                        {cat.criteria.map((cri) => (
                          <div
                            key={cri.id}
                            className="bg-white p-2.5 rounded-sm border border-slate-200/80 text-xs flex items-center justify-between"
                          >
                            <span className="text-slate-800 font-medium">{cri.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono font-semibold">
                              {(cri.weight * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                Chưa có bộ tiêu chí nào được gán cho kỳ đánh giá này.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: MANAGER 2-COLUMN EVALUATION */}
      <Modal
        isOpen={Boolean(evaluatingReview)}
        onClose={() => setEvaluatingReview(null)}
        title={`Chấm Điểm KPI Đối Chiếu 2 Cột - ${evaluatingReview?.employee?.fullName} (${evaluatingReview?.employee?.employeeCode})`}
      >
        <form onSubmit={handleSubmitManagerReview} className="space-y-5 text-xs max-h-[80vh] overflow-y-auto pr-1">
          {/* Employee general note banner */}
          <div className="p-3.5 rounded-sm bg-amber-50/80 border border-amber-200 space-y-1">
            <span className="text-[11px] font-bold text-amber-900 uppercase">
              Báo cáo tự đánh giá của nhân viên:
            </span>
            <p className="text-slate-700 italic">
              "{evaluatingReview?.selfComment || 'Chưa cung cấp báo cáo tự đánh giá'}"
            </p>
          </div>

          {/* Criteria comparisons */}
          <div className="space-y-4">
            {selectedCycle?.template?.categories.map((cat) => (
              <div key={cat.id} className="border border-slate-200 rounded-sm overflow-hidden">
                <div className="bg-slate-100/80 px-4 py-2 flex items-center justify-between font-bold text-slate-800 text-[11px]">
                  <span>{cat.name}</span>
                  <span className="text-blue-600 font-mono">{(cat.weight * 100).toFixed(0)}%</span>
                </div>

                <div className="divide-y divide-slate-100 p-2 space-y-2">
                  {cat.criteria.map((cri) => {
                    const selfItem = evaluatingReview?.scores?.find((s) => s.criteriaId === cri.id);
                    const curMgrScore = mgrCriteriaScores[cri.id]?.score ?? 5;
                    const curMgrNote = mgrCriteriaScores[cri.id]?.note ?? '';

                    return (
                      <div key={cri.id} className="p-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{cri.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {(cri.weight * 100).toFixed(0)}%
                          </span>
                        </div>

                        {/* 2 columns layout */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-2.5 rounded-sm border border-slate-200/80">
                          {/* Col 1: Self */}
                          <div className="space-y-1 border-r border-slate-200 pr-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Nhân viên tự chấm</span>
                            <div className="font-bold text-amber-600 font-mono">
                              {selfItem?.selfScore ? `${selfItem.selfScore} ★` : '5 ★'}
                            </div>
                            {selfItem?.selfNote && (
                              <p className="text-[11px] text-slate-600 italic">"{selfItem.selfNote}"</p>
                            )}
                          </div>

                          {/* Col 2: Manager */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-blue-700 uppercase">Quản lý chấm</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() =>
                                    setMgrCriteriaScores((prev) => ({
                                      ...prev,
                                      [cri.id]: { score: star, note: prev[cri.id]?.note || '' },
                                    }))
                                  }
                                  className={`p-1 rounded border text-[10px] font-bold ${
                                    curMgrScore >= star
                                      ? 'bg-blue-600 border-blue-600 text-white'
                                      : 'bg-white border-slate-200 text-slate-400'
                                  }`}
                                >
                                  {star} ★
                                </button>
                              ))}
                            </div>
                            <input
                              type="text"
                              value={curMgrNote}
                              onChange={(e) =>
                                setMgrCriteriaScores((prev) => ({
                                  ...prev,
                                  [cri.id]: { score: prev[cri.id]?.score ?? 5, note: e.target.value },
                                }))
                              }
                              placeholder="Nhận xét của quản lý..."
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-800"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Auto calculation indicator */}
          <div className="bg-blue-50 border border-blue-200 rounded-sm p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-blue-700 uppercase font-bold block">
                Điểm Trọng Số Quản Lý Tự Tính:
              </span>
              <span className="text-xl font-extrabold text-blue-900 font-mono">
                {liveMgrWeightedScore?.toFixed(2)} ★ / 5.0
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-blue-700 uppercase font-bold block">Đề Xuất Xếp Loại:</span>
              <span className="mt-0.5 inline-block">
                {getRatingBadge(liveMgrWeightedScore ? getAutoRatingFromScore(liveMgrWeightedScore) : 'EXCELLENT')}
              </span>
            </div>
          </div>

          {/* Final Rating Override */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Xếp Loại Chung Cuộc (Có Thể Điều Chỉnh)</label>
            <select
              value={finalRating}
              onChange={(e) => setFinalRating(e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="EXCELLENT">EXCELLENT (Xuất sắc - Vượt kỳ vọng)</option>
              <option value="GOOD">GOOD (Tốt - Hoàn thành chỉ tiêu)</option>
              <option value="AVERAGE">AVERAGE (Đạt yêu cầu - Chuẩn)</option>
              <option value="NEEDS_IMPROVEMENT">NEEDS_IMPROVEMENT (Cần cải thiện)</option>
              <option value="UNSATISFACTORY">UNSATISFACTORY (Không đạt)</option>
            </select>
          </div>

          {/* Manager Comments */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Nhận Xét & Định Hướng Phát Triển Của Quản Lý *
            </label>
            <textarea
              required
              rows={3}
              value={mgrComment}
              onChange={(e) => setMgrComment(e.target.value)}
              placeholder="Ghi nhận điểm mạnh nổi bật, đóng góp và mục tiêu chiến lược trong kỳ tới..."
              className="w-full bg-white border border-slate-300 rounded-sm p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setEvaluatingReview(null)}
              className="px-4 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={mgrSubmitting}
              className="px-5 py-2 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-none disabled:opacity-50"
            >
              {mgrSubmitting ? 'Đang lưu...' : 'Lưu Đánh Giá Có Trọng Số'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CALIBRATION RATING ADJUSTMENT */}
      <Modal
        isOpen={Boolean(calibratingReview)}
        onClose={() => setCalibratingReview(null)}
        title={`Hiệu Chỉnh Xếp Loại - ${calibratingReview?.employee?.fullName}`}
      >
        <form onSubmit={handleSaveCalibration} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-sm border border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-500">Điểm tổng có trọng số:</span>
              <span className="font-bold text-blue-700 font-mono text-sm">
                {calibratingReview?.totalWeightedScore?.toFixed(2)} ★
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Xếp loại tự động:</span>
              {getRatingBadge(calibratingReview?.autoRating)}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Xếp Loại Chung Cuộc Sau Hiệu Chỉnh</label>
            <select
              value={calibratedRating}
              onChange={(e) => setCalibratedRating(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="EXCELLENT">EXCELLENT (Xuất sắc)</option>
              <option value="GOOD">GOOD (Tốt)</option>
              <option value="AVERAGE">AVERAGE (Đạt yêu cầu)</option>
              <option value="NEEDS_IMPROVEMENT">NEEDS_IMPROVEMENT (Cần cải thiện)</option>
              <option value="UNSATISFACTORY">UNSATISFACTORY (Không đạt)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Lý Do / Biên Bản Hiệu Chỉnh (BOD/HR Committee)</label>
            <textarea
              rows={3}
              value={calibrationNote}
              onChange={(e) => setCalibrationNote(e.target.value)}
              placeholder="Ghi chú lý do điều chỉnh sau phiên họp hiệu chỉnh tập trung..."
              className="w-full bg-white border border-slate-300 rounded-sm p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCalibratingReview(null)}
              className="px-4 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={calibrating}
              className="px-5 py-2 rounded-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-none disabled:opacity-50"
            >
              {calibrating ? 'Đang lưu...' : 'Xác Nhận Hiệu Chỉnh'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CREATE CYCLE */}
      <Modal
        isOpen={isCycleModalOpen}
        onClose={() => setIsCycleModalOpen(false)}
        title="Thiết Lập Kỳ Đánh Giá Mới"
      >
        <form onSubmit={handleCreateCycle} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Tên Kỳ Đánh Giá *</label>
            <input
              type="text"
              required
              placeholder="VD: Kỳ Đánh Giá Hiệu Suất Quý 2 / 2026"
              value={cycleTitle}
              onChange={(e) => setCycleTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Áp Dụng Bộ Tiêu Chí Đánh Giá KPI</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name} {tpl.isDefault ? '(Mặc định)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Ngày Bắt Đầu *</label>
              <input
                type="date"
                required
                value={cycleStart}
                onChange={(e) => setCycleStart(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Ngày Kết Thúc *</label>
              <input
                type="date"
                required
                value={cycleEnd}
                onChange={(e) => setCycleEnd(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCycleModalOpen(false)}
              className="px-4 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-none"
            >
              Khởi Tạo Kỳ Đánh Giá
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
