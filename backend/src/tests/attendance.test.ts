import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { AttendanceService } from '../services/attendance.service.js';

describe('Attendance & Leave Calculation Service (Enterprise Unit Tests)', () => {
  it('should correctly count business days within a single week (Monday to Friday = 5 days)', () => {
    // 2026-10-12 (Monday) to 2026-10-16 (Friday)
    const start = new Date('2026-10-12T00:00:00Z');
    const end = new Date('2026-10-16T00:00:00Z');
    const days = AttendanceService.countBusinessDays(start, end);
    assert.strictEqual(days, 5);
  });

  it('should exclude weekend days (Friday to next Monday = 2 days: Friday & Monday)', () => {
    // 2026-10-16 (Friday) to 2026-10-19 (Monday)
    const start = new Date('2026-10-16T00:00:00Z');
    const end = new Date('2026-10-19T00:00:00Z');
    const days = AttendanceService.countBusinessDays(start, end);
    assert.strictEqual(days, 2);
  });

  it('should return 0 days for weekend-only span (Saturday to Sunday)', () => {
    // 2026-10-17 (Saturday) to 2026-10-18 (Sunday)
    const start = new Date('2026-10-17T00:00:00Z');
    const end = new Date('2026-10-18T00:00:00Z');
    const days = AttendanceService.countBusinessDays(start, end);
    assert.strictEqual(days, 0);
  });

  it('should return 1 day for single business day (Wednesday to Wednesday)', () => {
    // 2026-10-14 (Wednesday)
    const days = AttendanceService.countBusinessDays('2026-10-14', '2026-10-14');
    assert.strictEqual(days, 1);
  });
});
