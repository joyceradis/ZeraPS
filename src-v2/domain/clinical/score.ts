export interface ScoreDefinition<Input extends Record<string, unknown>> {
  readonly id: string;
  readonly required: readonly (keyof Input)[];
  readonly isApplicable: (input: Partial<Input>) => boolean;
  readonly calculate: (input: Input) => number;
}

export interface ScoreEvaluation {
  readonly available: boolean;
  readonly applicable: boolean;
  readonly calculable: boolean;
  readonly result?: number;
  readonly applied: boolean;
}

export function evaluateScore<Input extends Record<string, unknown>>(
  definition: ScoreDefinition<Input> | null,
  input: Partial<Input>,
  applied = false
): ScoreEvaluation {
  if (!definition) return { available: false, applicable: false, calculable: false, applied: false };
  const applicable = definition.isApplicable(input);
  const calculable = applicable && definition.required.every(key => input[key] !== undefined && input[key] !== null);
  if (!calculable) return { available: true, applicable, calculable: false, applied: false };
  const result = definition.calculate(input as Input);
  return { available: true, applicable: true, calculable: true, result, applied };
}

export function applyScore(evaluation: ScoreEvaluation): ScoreEvaluation {
  if (!evaluation.available || !evaluation.applicable || !evaluation.calculable || evaluation.result === undefined) {
    throw new Error('Score cannot be applied before it is applicable and calculable');
  }
  return { ...evaluation, applied: true };
}
