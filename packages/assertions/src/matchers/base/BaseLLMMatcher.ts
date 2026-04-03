import { EvaliphyError, EvaliphyErrorCode } from '@evaliphy/core';
import { z } from 'zod';
import type { EvalInput } from '../../engine/types.js';
import type { AssertionDefinition } from '../../registry.js';
import { BaseMatcher } from '../base/BaseMatcher.js';

export abstract class BaseLLMMatcher extends BaseMatcher {
  usesLLM = true;

  constructor(public name: string) {
    super();
  }

  validate(input: EvalInput): void {
    if (!input.response || typeof input.response !== 'string' || input.response.trim() === '') {
      throw new EvaliphyError(
        EvaliphyErrorCode.INVALID_ASSERTION_INPUT,
        `${this.name}: input.response is required and must be a non-empty string`
      );
    }
    // Most LLM assertions need either query or context or both.
    // We'll let subclasses override if they have specific needs, 
    // but common ones like relevance/faithfulness need query/context.
  }
}

export function createLLMDefinition(
  name: string,
  inputVariables: string[],
  description: string = '0.0 to 1.0, higher is better'
): AssertionDefinition {
  return {
    name,
    inputVariables,
    outputSchema: {
      fields: [
        { name: 'score', type: 'number', description },
        { name: 'reason', type: 'string', description: 'one sentence explanation' },
        { name: 'passed', type: 'boolean', description: 'true if score meets threshold' },
      ],
      example: { score: 0.9, reason: 'The response meets the criteria.', passed: true },
      zodSchema: z.object({
        score: z.number().min(0).max(1),
        reason: z.string().min(1),
        passed: z.boolean(),
      }),
    },
  };
}
