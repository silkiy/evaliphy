import { EvaliphyError, EvaliphyErrorCode } from '@evaliphy/core';
import type { EvalInput } from '../../engine/types.js';
import type { AssertionDefinition } from '../../registry.js';
import { BaseLLMMatcher, createLLMDefinition } from '../base/BaseLLMMatcher.js';

export class ToBeGroundedMatcher extends BaseLLMMatcher {
  constructor() {
    super('toBeGrounded');
  }

  override validate(input: EvalInput): void {
    super.validate(input);
    if (!input.context || (Array.isArray(input.context) && input.context.length === 0)) {
      throw new EvaliphyError(
        EvaliphyErrorCode.INVALID_ASSERTION_INPUT,
        'toBeGrounded: input.context is required and must be a non-empty string or array'
      );
    }
  }
}

export const toBeGroundedDefinition: AssertionDefinition = createLLMDefinition(
  'toBeGrounded',
  ['context', 'response'],
  '0.0 to 1.0, higher is more grounded'
);
