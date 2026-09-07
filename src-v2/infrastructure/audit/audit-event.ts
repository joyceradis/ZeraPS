import type { AttendanceDomainEvent } from '../../domain/attendance/attendance-events';

export interface AuditEvent {
  readonly id: string;
  readonly attendanceId: string;
  readonly type: AttendanceDomainEvent['type'];
  readonly at: string;
  readonly payload: Readonly<Record<string, unknown>>;
}

export function toAuditEvent(event: AttendanceDomainEvent, id: string): AuditEvent {
  const { type, attendanceId, at, ...payload } = event;
  return { id, attendanceId, type, at, payload };
}
