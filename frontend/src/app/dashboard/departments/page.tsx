'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import { Department, EmployeeProfile } from '../../../types';
import { formatVND } from '../../../lib/utils';
import Modal from '../../../components/Modal';
import {
  Building2,
  Users,
  ShieldCheck,
  Crown,
  Briefcase,
  MapPin,
  DollarSign,
  Plus,
  Edit2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Network,
  LayoutGrid,
  List,
  Search,
  UserCheck,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Maximize2,
  Minimize2,
  Info,
} from 'lucide-react';

export default function DepartmentsPage() {
  const { isHR, isAdmin } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allEmployees, setAllEmployees] = useState<EmployeeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'orgchart'>('cards');
  const [search, setSearch] = useState('');

  // Selected Department for Detail Modal
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  // Modal Create/Edit Department
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [expandedDeptIds, setExpandedDeptIds] = useState<Set<string>>(new Set());
  const [deptForm, setDeptForm] = useState({
    code: '',
    name: '',
    description: '',
    location: '',
    budget: 3000000000,
    managerId: '',
    deputyId: '',
    sortOrder: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const toggleExpandDept = (id: string) => {
    setExpandedDeptIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedDeptIds(new Set(departments.map((d) => d.id)));
  };

  const handleCollapseAll = () => {
    setExpandedDeptIds(new Set());
  };

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/departments');
      if (res.success && res.data) {
        setDepartments(res.data);
      }

      // Fetch all employees for manager selection
      const empRes = await api.get('/api/employees');
      if (empRes.success && empRes.data) {
        setAllEmployees(empRes.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách phòng ban:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const totalEmployees = departments.reduce((acc, curr) => acc + (curr.totalEmployees || 0), 0);
  const totalLeadership = departments.reduce((acc, curr) => acc + (curr.leadershipCount || 0), 0);
  const totalStaff = departments.reduce((acc, curr) => acc + (curr.staffCount || 0), 0);
  const totalBudget = departments.reduce((acc, curr) => acc + (curr.budget || 0), 0);

  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase()) ||
    d.manager?.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreateModal = () => {
    setEditingDept(null);
    setDeptForm({
      code: `PB-${String.fromCharCode(65 + departments.length)}`,
      name: '',
      description: '',
      location: 'Tòa nhà NexNova Tower, Hà Nội',
      budget: 3000000000,
      managerId: '',
      deputyId: '',
      sortOrder: departments.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept: Department) => {
    setEditingDept(dept);
    setDeptForm({
      code: dept.code,
      name: dept.name,
      description: dept.description || '',
      location: dept.location || '',
      budget: dept.budget || 0,
      managerId: dept.managerId || '',
      deputyId: dept.deputyId || '',
      sortOrder: dept.sortOrder || 0,
    });
    setIsModalOpen(true);
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingDept) {
        const res = await api.put(`/api/departments/${editingDept.id}`, deptForm);
        if (res.success) {
          setIsModalOpen(false);
          fetchDepartments();
        }
      } else {
        const res = await api.post('/api/departments', deptForm);
        if (res.success) {
          setIsModalOpen(false);
          fetchDepartments();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu thông tin phòng ban.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Phòng ban
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cơ cấu tổ chức bộ máy, chức năng nhiệm vụ và định biên nhân sự
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-0.5 rounded-sm flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-700 shadow-none'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Thẻ</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-none'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Bảng</span>
            </button>
            <button
              onClick={() => setViewMode('orgchart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                viewMode === 'orgchart'
                  ? 'bg-white text-blue-700 shadow-none'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Sơ đồ</span>
            </button>
          </div>

          {isHR && (
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-none"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm phòng ban</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-sm p-4 shadow-none">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-500">Phòng ban</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{departments.length}</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-sm p-4 shadow-none">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-500">Lãnh đạo / Quản lý</span>
            <Crown className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{totalLeadership}</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-sm p-4 shadow-none">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-500">Nhân viên</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{totalStaff}</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-sm p-4 shadow-none">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-500">Ngân sách năm</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-emerald-700 font-mono mt-1">
            {formatVND(totalBudget)}
          </div>
        </div>
      </div>

      {/* Search Bar for Cards and Table View */}
      {viewMode !== 'orgchart' && (
        <div className="bg-white border border-slate-200 rounded-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-none">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã phòng, trưởng phòng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-sm pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Hiển thị: <span className="font-bold text-slate-900">{filteredDepartments.length}</span> phòng ban
          </div>
        </div>
      )}

      {/* VIEW MODE 1: STREAMLINED DEPARTMENT CARDS */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDepartments.map((dept) => {
            const manager = dept.manager;

            return (
              <div
                key={dept.id}
                onClick={() => setSelectedDept(dept)}
                className="bg-white border border-slate-200 rounded-sm p-5 shadow-none hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Top row: Code + Location + Edit Button */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-sm text-xs font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {dept.code}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {dept.location || 'Hà Nội'}
                      </span>
                    </div>

                    {isHR && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(dept);
                        }}
                        className="p-1 rounded-sm text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Sửa phòng ban"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Department Name & Description */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {dept.name}
                  </h3>
                  {dept.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {dept.description}
                    </p>
                  )}

                  {/* Department Head (Compact Row) */}
                  <div className="flex items-center gap-2.5 py-3 border-t border-b border-slate-100 my-3.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold flex items-center justify-center text-xs shrink-0">
                      {manager
                        ? manager.fullName.slice(0, 2).toUpperCase()
                        : <UserCheck className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {manager ? manager.fullName : <span className="text-slate-400 italic font-normal">Chưa bổ nhiệm Trưởng phòng</span>}
                      </div>
                      {manager && (
                        <div className="text-[11px] text-slate-500 truncate">
                          {manager.position || 'Trưởng phòng'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{dept.totalEmployees || 0} nhân sự</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block leading-tight">Quỹ lương</span>
                    <span className="text-xs font-semibold font-mono text-slate-900">
                      {formatVND(dept.totalSalaryMonthly || 0)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredDepartments.length === 0 && (
            <div className="col-span-full bg-white border border-slate-200 rounded-sm p-8 text-center text-sm text-slate-400">
              Không tìm thấy phòng ban phù hợp.
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="px-5 py-3">Mã phòng</th>
                  <th className="px-5 py-3">Tên phòng ban</th>
                  <th className="px-5 py-3">Trưởng phòng</th>
                  <th className="px-5 py-3">Địa điểm</th>
                  <th className="px-5 py-3 text-center">Nhân sự</th>
                  <th className="px-5 py-3 text-right">Quỹ lương tháng</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDepartments.map((dept) => (
                  <tr
                    key={dept.id}
                    onClick={() => setSelectedDept(dept)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono font-semibold text-blue-600">
                      {dept.code}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      <div>{dept.name}</div>
                      {dept.description && (
                        <div className="text-[11px] text-slate-400 font-normal line-clamp-1">
                          {dept.description}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {dept.manager ? (
                        <div>
                          <div className="font-medium text-slate-800">{dept.manager.fullName}</div>
                          <div className="text-[11px] text-slate-400">{dept.manager.position}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa bổ nhiệm</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {dept.location || 'Hà Nội'}
                    </td>
                    <td className="px-5 py-3.5 text-center font-semibold text-slate-800">
                      {dept.totalEmployees || 0}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-semibold text-slate-900">
                      {formatVND(dept.totalSalaryMonthly || 0)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedDept(dept)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                          title="Xem chi tiết"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        {isHR && (
                          <button
                            onClick={() => handleOpenEditModal(dept)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                            title="Sửa phòng ban"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDepartments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                      Không tìm thấy phòng ban phù hợp với từ khóa tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: INTERACTIVE ORG CHART */}
      {viewMode === 'orgchart' && (
        <div className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 shadow-none space-y-6">
          {/* Org Chart Controls & Guide */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Nhấp vào <strong>Mở rộng cơ cấu</strong> tại mỗi phòng ban để xem chi tiết cây phân cấp Lãnh đạo & Nhân viên trực thuộc.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleExpandAll}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Mở rộng tất cả</span>
              </button>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Thu gọn tất cả</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto pb-6">
            <div className="min-w-[960px] flex flex-col items-center space-y-8">
              {/* Level 1: Executive Board */}
              <div className="flex flex-col items-center">
                <div className="bg-slate-900 text-white p-5 rounded-sm shadow-sm border border-slate-800 text-center w-84">
                  <Crown className="w-6 h-6 text-amber-400 mx-auto mb-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Hội Đồng Quản Trị & Ban Điều Hành
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-1">
                    Ban Tổng Giám Đốc (CEO / BOD)
                  </h3>
                  <div className="mt-2.5 pt-2 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-center gap-2">
                    <span className="font-semibold text-amber-300">Trần Quang Huy</span>
                    <span className="text-slate-500">•</span>
                    <span>Quyền Tổng Giám Đốc</span>
                  </div>
                </div>

                {/* Vertical connector line */}
                <div className="w-0.5 h-8 bg-slate-300" />
              </div>

              {/* Level 2: Departments Horizontal Branch */}
              <div className="relative w-full">
                {/* Horizontal line connecting all departments */}
                <div className="absolute top-0 left-16 right-16 h-0.5 bg-slate-300" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 pt-8 items-start">
                  {departments.map((dept) => {
                    const isExpanded = expandedDeptIds.has(dept.id);
                    const manager = dept.manager;
                    const deputy = dept.deputy;
                    const leadership = dept.leadership || [];
                    const staff = dept.staff || [];

                    return (
                      <div key={dept.id} className="flex flex-col items-center relative">
                        {/* Vertical drop line */}
                        <div className="absolute -top-8 w-0.5 h-8 bg-slate-300" />

                        {/* Department Node Card */}
                        <div
                          className={`w-full bg-white border rounded-sm p-4 text-center space-y-3 transition-all ${
                            isExpanded
                              ? 'border-blue-500 ring-1 ring-blue-500/20 shadow-sm'
                              : 'border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200">
                              {dept.code}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">
                              {dept.totalEmployees || 0} NS
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {dept.name}
                          </h4>

                          {/* Head of department */}
                          <div className="pt-2 border-t border-slate-100 text-xs bg-slate-50 p-2.5 rounded-sm text-left">
                            <span className="text-[9px] font-bold text-amber-700 uppercase block tracking-wider">
                              Trưởng phòng
                            </span>
                            <div className="font-semibold text-slate-900 truncate mt-0.5">
                              {manager?.fullName || (
                                <span className="text-slate-400 font-normal italic">Chưa bổ nhiệm</span>
                              )}
                            </div>
                            {manager && (
                              <div className="text-[10px] font-mono text-slate-500">
                                {manager.employeeCode}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-1 flex items-center justify-between gap-1.5 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setSelectedDept(dept)}
                              className="flex-1 py-1 px-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
                            >
                              Hồ sơ 360°
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleExpandDept(dept.id)}
                              className={`py-1 px-2 rounded-sm text-[11px] font-medium transition-colors flex items-center gap-1 ${
                                isExpanded
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                              }`}
                              title={isExpanded ? 'Thu gọn phân cấp' : 'Mở rộng phân cấp'}
                            >
                              <span>{isExpanded ? 'Thu gọn' : 'Phân cấp'}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Level 3: Expanded Sub-Tree for this Department */}
                        {isExpanded && (
                          <div className="w-full flex flex-col items-center mt-3 animate-in fade-in duration-200">
                            {/* Branch connector */}
                            <div className="w-0.5 h-5 bg-blue-400" />

                            <div className="w-full bg-slate-50 border border-blue-200 rounded-sm p-3 space-y-3">
                              {/* Leadership sub-group */}
                              <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1 mb-1.5">
                                  <Crown className="w-3 h-3 text-amber-600" />
                                  <span>Lãnh đạo & Quản lý ({leadership.length})</span>
                                </div>

                                {leadership.length === 0 ? (
                                  <div className="text-[10px] text-slate-400 italic bg-white p-1.5 rounded-sm border border-slate-200">
                                    Chưa có cán bộ quản lý
                                  </div>
                                ) : (
                                  <div className="space-y-1.5">
                                    {leadership.map((cadre) => (
                                      <div
                                        key={cadre.id}
                                        className="bg-amber-50/70 border border-amber-200/80 rounded-sm p-1.5 text-left text-[11px]"
                                      >
                                        <div className="font-semibold text-slate-900 truncate">
                                          {cadre.fullName}
                                        </div>
                                        <div className="text-[10px] text-amber-900 truncate">
                                          {cadre.position}
                                        </div>
                                        <div className="text-[9px] font-mono text-slate-500">
                                          {cadre.employeeCode}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Staff sub-group */}
                              <div className="pt-2 border-t border-slate-200">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1 mb-1.5">
                                  <Users className="w-3 h-3 text-blue-600" />
                                  <span>Đội ngũ nhân sự ({staff.length})</span>
                                </div>

                                {staff.length === 0 ? (
                                  <div className="text-[10px] text-slate-400 italic bg-white p-1.5 rounded-sm border border-slate-200">
                                    Chưa có nhân sự
                                  </div>
                                ) : (
                                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                                    {staff.map((st) => (
                                      <div
                                        key={st.id}
                                        className="bg-white border border-slate-200 rounded-sm p-1.5 text-left text-[11px]"
                                      >
                                        <div className="font-medium text-slate-800 truncate">
                                          {st.fullName}
                                        </div>
                                        <div className="text-[10px] text-slate-500 truncate">
                                          {st.position}
                                        </div>
                                        <div className="text-[9px] font-mono text-blue-600">
                                          {st.employeeCode}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DEPARTMENT DETAIL (Members Breakdown) */}
      <Modal
        isOpen={Boolean(selectedDept)}
        onClose={() => setSelectedDept(null)}
        title={`Cơ Cấu Nhân Sự - ${selectedDept?.name} (${selectedDept?.code})`}
      >
        <div className="space-y-6 text-xs max-h-[80vh] overflow-y-auto pr-1">
          {/* Dept info header */}
          <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 font-medium">Mã phòng ban: {selectedDept?.code}</span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">{selectedDept?.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{selectedDept?.description}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Địa điểm làm việc</span>
              <span className="font-semibold text-slate-800">{selectedDept?.location || 'Hà Nội'}</span>
            </div>
          </div>

          {/* Section 1: Cán bộ Lãnh đạo & Quản lý */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h5 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>LÃNH ĐẠO & QUẢN LÝ ({selectedDept?.leadership?.length || 0})</span>
              </h5>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200">
                Khối Quản Lý
              </span>
            </div>

            {selectedDept?.leadership && selectedDept.leadership.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedDept.leadership.map((cadre) => (
                  <div
                    key={cadre.id}
                    className="p-3.5 rounded-sm border border-slate-200 bg-white space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{cadre.fullName}</span>
                      <span className="text-[10px] font-mono text-blue-600 font-semibold">{cadre.employeeCode}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">{cadre.position}</div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                      <span>Cấp bậc: {cadre.cadreType === 'LEADERSHIP' ? 'Lãnh đạo' : 'Quản lý'}</span>
                      <span className="font-mono">{formatVND(cadre.baseSalary)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 italic text-center py-4 bg-slate-50 rounded-sm">
                Chưa có cán bộ lãnh đạo phụ trách.
              </div>
            )}
          </div>

          {/* Section 2: Đội ngũ Nhân viên */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h5 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>NHÂN VIÊN CHUYÊN MÔN ({selectedDept?.staff?.length || 0})</span>
              </h5>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-200">
                Khối Chuyên Môn
              </span>
            </div>

            {selectedDept?.staff && selectedDept.staff.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-sm overflow-hidden bg-white">
                {selectedDept.staff.map((staff) => (
                  <div key={staff.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{staff.fullName}</div>
                      <div className="text-[11px] text-slate-500">{staff.position}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-mono text-blue-600 font-semibold block">
                        {staff.employeeCode}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatVND(staff.baseSalary)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 italic text-center py-4 bg-slate-50 rounded-sm">
                Chưa có nhân viên chuyên môn trực thuộc.
              </div>
            )}
          </div>

          <div className="pt-3 flex justify-end border-t border-slate-200">
            <button
              onClick={() => setSelectedDept(null)}
              className="px-4 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: CREATE / EDIT DEPARTMENT */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? `Chỉnh Sửa Phòng Ban - ${editingDept.name}` : 'Thêm Mới Phòng Ban'}
      >
        <form onSubmit={handleSaveDepartment} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Mã Phòng Ban *</label>
              <input
                type="text"
                required
                disabled={Boolean(editingDept)}
                placeholder="VD: PB-TECH, PB-HR..."
                value={deptForm.code}
                onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-sm text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Tên Phòng Ban *</label>
              <input
                type="text"
                required
                placeholder="VD: Software Engineering..."
                value={deptForm.name}
                onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Mô Tả Chức Năng & Nhiệm Vụ</label>
            <textarea
              rows={2}
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              placeholder="Chức năng nhiệm vụ chính của phòng ban..."
              className="w-full bg-white border border-slate-300 rounded-sm p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Địa Điểm / Tầng Làm Việc</label>
              <input
                type="text"
                value={deptForm.location}
                onChange={(e) => setDeptForm({ ...deptForm, location: e.target.value })}
                placeholder="VD: Tầng 18, Tòa nhà NexNova"
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Ngân sách hoạt động năm (VNĐ)</label>
              <input
                type="number"
                value={deptForm.budget}
                onChange={(e) => setDeptForm({ ...deptForm, budget: Number(e.target.value) })}
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-sm text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Bổ Nhiệm Trưởng Phòng</label>
              <select
                value={deptForm.managerId}
                onChange={(e) => setDeptForm({ ...deptForm, managerId: e.target.value })}
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Chưa chỉ định --</option>
                {allEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employeeCode}) - {emp.position}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Bổ Nhiệm Phó Phòng</label>
              <select
                value={deptForm.deputyId}
                onChange={(e) => setDeptForm({ ...deptForm, deputyId: e.target.value })}
                className="w-full h-9 bg-white border border-slate-300 rounded-sm px-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Chưa chỉ định --</option>
                {allEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employeeCode}) - {emp.position}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3.5 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="h-9 px-4 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-9 px-4 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-none disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Đang lưu...' : editingDept ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
