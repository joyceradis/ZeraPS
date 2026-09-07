import type { Attendance, Reassessment } from '../domain/attendance/attendance';

function section(title: string, value: string): string {
  const clean = value.trim();
  return clean ? `# ${title}:\n${clean}` : '';
}

function reassessmentSections(item: Reassessment): string[] {
  return [
    section('EM TEMPO (REAVALIAÇÃO)', item.emTempo),
    section('EXAME', item.exam),
    section('EXAMES', item.exams),
    section('HD', item.hd),
    section('CONDUTA', item.conduct)
  ].filter(Boolean);
}

export function buildClinicalDocument(attendance: Attendance): string {
  const a = attendance.admission;
  const hasReassessment = attendance.reassessments.length > 0;
  const parts = [
    a.qp.trim() ? `# QP: "${a.qp.trim()}"` : '',
    section(hasReassessment ? 'HDA (ADMISSÃO)' : 'HDA', a.hda),
    section('HPP', a.hpp),
    section('EXAME', a.exam),
    section('EXAMES', a.exams),
    section('HD', a.hd),
    ...(hasReassessment ? attendance.reassessments.flatMap(reassessmentSections) : []),
    ...(!hasReassessment ? [section('CONDUTA', a.conduct)] : [])
  ];
  return parts.filter(Boolean).join('\n\n');
}
