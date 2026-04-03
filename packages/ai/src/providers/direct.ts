import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { LanguageModel } from 'ai';
import { DirectProvider, EvaliphyError, EvaliphyErrorCode } from '@evaliphy/core';

export function getDirectProviderModel(
  provider: DirectProvider,
  modelId: string,
  apiKey: string
): LanguageModel {
  switch (provider.type) {
    case 'openai':
      return createOpenAI({ apiKey })(modelId);
    case 'anthropic':
      return createAnthropic({ apiKey })(modelId);
    case 'google':
      return createGoogleGenerativeAI({ apiKey })(modelId);
    case 'mistral':
      return createMistral({ apiKey })(modelId);
    case 'groq':
      return createGroq({ apiKey })(modelId);
    default:
      throw new EvaliphyError(
        EvaliphyErrorCode.UNSUPPORTED_PROVIDER,
        `Unsupported direct provider type: ${(provider as any).type}`
      );
  }
}
