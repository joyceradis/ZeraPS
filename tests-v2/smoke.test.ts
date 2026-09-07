import { describe, expect, it } from 'vitest';
import { ZERA_PS_V2_RUNTIME } from '../src-v2/main';

describe('Zera PS 2.0 runtime isolation', () => {
  it('identifies the V2 runtime as clean-room', () => {
    expect(ZERA_PS_V2_RUNTIME).toBe('clean-room');
  });
});
