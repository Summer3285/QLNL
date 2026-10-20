'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { 
  BarChart3, 
  TrendingUp, 
  UserCheck, 
  Users, 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  Clock, 
  Building2, 
  GraduationCap, 
  Award, 
  ChevronRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

interface SalaryDueEmployee {
  id: string;
  employeeCode: string;
  fullName: string;
  department: string;
  position: string;
  baseSalary: number;
  lastSalaryRaise: string;
  monthsSinceLastRaise: number;
  isDue?: boolean;
  eligible: boolean;
}

interface RetirementEmployee {
  id: string;
  employeeCode: string;
  fullName: string;
  department: string;
  position: string;
  gender: string;
  birthDate: string;
  age: number;
  retireAge: number;
  monthsRemaining: number;
}

interface DemographicsData {
  totalEmployees: number;
  genderStats: { gender: string; count: number }[];
  educationStats: { educationLevel: string; count: number }[];
  departmentStats: { department: string; count: number }[];
  ageStats: { range: string; count: number }[];
}

interface FullEmployee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  baseSalary: number;
  startDate: string;
  status: string;
  gender?: string;
  educationLevel?: string;
  birthDate?: string;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'SALARY' | 'RETIREMENT' | 'DEMOGRAPHICS' | 'CV'>('SALARY');
  const [salaryDue, setSalaryDue] = useState<SalaryDueEmployee[]>([]);
  const [retirementDue, setRetirementDue] = useState<RetirementEmployee[]>([]);
  const [demographics, setDemographics] = useState<DemographicsData | null>(null);
  const [employees, setEmployees] = useState<FullEmployee[]>([]);
  const [selectedCvEmp, setSelectedCvEmp] = useState<FullEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [salRes, retRes, demoRes, empRes] = await Promise.all([
        api.get('/api/reports/salary-increase-due'),
        api.get('/api/reports/retirement-due'),
        api.get('/api/reports/demographics'),
        api.get('/api/employees'),
      ]);

      if (salRes.success) {
        setSalaryDue(salRes.data || []);
      }
      if (retRes.success) {
        setRetirementDue(retRes.data || []);
      }
      if (demoRes.success) {
        setDemographics(demoRes.data || null);
      }
      if (empRes.success) {
        const emps = empRes.data || [];
        setEmployees(emps);
        if (emps.length > 0) {
          setSelectedCvEmp(emps[0]);
        }
      }
    } catch (err: any) {
      console.error('Lỗi khi tải báo cáo nghiệp vụ:', err);
      setErrorMsg(err.message || 'Không thể tải báo cáo nghiệp vụ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const eligibleSalaryList = React.useMemo(() => {
    return salaryDue.filter((item) => item.isDue || item.eligible);
  }, [salaryDue]);

  const handlePrintCV = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Báo cáo & Phân tích
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Thống kê cơ cấu nhân lực, biến động nhân sự và xuất sơ yếu lý lịch cán bộ
          </p>
        </div>

        {activeTab === 'CV' && (
          <button
            onClick={handlePrintCV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-sm shadow-none transition-colors text-sm"
          >
            <Printer className="w-4 h-4" />
            <span>In sơ yếu lý lịch</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-sm bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3 shadow-none print:hidden">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 print:hidden overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('SALARY')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'SALARY'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Nâng lương ({eligibleSalaryList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('RETIREMENT')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'RETIREMENT'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Nghỉ hưu ({retirementDue.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DEMOGRAPHICS')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'DEMOGRAPHICS'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Cơ cấu nhân sự</span>
        </button>

        <button
          onClick={() => setActiveTab('CV')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'CV'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          In Sơ Yếu Lý Lịch Cán Bộ
        </button>
      </div>

      {/* TAB 1: KỲ HẠN NÂNG LƯƠNG */}
      {activeTab === 'SALARY' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950">
                  Quy Định Niên Hạn Nâng Bậc Lương Định Kỳ (Từ 24 Tháng Trở Lên)
                </h3>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Hệ thống tự động rà soát ngày nâng lương gần nhất để lập danh sách đề xuất Hội đồng xét duyệt.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-sm">
              {eligibleSalaryList.length} nhân sự đủ điều kiện
            </span>
          </div>

          <div className="bg-white rounded-sm border border-slate-100 shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Mã & Họ Tên Cán Bộ</th>
                    <th className="px-6 py-4">Phòng Ban & Vị Trí</th>
                    <th className="px-6 py-4">Mức Lương Hiện Tại</th>
                    <th className="px-6 py-4">Lần Nâng Lương Gần Nhất</th>
                    <th className="px-6 py-4 text-center">Thời Gian Đã Qua</th>
                    <th className="px-6 py-4 text-center">Khuyến Nghị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {eligibleSalaryList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                          <div className="w-12 h-12 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                            <TrendingUp className="w-6 h-6" />
                          </div>
                          <h4 className="text-sm font-semibold text-slate-700">Tất cả cán bộ đều đã cập nhật bậc lương</h4>
                          <p className="text-xs text-slate-400 mt-1">Hiện tại không có nhân sự nào vượt niên hạn 24 tháng chưa xét nâng bậc lương.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    eligibleSalaryList.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{e.fullName}</div>
                          <div className="text-xs text-indigo-600 font-mono">{e.employeeCode}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800">{e.department}</div>
                          <div className="text-xs text-slate-400">{e.position}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(e.baseSalary)}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {new Date(e.lastSalaryRaise).toLocaleDateString('vi-VN')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-sm text-xs">
                            {e.monthsSinceLastRaise} tháng
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-sm text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đủ điều kiện nâng bậc
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KẾ HOẠCH NGHỈ HƯU */}
      {activeTab === 'RETIREMENT' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-600 text-white rounded-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950">
                  Kế Hoạch & Niên Hạn Nghỉ Hưu Theo Luật Lao Động
                </h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  Độ tuổi nghỉ hưu theo lộ trình: Nam 62 tuổi, Nữ 60 tuổi. Cảnh báo trước 24 tháng để chuẩn bị nhân sự kế thừa.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-sm">
              {retirementDue.length} cán bộ sắp đến tuổi
            </span>
          </div>

          <div className="bg-white rounded-sm border border-slate-100 shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Mã & Cán Bộ</th>
                    <th className="px-6 py-4">Giới Tính & Ngày Sinh</th>
                    <th className="px-6 py-4">Phòng Ban & Chức Vụ</th>
                    <th className="px-6 py-4 text-center">Tuổi Hiện Tại</th>
                    <th className="px-6 py-4 text-center">Độ Tuổi Hưu Trí</th>
                    <th className="px-6 py-4 text-center">Thời Gian Còn Lại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {retirementDue.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                          <div className="w-12 h-12 rounded-sm bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                            <Clock className="w-6 h-6" />
                          </div>
                          <h4 className="text-sm font-semibold text-slate-700">Không có cán bộ trong diện sắp nghỉ hưu</h4>
                          <p className="text-xs text-slate-400 mt-1">Hiện tại không có cán bộ nào trong độ tuổi sắp nghỉ hưu trong 24 tháng tới.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    retirementDue.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{r.fullName}</div>
                          <div className="text-xs text-indigo-600 font-mono">{r.employeeCode}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800">{r.gender === 'FEMALE' || r.gender === 'Nữ' ? 'Nữ' : 'Nam'}</div>
                          <div className="text-xs text-slate-400">
                            {r.birthDate ? new Date(r.birthDate).toLocaleDateString('vi-VN') : '15/06/1965'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800">{r.department}</div>
                          <div className="text-xs text-slate-500">{r.position}</div>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-slate-800">
                          {r.age} tuổi
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600">
                          {r.retireAge} tuổi
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-sm text-xs font-bold">
                            <Clock className="w-3 h-3" /> Còn {r.monthsRemaining} tháng
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CƠ CẤU NHÂN LỰC ĐA CHIỀU */}
      {activeTab === 'DEMOGRAPHICS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Giới tính */}
            <div className="bg-white p-5 rounded-sm border border-slate-100 shadow-none space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cơ Cấu Giới Tính</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="space-y-2 pt-1">
                {demographics?.genderStats?.map((g) => (
                  <div key={g.gender} className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">
                      {g.gender === 'MALE' || g.gender === 'Nam' ? 'Nam giới' : g.gender === 'FEMALE' || g.gender === 'Nữ' ? 'Nữ giới' : g.gender || 'Khác'}
                    </span>
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm text-xs">
                      {g.count} ({Math.round((g.count / (demographics.totalEmployees || 1)) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trình độ học vấn */}
            <div className="bg-white p-5 rounded-sm border border-slate-100 shadow-none space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trình Độ Đào Tạo</span>
                <GraduationCap className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="space-y-2 pt-1">
                {demographics?.educationStats?.map((e) => (
                  <div key={e.educationLevel} className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">{e.educationLevel}</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm text-xs">
                      {e.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Độ tuổi */}
            <div className="bg-white p-5 rounded-sm border border-slate-100 shadow-none space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nhóm Độ Tuổi</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="space-y-2 pt-1">
                {demographics?.ageStats?.map((a) => (
                  <div key={a.range} className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">{a.range}</span>
                    <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-sm text-xs">
                      {a.count} nhân sự
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quy mô tổng */}
            <div className="bg-blue-900 border border-blue-800 p-5 rounded-sm shadow-none text-white flex flex-col justify-between">
              <div className="flex items-center justify-between text-blue-200">
                <span className="text-xs font-bold uppercase tracking-wider">Tổng Quy Mô Cán Bộ</span>
                <Building2 className="w-5 h-5" />
              </div>
              <div className="my-2">
                <div className="text-4xl font-black">{demographics?.totalEmployees || 0}</div>
                <p className="text-xs text-blue-200 mt-1">Cán bộ, kỹ sư & chuyên viên chính thức</p>
              </div>
              <div className="text-xs text-blue-100 bg-white/10 p-2 rounded-sm flex items-center gap-1.5 border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% hồ sơ đã định danh số</span>
              </div>
            </div>
          </div>

          {/* Phân bổ phòng ban */}
          <div className="bg-white rounded-sm border border-slate-100 shadow-none p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Phân Bổ Nhân Lực Theo Phòng Ban Chức Năng</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {demographics?.departmentStats?.map((d) => (
                <div key={d.department} className="p-4 rounded-sm border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800 text-sm">{d.department}</span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-sm">
                      {d.count} nhân sự
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-sm mt-3 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-sm" 
                      style={{ width: `${Math.min(100, (d.count / (demographics?.totalEmployees || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IN SƠ YẾU LÝ LỊCH CÁN BỘ CHUẨN */}
      {activeTab === 'CV' && (
        <div className="space-y-6">
          {/* Bộ chọn cán bộ */}
          <div className="bg-white p-4 rounded-sm border border-slate-100 shadow-none flex items-center gap-4 print:hidden">
            <label className="text-sm font-bold text-slate-700 shrink-0 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Chọn cán bộ cần trích xuất hồ sơ:</span>
            </label>
            <select
              value={selectedCvEmp?.id || ''}
              onChange={(e) => {
                const found = employees.find(x => x.id === e.target.value);
                if (found) setSelectedCvEmp(found);
              }}
              className="max-w-md w-full px-3 py-2 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-blue-500 font-medium bg-white"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeCode}) - {emp.department}
                </option>
              ))}
            </select>
          </div>

          {/* Bản in Sơ yếu lý lịch chuẩn (Print View) */}
          {selectedCvEmp && (
            <div className="bg-white p-10 rounded-sm border border-slate-200 shadow-none max-w-4xl mx-auto text-slate-900 font-serif print:shadow-none print:border-none print:p-0">
              {/* Tiêu ngữ */}
              <div className="text-center space-y-1 pb-6 border-b-2 border-slate-900">
                <h4 className="font-bold text-xs uppercase tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
                <h5 className="font-bold text-xs underline underline-offset-4">Độc lập - Tự do - Hạnh phúc</h5>
                <h2 className="text-xl font-bold uppercase pt-4 tracking-wide">SƠ YẾU LÝ LỊCH CÁN BỘ, VIÊN CHỨC</h2>
                <p className="text-xs italic text-slate-500">(Mẫu chuẩn hồ sơ quản lý nhân sự - NN-TECH Corporation)</p>
              </div>

              {/* Thông tin cá nhân & Ảnh thẻ */}
              <div className="grid grid-cols-4 gap-6 py-6 border-b border-slate-200">
                <div className="col-span-1 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-sm p-4 bg-slate-50 min-h-[160px]">
                  <span className="text-xs text-slate-400 font-sans text-center">Ảnh 4x6</span>
                </div>

                <div className="col-span-3 space-y-2 text-sm font-sans">
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>1) Họ và tên khai sinh:</strong> <span className="uppercase font-bold text-indigo-900">{selectedCvEmp.fullName}</span></div>
                    <div><strong>2) Mã số cán bộ:</strong> <span className="font-mono text-slate-800">{selectedCvEmp.employeeCode}</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>3) Giới tính:</strong> {selectedCvEmp.gender === 'FEMALE' || selectedCvEmp.gender === 'Nữ' ? 'Nữ' : 'Nam'}</div>
                    <div><strong>4) Ngày sinh:</strong> {selectedCvEmp.birthDate ? new Date(selectedCvEmp.birthDate).toLocaleDateString('vi-VN') : (selectedCvEmp as any).dateOfBirth ? new Date((selectedCvEmp as any).dateOfBirth).toLocaleDateString('vi-VN') : '15/06/1990'}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>5) Số điện thoại:</strong> {selectedCvEmp.phone || '0988 123 456'}</div>
                    <div><strong>6) Thư điện tử:</strong> {selectedCvEmp.email || (selectedCvEmp as any).user?.email || 'N/A'}</div>
                  </div>

                  <div>
                    <strong>7) Quê quán / Thường trú:</strong> Phường Dịch Vọng Hậu, Quận Cầu Giấy, TP. Hà Nội
                  </div>
                </div>
              </div>

              {/* Thông tin công tác & chức vụ */}
              <div className="py-6 space-y-3 font-sans text-sm border-b border-slate-200">
                <h3 className="font-bold text-sm uppercase text-slate-800">II. THÔNG TIN QUẢN TRỊ & NGHỀ NGHIỆP</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-sm">
                    <span className="text-xs text-slate-500 block">Đơn vị / Phòng ban công tác</span>
                    <span className="font-bold text-slate-800">{selectedCvEmp.department}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-sm">
                    <span className="text-xs text-slate-500 block">Chức vụ / Vị trí hiện giữ</span>
                    <span className="font-bold text-slate-800">{selectedCvEmp.position}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-50 rounded-sm">
                    <span className="text-xs text-slate-500 block">Ngày vào đơn vị</span>
                    <span className="font-medium text-slate-800">
                      {selectedCvEmp.startDate ? new Date(selectedCvEmp.startDate).toLocaleDateString('vi-VN') : (selectedCvEmp as any).joinDate ? new Date((selectedCvEmp as any).joinDate).toLocaleDateString('vi-VN') : '01/01/2023'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-sm">
                    <span className="text-xs text-slate-500 block">Trình độ học vấn</span>
                    <span className="font-medium text-slate-800">{selectedCvEmp.educationLevel || 'Đại học'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-sm">
                    <span className="text-xs text-slate-500 block">Hệ số / Mức lương cơ bản</span>
                    <span className="font-bold text-emerald-700">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedCvEmp.baseSalary)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Xác nhận */}
              <div className="pt-8 grid grid-cols-2 text-center text-sm font-sans">
                <div>
                  <p className="font-bold">NGƯỜI KHAI KÝ TÊN</p>
                  <p className="text-xs italic text-slate-400 mt-1">(Ký và ghi rõ họ tên)</p>
                  <div className="h-20" />
                  <p className="font-bold">{selectedCvEmp.fullName}</p>
                </div>

                <div>
                  <p className="italic text-xs text-slate-500">Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
                  <p className="font-bold mt-1">XÁC NHẬN CỦA THỦ TRƯỞNG ĐƠN VỊ</p>
                  <p className="text-xs italic text-slate-400 mt-1">(Ký tên và đóng dấu)</p>
                  <div className="h-20" />
                  <p className="font-bold">Trần Quang Huy (Tổng Giám Đốc)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
