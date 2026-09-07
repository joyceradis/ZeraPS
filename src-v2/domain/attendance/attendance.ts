import type { AttendanceDomainEvent } from './attendance-events';
import { isAllowedStageTransition, type AttendanceStage } from './attendance-stage';

export type ClinicalSection = 'qp' | 'hda' | 'hpp' | 'exam' | 'exams' | 'hd' | 'conduct';

export type AdmissionRecord = Readonly<Record<ClinicalSection, string>>;

export interface StageHistoryEntry {
  readonly stage: AttendanceStage;
  readonly enteredAt: string;
}

export interface TemporalResult {
  readonly id: string;
  readonly kind: string;
  readonly value: string;
  readonly observedAt: string;
  readonly recordedAt: string;
}

export interface Reassessment {
  readonly id: string;
  readonly startedAt: string;
  readonly emTempo: string;
  readonly exam: string;
  readonly exams: string;
  readonly hd: string;
  readonly conduct: string;
}

export type Outcome =
  | { readonly kind: 'open' }
  | { readonly kind: 'discharge'; readonly at: string }
  | { readonly kind: 'admission'; readonly at: string };

export interface Attendance {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly stage: AttendanceStage;
  readonly stageHistory: readonly StageHistoryEntry[];
  readonly admission: AdmissionRecord;
  readonly results: readonly TemporalResult[];
  readonly reassessments: readonly Reassessment[];
  readonly outcome: Outcome;
}

export interface MutationResult {
  readonly attendance: Attendance;
  readonly events: readonly AttendanceDomainEvent[];
}

export const emptyAdmission = (): AdmissionRecord => ({ qp: '', hda: '', hpp: '', exam: '', exams: '', hd: '', conduct: '' });

export function startAttendance(id: string, at: string): MutationResult {
  const attendance: Attendance = {
    id,
    createdAt: at,
    updatedAt: at,
    stage: 'initial_assessment',
    stageHistory: [{ stage: 'initial_assessment', enteredAt: at }],
    admission: emptyAdmission(),
    results: [],
    reassessments: [],
    outcome: { kind: 'open' }
  };
  return { attendance, events: [{ type: 'ATTENDANCE_STARTED', attendanceId: id, at }] };
}

export function updateAdmission(attendance: Attendance, patch: Partial<AdmissionRecord>, at: string): MutationResult {
  if (attendance.reassessments.length > 0) throw new Error('Admission is protected after reassessment begins');
  return { attendance: { ...attendance, admission: { ...attendance.admission, ...patch }, updatedAt: at }, events: [] };
}

export function transitionStage(attendance: Attendance, to: AttendanceStage, at: string): MutationResult {
  if (!isAllowedStageTransition(attendance.stage, to)) throw new Error(`Illegal stage transition: ${attendance.stage} -> ${to}`);
  return {
    attendance: { ...attendance, stage: to, updatedAt: at, stageHistory: [...attendance.stageHistory, { stage: to, enteredAt: at }] },
    events: [{ type: 'STAGE_CHANGED', attendanceId: attendance.id, from: attendance.stage, to, at }]
  };
}

export function recordTemporalResult(attendance: Attendance, result: TemporalResult): MutationResult {
  if (attendance.results.some(existing => existing.id === result.id)) throw new Error(`Duplicate result id: ${result.id}`);
  return {
    attendance: { ...attendance, updatedAt: result.recordedAt, results: [...attendance.results, result] },
    events: [{ type: 'RESULT_RECORDED', attendanceId: attendance.id, resultId: result.id, at: result.recordedAt }]
  };
}

export function startReassessment(attendance: Attendance, reassessment: Reassessment): MutationResult {
  if (attendance.stage !== 'reassessment') throw new Error('Reassessment requires reassessment stage');
  return {
    attendance: { ...attendance, updatedAt: reassessment.startedAt, reassessments: [...attendance.reassessments, reassessment] },
    events: [{ type: 'REASSESSMENT_STARTED', attendanceId: attendance.id, reassessmentId: reassessment.id, at: reassessment.startedAt }]
  };
}

export function correctAdmission(attendance: Attendance, section: ClinicalSection, value: string, reason: string, at: string): MutationResult {
  if (!reason.trim()) throw new Error('Admission correction requires a reason');
  return {
    attendance: { ...attendance, updatedAt: at, admission: { ...attendance.admission, [section]: value } },
    events: [{ type: 'ADMISSION_CORRECTED', attendanceId: attendance.id, section, reason, at }]
  };
}
