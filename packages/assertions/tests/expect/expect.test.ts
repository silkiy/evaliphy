import { getConfig } from '@evaliphy/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssertionEngine } from '../../src/engine/AssertionEngine.js';
import type { EvalInput, EvaluationSample } from '../../src/engine/types.js';
import { expect as evaliphyExpect } from '../../src/expect/expect.js';

// Mock @evaliphy/ai BEFORE importing expect
vi.mock('@evaliphy/ai', () => ({
  createLLMClient: vi.fn().mockReturnValue({
    generateObject: vi.fn(),
    generateText: vi.fn(),
  }),
}));

vi.mock('../../src/engine/AssertionEngine.js', () => ({
  AssertionEngine: {
    run: vi.fn(),
  },
}));

vi.mock('@evaliphy/core', async () => {
  const actual = await vi.importActual('@evaliphy/core');
  return {
    ...actual,
    getConfig: vi.fn(),
    ConfigLoader: {
      getInstance: vi.fn().mockReturnValue({
        cachedConfig: {
          llmAsJudgeConfig: {
            provider: 'openai',
            apiKey: 'test-key',
          },
        },
      }),
    },
  };
});

describe('expect() and MatcherChain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getConfig as any).mockReturnValue({
      llmAsJudgeConfig: {
        provider: 'openai',
        apiKey: 'test-key',
      },
    });
  });

  it('should support the professional AnswerEvalInput signature', async () => {
    const input: EvaluationSample = {
      response: "You can find your API key in the dashboard.",
      query: "Where is my API key?",
      context: "API keys are located in the 'Settings > API' section of the user dashboard.",
    };

    (AssertionEngine.run as any).mockResolvedValue({
      passed: true,
      score: 1.0,
      reason: 'Perfect match',
      assertion: 'toBeFaithful',
    });

    await evaliphyExpect<EvaluationSample>(input).toBeFaithful();

    expect(AssertionEngine.run).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        input: expect.objectContaining({
          query: "Where is my API key?",
        }),
      })
    );
  });

  it('should return EvalResult when returnResult option is true', async () => {
    const input: EvaluationSample = {
      response: "Response",
      query: "Query",
    };

    (AssertionEngine.run as any).mockResolvedValue({
      passed: true,
      score: 0.9,
      reason: 'Good',
      assertion: 'toBeFaithful',
      usage: { model: 'gpt-4o' }
    });

    const result = await evaliphyExpect<EvaluationSample>(input).toBeFaithful({
      returnResult: true,
    });

    expect(result).toEqual({
      pass: true,
      score: 0.9,
      reason: 'Good',
      modelResults: [
        {
          model: 'gpt-4o',
          score: 0.9,
          pass: true,
          reason: 'Good',
        },
      ],
    });
  });

  it('should throw a professional error message on failure', async () => {
    const input: EvaluationSample = {
      response: "You can find your API key in the car.",
      query: "Where is my API key?",
    };

    (AssertionEngine.run as any).mockResolvedValue({
      passed: false,
      score: 0.18,
      reason: "The response refers to a 'car key', which does not answer the user's question about an API key location.",
      assertion: 'toBeFaithful',
      usage: { model: 'gpt-4o-mini' }
    });

    try {
      await evaliphyExpect<EvaluationSample>(input).toBeFaithful({ continueOnFailure: false });
      expect.fail('Should have thrown');
    } catch (error: any) {
      expect(error.message).toContain('✗ toBeFaithful failed');
      expect(error.message).toContain('Query:');
      expect(error.message).toContain('"Where is my API key?"');
      expect(error.message).toContain('Reason (gpt-4o-mini):');
      expect(error.message).toContain('The response refers to a \'car key\'');
    }
  });

  it('should NOT throw if continueOnFailure is true (default)', async () => {
    const input: EvaluationSample = {
      response: "Wrong",
      query: "Query",
    };

    (AssertionEngine.run as any).mockResolvedValue({
      passed: false,
      score: 0.1,
      reason: "Failed",
      assertion: 'toBeFaithful',
      usage: { model: 'gpt-4o' }
    });

    // Should not throw
    await evaliphyExpect<EvaluationSample>(input).toBeFaithful();
  });

  it('should throw if continueOnFailure is false in options', async () => {
    const input: EvaluationSample = {
      response: "Wrong",
      query: "Query",
    };

    (AssertionEngine.run as any).mockResolvedValue({
      passed: false,
      score: 0.1,
      reason: "Failed",
      assertion: 'toBeFaithful',
      usage: { model: 'gpt-4o' }
    });

    await expect(
      evaliphyExpect<EvaluationSample>(input).toBeFaithful({ continueOnFailure: false })
    ).rejects.toThrow('✗ toBeFaithful failed');
  });

  it('should support toBeRelevant', async () => {
    const input: EvaluationSample = {
      response: "Paris is the capital of France.",
      query: "What is the capital of France?",
    };

    (AssertionEngine.run as any).mockResolvedValue({
      passed: true,
      score: 1.0,
      reason: 'Direct answer',
      assertion: 'toBeRelevant',
    });

    await evaliphyExpect<EvaluationSample>(input).toBeRelevant();
    expect(AssertionEngine.run).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'toBeRelevant' }),
      expect.anything()
    );
  });

  it('should support toBeGrounded', async () => {
    const input: EvalInput = {
      response: "Paris is the capital of France.",
      context: "France's capital city is Paris.",
    };

    (AssertionEngine.run as any).mockResolvedValue({
      passed: true,
      score: 1.0,
      reason: 'Supported by context',
      assertion: 'toBeGrounded',
    });

    await evaliphyExpect(input).toBeGrounded();
    expect(AssertionEngine.run).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'toBeGrounded' }),
      expect.anything()
    );
  });

  it('should support toBeCoherent', async () => {
    const input: EvalInput = {
      response: "This is a coherent sentence.",
    };

    (AssertionEngine.run as any).mockResolvedValue({
      passed: true,
      score: 1.0,
      reason: 'Logical',
      assertion: 'toBeCoherent',
    });

    await evaliphyExpect(input).toBeCoherent();
    expect(AssertionEngine.run).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'toBeCoherent' }),
      expect.anything()
    );
  });

  it('should support toBeHarmless', async () => {
    const input: EvalInput = {
      response: "I am a helpful assistant.",
    };

    (AssertionEngine.run as any).mockResolvedValue({
      passed: true,
      score: 1.0,
      reason: 'Safe',
      assertion: 'toBeHarmless',
    });

    await evaliphyExpect(input).toBeHarmless();
    expect(AssertionEngine.run).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'toBeHarmless' }),
      expect.anything()
    );
  });
});
