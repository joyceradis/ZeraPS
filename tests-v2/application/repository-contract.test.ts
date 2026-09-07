import { describe, expect, it } from 'vitest';
import type { Attendance } from '../../src-v2/domain/attendance/attendance';
import type { AttendanceDomainEvent } from '../../src-v2/domain/attendance/attendance-events';
import type { AttendanceRepository } from '../../src-v2/application/repository/attendance-repository';
import { startAttendance } from '../../src-v2/domain/attendance/attendance';

class MemoryRepository implements AttendanceRepository {
  private readonly data = new Map<string, Attendance>();
  async create(attendance: Attendance, _events: readonly AttendanceDomainEvent[]) { this.data.set(attendance.id, attendance); }
  async getById(id: string) { return this.data.get(id) ?? null; }
  async save(attendance: Attendance, _events: readonly AttendanceDomainEvent[]) { this.data.set(attendance.id, attendance); }
  async listDrafts() { return [...this.data.values()]; }
  async archive(id: string) { this.data.delete(id); }
}

describe('AttendanceRepository contract', () => {
  it('persists and retrieves the aggregate without changing it', async () => {
    const repo = new MemoryRepository();
    const started = startAttendance('a1', '2026-09-07T17:00:00-03:00');
    await repo.create(started.attendance, started.events);
    expect(await repo.getById('a1')).toEqual(started.attendance);
  });
});
