import { describe, expect, it } from 'vitest';
import { buildClinicalDocument } from '../../src-v2/document/document-engine';
import { startAttendance, updateAdmission, transitionStage, startReassessment } from '../../src-v2/domain/attendance/attendance';

describe('clinical document engine', () => {
  it('preserves admission HDA and renders reassessment as EM TEMPO', () => {
    let a = startAttendance('a1', '2026-09-07T17:00:00-03:00').attendance;
    a = updateAdmission(a, { qp: 'DOR TORÁCICA', hda: 'DOR RETROESTERNAL HÁ 1 HORA.', exam: 'BEG, LOTE.' }, '2026-09-07T17:01:00-03:00').attendance;
    a = transitionStage(a, 'initial_conduct', '2026-09-07T17:02:00-03:00').attendance;
    a = transitionStage(a, 'pending_results', '2026-09-07T17:03:00-03:00').attendance;
    a = transitionStage(a, 'reassessment', '2026-09-07T17:04:00-03:00').attendance;
    a = startReassessment(a, { id: 'r1', startedAt: '2026-09-07T17:05:00-03:00', emTempo: 'MANTÉM DOR, HEMODINAMICAMENTE ESTÁVEL.', exam: 'SEM NOVAS ALTERAÇÕES.', exams: 'TROPONINA 4.', hd: 'DOR TORÁCICA A/E.', conduct: 'MANTIDA OBSERVAÇÃO.' }).attendance;
    const text = buildClinicalDocument(a);
    expect(text).toContain('# HDA (ADMISSÃO):\nDOR RETROESTERNAL HÁ 1 HORA.');
    expect(text).toContain('# EM TEMPO (REAVALIAÇÃO):\nMANTÉM DOR, HEMODINAMICAMENTE ESTÁVEL.');
    expect(text).toContain('# CONDUTA:\nMANTIDA OBSERVAÇÃO.');
  });

  it('does not fabricate empty sections or negatives', () => {
    const a = startAttendance('a1', '2026-09-07T17:00:00-03:00').attendance;
    const text = buildClinicalDocument(a);
    expect(text).not.toContain('NEGA');
    expect(text).not.toContain('NORMAL');
  });
});
