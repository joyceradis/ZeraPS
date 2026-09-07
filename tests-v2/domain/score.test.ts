import { describe, expect, it } from 'vitest';
import { applyScore, evaluateScore, type ScoreDefinition } from '../../src-v2/domain/clinical/score';

type Input = { eligible: boolean; history: number; ecg: number };
const score: ScoreDefinition<Input> = {
  id: 'reference',
  required: ['eligible', 'history', 'ecg'],
  isApplicable: input => input.eligible === true,
  calculate: input => input.history + input.ecg
};

describe('score lifecycle', () => {
  it('keeps available, applicable, calculable and applied distinct', () => {
    expect(evaluateScore(null, {})).toEqual({ available: false, applicable: false, calculable: false, applied: false });
    expect(evaluateScore(score, { eligible: false }).applicable).toBe(false);
    const incomplete = evaluateScore(score, { eligible: true, history: 0 });
    expect(incomplete.calculable).toBe(false);
    expect(incomplete.result).toBeUndefined();
    const calculated = evaluateScore(score, { eligible: true, history: 0, ecg: 0 });
    expect(calculated).toMatchObject({ calculable: true, result: 0, applied: false });
    expect(applyScore(calculated).applied).toBe(true);
  });

  it('does not convert an incomplete score into zero', () => {
    const incomplete = evaluateScore(score, { eligible: true });
    expect(incomplete.result).not.toBe(0);
    expect(() => applyScore(incomplete)).toThrow(/cannot be applied/);
  });
});
