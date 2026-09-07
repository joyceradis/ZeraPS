import type { Attendance } from './attendance';

export function admissionIsProtected(attendance: Attendance): boolean {
  return attendance.reassessments.length > 0;
}

export function assertOpenAttendance(attendance: Attendance): void {
  if (attendance.outcome.kind !== 'open') throw new Error('Attendance already has a final outcome');
}
