import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { PerformanceService } from '../services/performance.service.js';
import { ActiveDisciplineSummary } from '../types/index.js';

describe('Performance KPI Auto-Metrics & Discipline Verification (Enterprise Unit Tests)', () => {
  it('Case 1: V = 0 and no active discipline -> Suggest Attendance 5, Discipline 5', () => {
    const result = PerformanceService.evaluateViolationMetrics(22, 0, 0, 0, []);
    assert.strictEqual(result.totalCheckIns, 22);
    assert.strictEqual(result.violationIndex, 0);
    assert.strictEqual(result.suggestedAttendanceScore, 5);
    assert.strictEqual(result.hasActiveDiscipline, false);
    assert.strictEqual(result.suggestedDisciplineScore, 5);
    assert.strictEqual(result.suggestedScore, 5);
    assert.strictEqual(result.suggestedRating, 'EXCELLENT');
    assert.match(result.attendanceEvidence, /Đã điểm danh 22 buổi/);
    assert.match(result.attendanceEvidence, /5\/5 sao/);
    assert.match(result.disciplineEvidence, /Chấp hành tốt nội quy/);
  });

  it('Case 2: 0 < V <= 2 -> Suggest Attendance 4', () => {
    // 1 late (1.0) + 1 half-day (0.5) = V=1.5
    const result = PerformanceService.evaluateViolationMetrics(20, 1, 1, 0, []);
    assert.strictEqual(result.violationIndex, 1.5);
    assert.strictEqual(result.suggestedAttendanceScore, 4);
    assert.strictEqual(result.suggestedScore, 4);
    assert.strictEqual(result.suggestedRating, 'GOOD');
  });

  it('Case 3: 2 < V <= 5 -> Suggest Attendance 3', () => {
    // 2 late (2.0) + 1 unpaid day (1.5) = V=3.5 (<= 5)
    const result = PerformanceService.evaluateViolationMetrics(18, 2, 0, 1, []);
    assert.strictEqual(result.violationIndex, 3.5);
    assert.strictEqual(result.suggestedAttendanceScore, 3);
    assert.strictEqual(result.suggestedScore, 3);
    assert.strictEqual(result.suggestedRating, 'AVERAGE');
  });

  it('Case 4: 5 < V <= 8 -> Suggest Attendance 2', () => {
    // 3 late (3.0) + 2 half-days (1.0) + 2 unpaid days (3.0) = V=7.0 (<= 8)
    const result = PerformanceService.evaluateViolationMetrics(15, 3, 2, 2, []);
    assert.strictEqual(result.violationIndex, 7.0);
    assert.strictEqual(result.suggestedAttendanceScore, 2);
    assert.strictEqual(result.suggestedScore, 2);
    assert.strictEqual(result.suggestedRating, 'NEEDS_IMPROVEMENT');
  });

  it('Case 5: V > 8 -> Suggest Attendance 1', () => {
    // 6 late (6.0) + 2 half-days (1.0) + 2 unpaid days (3.0) = V=10.0 (> 8)
    const result = PerformanceService.evaluateViolationMetrics(12, 6, 2, 2, []);
    assert.strictEqual(result.violationIndex, 10.0);
    assert.strictEqual(result.suggestedAttendanceScore, 1);
    assert.strictEqual(result.suggestedScore, 1);
    assert.strictEqual(result.suggestedRating, 'UNSATISFACTORY');
  });

  it('Case 6a: Active discipline (Khiển trách) -> Cap discipline at 3.0', () => {
    const discipline: ActiveDisciplineSummary = {
      id: 'disc-1',
      decisionNumber: 'QĐ-KL-001',
      form: 'Khiển trách',
      penaltyAmount: 500000,
      decisionDate: new Date('2026-09-01'),
      reason: 'Vi phạm quy chế giao tiếp',
    };

    const result = PerformanceService.evaluateViolationMetrics(22, 0, 0, 0, [discipline]);
    assert.strictEqual(result.hasActiveDiscipline, true);
    assert.strictEqual(result.activeDisciplinesCount, 1);
    assert.strictEqual(result.suggestedDisciplineScore, 3);
    assert.strictEqual(result.suggestedScore, 3);
    assert.match(result.disciplineEvidence, /Trần điểm tối đa: 3\/5 sao/);
    assert.match(result.disciplineEvidence, /QĐ-KL-001/);
  });

  it('Case 6b: Active discipline (Cảnh cáo / Hạ bậc) -> Cap discipline at 2.0', () => {
    const discipline: ActiveDisciplineSummary = {
      id: 'disc-2',
      decisionNumber: 'QĐ-KL-002',
      form: 'Cảnh cáo',
      penaltyAmount: 2000000,
      decisionDate: new Date('2026-09-15'),
      reason: 'Vi phạm an toàn thông tin',
    };

    const result = PerformanceService.evaluateViolationMetrics(22, 0, 0, 0, [discipline]);
    assert.strictEqual(result.hasActiveDiscipline, true);
    assert.strictEqual(result.suggestedDisciplineScore, 2);
    assert.strictEqual(result.suggestedScore, 2);
    assert.match(result.disciplineEvidence, /Trần điểm tối đa: 2\/5 sao/);
  });

  it('Case 6c: Active discipline (Buộc thôi việc) -> Cap discipline at 1.0', () => {
    const discipline: ActiveDisciplineSummary = {
      id: 'disc-3',
      decisionNumber: 'QĐ-KL-003',
      form: 'Buộc thôi việc',
      penaltyAmount: 0,
      decisionDate: new Date('2026-10-01'),
      reason: 'Vi phạm nghiêm trọng pháp luật',
    };

    const result = PerformanceService.evaluateViolationMetrics(22, 0, 0, 0, [discipline]);
    assert.strictEqual(result.hasActiveDiscipline, true);
    assert.strictEqual(result.suggestedDisciplineScore, 1);
    assert.strictEqual(result.suggestedScore, 1);
    assert.match(result.disciplineEvidence, /Trần điểm tối đa: 1\/5 sao/);
  });
});
