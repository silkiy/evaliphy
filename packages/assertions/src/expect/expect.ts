import { createLLMClient } from "@evaliphy/ai";
import type { ILLMClient } from '@evaliphy/core';
import { ConfigLoader, EvaliphyError, EvaliphyErrorCode, getConfig, logger } from '@evaliphy/core';
import { AssertionEngine } from '../engine/AssertionEngine.js';
import type { AssertionContext, AssertionOptions, EvalInput, EvalResult, EvaluationSample } from '../engine/types.js';
import { ToBeCoherentMatcher } from '../matchers/core/toBeCoherent.js';
import { ToBeFaithfulMatcher } from '../matchers/core/toBeFaithful.js';
import { ToBeGroundedMatcher } from '../matchers/core/toBeGrounded.js';
import { ToBeHarmlessMatcher } from '../matchers/core/toBeHarmless.js';
import { ToBeRelevantMatcher } from '../matchers/core/toBeRelevant.js';
import { applyNegation, buildEvalResult, handleAssertionFailure, mergeOptions, updateGlobalResult } from './expectUtil.js';

/**
 * Chainable matcher object for Evaliphy assertions.
 * Provides a fluent API for asserting LLM outputs against various criteria.
 */
export class MatcherChain<T extends EvalInput = EvalInput> {
  constructor(
    private context: AssertionContext,
    private isNot: boolean = false
  ) {}

  /**
   * Negates the next assertion in the chain.
   *
   * @example
   * await expect(response).not.toBeFaithful("What is the capital of France?");
   */
  get not(): MatcherChain<T> {
    return new MatcherChain<T>(this.context, !this.isNot);
  }

  /**
   * Asserts that the response is faithful to the provided context.
   *
   * Faithfulness measures whether every claim in the response is grounded
   * in the retrieved context. A response is unfaithful if it introduces
   * information not present in the context, even if that information is
   * factually correct.
   *
   * Scored 0.0 – 1.0 by an LLM judge using the configured judge model.
   * Passes if the score meets or exceeds the threshold.
   *
   * @param options - Optional overrides for this assertion.
   * @param options.threshold - Minimum score to pass (0.0 – 1.0).
   *                            Defaults to `judge.thresholds.faithfulness` in config.
   *
   * @example
   * // default threshold from config
   * await expect({
   *   query:    "What is the return policy?",
   *   response: "You can return items within 30 days.",
   *   context:  "Returns are accepted within 30 days of purchase."
   * }).toBeFaithful();
   *
   * @example
   * // override threshold for this assertion only
   * await expect({
   *   query:    "What is the return policy?",
   *   response: "You can return items within 30 days.",
   *   context:  "Returns are accepted within 30 days of purchase."
   * }).toBeFaithful({ threshold: 0.9 });
   *
   * @throws {AssertionError} When the faithfulness score is below the threshold.
   *                          The error includes the score, threshold, and judge reasoning.
   *
   * @see {@link toBeRelevant} to assert the response addresses the query
   * @see {@link toBeGrounded} to assert claims are supported by the context
   */
  async toBeFaithful(options?: AssertionOptions): Promise<EvalResult | void> {
    const matcher = new ToBeFaithfulMatcher();
    const input = this.context.input as EvaluationSample;

    if (!input.query) {
      throw new EvaliphyError(
        EvaliphyErrorCode.INVALID_ASSERTION_INPUT,
        "toBeFaithful requires a query. Provide it in the expect() input."
      );
    }

    const contextWithMergedOptions = mergeOptions(this.context, options);

    const result = await AssertionEngine.run(matcher, contextWithMergedOptions);
    logger.debug({ result }, 'Response from LLM as Judge');

    updateGlobalResult(matcher.name, result, input);
    applyNegation(result, this.isNot);

    const evalResult = buildEvalResult(result);

    if (contextWithMergedOptions.options.returnResult) {
      return evalResult;
    }

    handleAssertionFailure(result, evalResult, input, contextWithMergedOptions.options, this.context.config);
  }

  /**
   * Asserts that the response directly addresses the user's query.
   *
   * Relevance measures whether the response directly addresses the user's prompt
   * without dodging, being overly vague, or talking about unrelated topics.
   *
   * @param options - Optional overrides for this assertion.
   */
  async toBeRelevant(options?: AssertionOptions): Promise<EvalResult | void> {
    const matcher = new ToBeRelevantMatcher();
    const input = this.context.input as EvaluationSample;

    const contextWithMergedOptions = mergeOptions(this.context, options);
    const result = await AssertionEngine.run(matcher, contextWithMergedOptions);

    updateGlobalResult(matcher.name, result, input);
    applyNegation(result, this.isNot);

    const evalResult = buildEvalResult(result);
    if (contextWithMergedOptions.options.returnResult) return evalResult;
    handleAssertionFailure(result, evalResult, input, contextWithMergedOptions.options, this.context.config);
  }

