import { EvaliphyError, EvaliphyErrorCode } from '@evaliphy/core';
import type { EvalInput } from '../../engine/types.js';
import type { AssertionDefinition } from '../../registry.js';
import { BaseLLMMatcher, createLLMDefinition } from '../base/BaseLLMMatcher.js';

export class ToBeRelevantMatcher extends BaseLLMMatcher {
  constructor() {
    super('toBeRelevant');
  }

  override validate(input: EvalInput): void {
    super.validate(input);
    if (!input.query || typeof input.query !== 'string' || input.query.trim() === '') {
      throw new EvaliphyError(
        EvaliphyErrorCode.INVALID_ASSERTION_INPUT,
        'toBeRelevant: input.query is required and must be a non-empty string'
      );
    }
  }
}

export const toBeRelevantDefinition: AssertionDefinition = createLLMDefinition(
  'toBeRelevant',
  ['question', 'response'],
  '0.0 to 1.0, higher is more relevant'
);
