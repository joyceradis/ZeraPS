export type ClinicalSource =
  | 'patient'
  | 'companion'
  | 'examination'
  | 'laboratory'
  | 'imaging'
  | 'external_document'
  | 'physician_synthesis';

export type ClinicalInformationState =
  | 'unknown'
  | 'present'
  | 'denied'
  | 'not_informed'
  | 'not_assessed';

export interface UnknownClinicalValue {
  readonly state: 'unknown';
}

export interface ExplicitClinicalValue<T> {
  readonly state: 'present' | 'denied';
  readonly value?: T;
  readonly source: ClinicalSource;
  readonly observedAt?: string;
  readonly confirmedAt: string;
}

export interface MissingClinicalValue {
  readonly state: 'not_informed' | 'not_assessed';
  readonly source: ClinicalSource;
  readonly confirmedAt: string;
}

export type ClinicalValue<T> = UnknownClinicalValue | ExplicitClinicalValue<T> | MissingClinicalValue;

export function unknownClinicalValue<T>(): ClinicalValue<T> {
  return { state: 'unknown' };
}

export function recordClinicalValue<T>(input: {
  state: Exclude<ClinicalInformationState, 'unknown'>;
  source: ClinicalSource;
  confirmedAt: string;
  value?: T;
  observedAt?: string;
}): ClinicalValue<T> {
  if (input.state === 'present' || input.state === 'denied') {
    return {
      state: input.state,
      ...(input.value === undefined ? {} : { value: input.value }),
      source: input.source,
      ...(input.observedAt === undefined ? {} : { observedAt: input.observedAt }),
      confirmedAt: input.confirmedAt
    };
  }
  return { state: input.state, source: input.source, confirmedAt: input.confirmedAt };
}

export function canRenderClinicalValue<T>(value: ClinicalValue<T>): value is ExplicitClinicalValue<T> {
  return value.state === 'present' || value.state === 'denied';
}
