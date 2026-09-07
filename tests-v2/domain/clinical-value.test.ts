import { describe, expect, it } from 'vitest';
import { canRenderClinicalValue, recordClinicalValue, unknownClinicalValue } from '../../src-v2/domain/clinical/clinical-value';

describe('ClinicalValue', () => {
  it('keeps unknown free of fabricated provenance', () => {
    expect(unknownClinicalValue<string>()).toEqual({ state: 'unknown' });
  });

  it('renders polarity only after an explicit present or denied record', () => {
    const present = recordClinicalValue({ state: 'present', source: 'patient', confirmedAt: '2026-09-07T17:00:00-03:00', value: true });
    const denied = recordClinicalValue({ state: 'denied', source: 'patient', confirmedAt: '2026-09-07T17:01:00-03:00' });
    const notInformed = recordClinicalValue({ state: 'not_informed', source: 'patient', confirmedAt: '2026-09-07T17:02:00-03:00' });
    const notAssessed = recordClinicalValue({ state: 'not_assessed', source: 'examination', confirmedAt: '2026-09-07T17:03:00-03:00' });

    expect(canRenderClinicalValue(present)).toBe(true);
    expect(canRenderClinicalValue(denied)).toBe(true);
    expect(canRenderClinicalValue(notInformed)).toBe(false);
    expect(canRenderClinicalValue(notAssessed)).toBe(false);
    expect(canRenderClinicalValue(unknownClinicalValue())).toBe(false);
  });
});
