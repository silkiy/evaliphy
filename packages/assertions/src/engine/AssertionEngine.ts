import { EvaliphyError, EvaliphyErrorCode } from '@evaliphy/core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BaseMatcher } from '../matchers/base/BaseMatcher.js';
import { PromptLoader } from '../promptManager/promptLoader.js';
import { PromptRenderer } from '../promptManager/promptRenderer.js';
import { assertionRegistry } from "../registry.js";
import { type AssertionContext, type AssertionResult } from './types.js';

export class AssertionEngine {
  static async run(
    matcher: BaseMatcher,
    context: AssertionContext
  ): Promise<AssertionResult> {
    const startTime = Date.now();
    const { input, options, llmClient, config } = context;

    try {
      matcher.validate(input);

      let score = 0;
      let reason = '';
      let usage: AssertionResult['usage'] = undefined;
      const usedLLM = matcher.usesLLM;

      if (usedLLM) {
        const { finalPrompt, outputSchema } = this.prepareLLMRequest(matcher, context);
        const response = await this.executeLLMCall(matcher, llmClient, finalPrompt, outputSchema);

        const parsed = response.object as { score: number; reason: string };
        score = parsed.score;
        reason = parsed.reason;
        usage = response.llmUsages;
      }


      const threshold = options.threshold ?? 0.7;
      const passed = score >= threshold;

      return {
        assertion: matcher.name,
        passed,
        score,
        reason,
        threshold,
        usedLLM,
        usage,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      if (error instanceof EvaliphyError) throw error;
      throw new EvaliphyError(
        EvaliphyErrorCode.ASSERTION_FAILED,
        `${matcher.name}: Assertion failed`,
        "Failed with threshold check",
        error as Error
      );
    }
  }

  private static prepareLLMRequest(matcher: BaseMatcher, context: AssertionContext) {
    const { input, config } = context;
    const assertionDef = assertionRegistry[matcher.name];

    if (!assertionDef) {
      throw new EvaliphyError(
        EvaliphyErrorCode.INTERNAL_ERROR,
        `Assertion "${matcher.name}" is not registered in the assertion registry.`
      );
    }

    const loadedPrompt = this.loadPrompt(matcher.name, assertionDef, config);
    const variables = this.prepareVariables(input);
    const finalPrompt = PromptRenderer.render(loadedPrompt.template, variables, assertionDef);
    const outputSchema = assertionDef.outputSchema.zodSchema as any;

    return { finalPrompt, outputSchema };
  }

  private static loadPrompt(matcherName: string, assertionDef: any, config: any) {
    const configDir = config.configFile ? path.dirname(config.configFile) : process.cwd();

    // 1. Check for custom prompts directory from config
    const customPromptsDir = config.llmAsJudgeConfig?.promptsDir
      ? path.resolve(configDir, config.llmAsJudgeConfig.promptsDir)
      : null;

    // 2. Check for default prompts directory in consumer's root (convention)
    const localPromptsDir = path.join(process.cwd(), 'prompts');

    // 3. SDK internal prompts directory
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    
    // Support both source (../../prompts) and bundled dist (./prompts)
    const sdkPromptsDirSource = path.resolve(__dirname, '../../prompts');
    const sdkPromptsDirDist = path.resolve(__dirname, './prompts');

    const searchPaths = [
      customPromptsDir ? path.join(customPromptsDir, `${matcherName}.md`) : null,
      path.join(localPromptsDir, `${matcherName}.md`),
      path.join(sdkPromptsDirDist, `${matcherName}.md`),
      path.join(sdkPromptsDirSource, `${matcherName}.md`),
    ].filter(Boolean) as string[];

    try {
      for (const promptPath of searchPaths) {
        if (PromptLoader.exists(promptPath)) {
          return PromptLoader.load(promptPath, assertionDef);
        }
      }

      // If none found, try the primary SDK path one last time to trigger the standard error
      return PromptLoader.load(path.join(sdkPromptsDirDist, `${matcherName}.md`), assertionDef);
    } catch (error: any) {
      throw new EvaliphyError(
        EvaliphyErrorCode.PROMPT_LOAD_ERROR,
        `Failed to load prompt for "${matcherName}": ${error.message}`,
        'Check your prompt file formatting and variables.',
        error
      );
    }
  }

  private static prepareVariables(input: any) {
    return {
      ...Object.fromEntries(
        Object.entries(input).filter(([_, v]) => typeof v === 'string')
      ),
      response: input.response,
      question: input.query || '',
      context: Array.isArray(input.context) ? input.context.join('\n\n') : (input.context || ''),
    } as Record<string, string>;
  }

  private static async executeLLMCall(matcher: BaseMatcher, llmClient: any, prompt: string, schema: any) {
    try {
      return await llmClient.generateObject(prompt, schema);
    } catch (error: any) {
      throw new EvaliphyError(
        EvaliphyErrorCode.ASSERTION_LLM_FAILED,
        `${matcher.name}: Failed to connect to LLM Judge. Check your llmAsJudgeConfig and API key.`,
        'Check your llmAsJudge config and API key',
        error
      );
    }
  }
}
