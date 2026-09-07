export type AttendanceStage =
  | 'initial_assessment'
  | 'initial_conduct'
  | 'pending_results'
  | 'reassessment'
  | 'final_documentation';

const NEXT_STAGE: Record<AttendanceStage, AttendanceStage | null> = {
  initial_assessment: 'initial_conduct',
  initial_conduct: 'pending_results',
  pending_results: 'reassessment',
  reassessment: 'final_documentation',
  final_documentation: null
};

export function isAllowedStageTransition(from: AttendanceStage, to: AttendanceStage): boolean {
  return NEXT_STAGE[from] === to;
}
