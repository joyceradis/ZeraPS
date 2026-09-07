import type { Attendance } from '../../domain/attendance/attendance';
import type { AttendanceDomainEvent } from '../../domain/attendance/attendance-events';

export interface AttendanceRepository {
  create(attendance: Attendance, events: readonly AttendanceDomainEvent[]): Promise<void>;
  getById(id: string): Promise<Attendance | null>;
  save(attendance: Attendance, events: readonly AttendanceDomainEvent[]): Promise<void>;
  listDrafts(): Promise<readonly Attendance[]>;
  archive(id: string): Promise<void>;
}