  /**
   * Asserts that the response is supported by the provided context.
   *
   * Groundedness measures whether the claims made in the response are supported
   * by the retrieved context.
   *
   * @param options - Optional overrides for this assertion.
   */
  async toBeGrounded(options?: AssertionOptions): Promise<EvalResult | void> {
    const matcher = new ToBeGroundedMatcher();
    const input = this.context.input as EvaluationSample;

    const contextWithMergedOptions = mergeOptions(this.context, options);
    const result = await AssertionEngine.run(matcher, contextWithMergedOptions);

    updateGlobalResult(matcher.name, result, input);
    applyNegation(result, this.isNot);

    const evalResult = buildEvalResult(result);
    if (contextWithMergedOptions.options.returnResult) return evalResult;
    handleAssertionFailure(result, evalResult, input, contextWithMergedOptions.options, this.context.config);
  }

  /**
   * Asserts that the response is logically consistent and easy to follow.
   *
   * @param options - Optional overrides for this assertion.
   */
  async toBeCoherent(options?: AssertionOptions): Promise<EvalResult | void> {
    const matcher = new ToBeCoherentMatcher();
    const input = this.context.input as EvaluationSample;

    const contextWithMergedOptions = mergeOptions(this.context, options);
    const result = await AssertionEngine.run(matcher, contextWithMergedOptions);

    updateGlobalResult(matcher.name, result, input);
    applyNegation(result, this.isNot);

    const evalResult = buildEvalResult(result);
    if (contextWithMergedOptions.options.returnResult) return evalResult;
    handleAssertionFailure(result, evalResult, input, contextWithMergedOptions.options, this.context.config);
  }

  /**
   * Asserts that the response contains no toxic, harmful, or biased content.
   *
   * @param options - Optional overrides for this assertion.
   */
  async toBeHarmless(options?: AssertionOptions): Promise<EvalResult | void> {
    const matcher = new ToBeHarmlessMatcher();
    const input = this.context.input as EvaluationSample;

    const contextWithMergedOptions = mergeOptions(this.context, options);
    const result = await AssertionEngine.run(matcher, contextWithMergedOptions);

    updateGlobalResult(matcher.name, result, input);
    applyNegation(result, this.isNot);

    const evalResult = buildEvalResult(result);
    if (contextWithMergedOptions.options.returnResult) return evalResult;
    handleAssertionFailure(result, evalResult, input, contextWithMergedOptions.options, this.context.config);
  }
}

/**
 * Creates an expectation for a given LLM response or evaluation input.
 * This is the entry point for all Evaliphy assertions.
 *
 * @param input - The LLM response string or a full {@link EvalInput} object.
 * @returns A {@link MatcherChain} to perform assertions.
 *
 * @example
 * // Asserting on a simple response string
 * await expect("The capital of France is Paris").toBeFaithful("What is the capital of France?");
 *
 * @example
 * // Asserting with full evaluation input
 * await expect<EvaluationSample>({
 *   response: "You can find your API key in the dashboard.",
 *   context: "API keys are located in the 'Settings > API' section of the user dashboard.",
 *   query: "Where is my API key?"
 * }).toBeFaithful();
 *
 * @throws {EvaliphyError} If llmAsJudgeConfig is missing from the configuration.
 */
export function expect<T extends EvalInput = EvalInput>(input: string | T): MatcherChain<T> {
  const evalInput: EvalInput = typeof input === 'string' ? { response: input } : input;

  // Get config from execution context (AsyncLocalStorage)
  // Fallback to singleton cachedConfig if context is not available (e.g. in some test environments)
  const config = getConfig() || (ConfigLoader.getInstance() as any).cachedConfig || {};
  logger.debug({ config }, 'Received config for expect');

  if (!config.llmAsJudgeConfig) {
      throw new EvaliphyError(
          EvaliphyErrorCode.INVALID_CONFIG,
          "llmAsJudgeConfig is required for assertions. Make sure it is defined in your config file."
      );
  }

  let llmClient: ILLMClient;
  try {
    llmClient = createLLMClient(config.llmAsJudgeConfig);
  } catch (error) {
    // Fallback for tests where createLLMClient might be called before mocks are fully ready
    // or when we want to defer LLM client creation errors to actual matcher execution
    llmClient = {
      generateObject: async () => { throw error; },
      generateText: async () => { throw error; },
    } as unknown as ILLMClient;
  }

  return new MatcherChain<T>({
    input: evalInput,
    options: {},
    llmClient,
    config,
  });
}
