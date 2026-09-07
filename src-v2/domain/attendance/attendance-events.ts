import type { AttendanceStage } from './attendance-stage';

export type AttendanceDomainEvent =
  | { type: 'ATTENDANCE_STARTED'; attendanceId: string; at: string }
  | { type: 'STAGE_CHANGED'; attendanceId: string; from: AttendanceStage; to: AttendanceStage; at: string }
  | { type: 'RESULT_RECORDED'; attendanceId: string; resultId: string; at: string }
  | { type: 'REASSESSMENT_STARTED'; attendanceId: string; reassessmentId: string; at: string }
  | { type: 'ADMISSION_CORRECTED'; attendanceId: string; section: string; reason: string; at: string }
  | { type: 'OUTCOME_CHANGED'; attendanceId: string; at: string }
  | { type: 'ATTENDANCE_FINALIZED'; attendanceId: string; at: string };
