import { describe, expect, it } from 'vitest';
import { correctAdmission, recordTemporalResult, startAttendance, startReassessment, transitionStage, updateAdmission } from '../../src-v2/domain/attendance/attendance';

const t = (minute: number) => `2026-09-07T17:${String(minute).padStart(2, '0')}:00-03:00`;

describe('Attendance temporal aggregate', () => {
  it('allows only canonical forward stage transitions', () => {
    let state = startAttendance('a1', t(0)).attendance;
    state = transitionStage(state, 'initial_conduct', t(1)).attendance;
    expect(() => transitionStage(state, 'reassessment', t(2))).toThrow(/Illegal stage transition/);
  });

  it('preserves serial results instead of overwriting prior observations', () => {
    let state = startAttendance('a1', t(0)).attendance;
    state = recordTemporalResult(state, { id: 'troponin-1', kind: 'troponin', value: '4', observedAt: t(1), recordedAt: t(2) }).attendance;
    state = recordTemporalResult(state, { id: 'troponin-2', kind: 'troponin', value: '7', observedAt: t(10), recordedAt: t(11) }).attendance;
    expect(state.results.map(result => result.value)).toEqual(['4', '7']);
  });

  it('protects admission after reassessment and requires explicit correction', () => {
    let state = startAttendance('a1', t(0)).attendance;
    state = updateAdmission(state, { hda: 'Dor torácica há 1 hora.' }, t(1)).attendance;
    state = transitionStage(state, 'initial_conduct', t(2)).attendance;
    state = transitionStage(state, 'pending_results', t(3)).attendance;
    state = transitionStage(state, 'reassessment', t(4)).attendance;
    state = startReassessment(state, { id: 'r1', startedAt: t(5), emTempo: 'Paciente reavaliada.', exam: '', exams: '', hd: '', conduct: '' }).attendance;

    expect(() => updateAdmission(state, { hda: 'Texto silenciosamente alterado.' }, t(6))).toThrow(/protected/);
    const corrected = correctAdmission(state, 'hda', 'Dor torácica há 2 horas.', 'Correção de duração informada pela paciente.', t(7));
    expect(corrected.attendance.admission.hda).toContain('2 horas');
    expect(corrected.events[0]?.type).toBe('ADMISSION_CORRECTED');
  });
});
