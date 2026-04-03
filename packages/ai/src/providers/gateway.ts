import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { LanguageModel } from 'ai';
import { GatewayProvider } from '@evaliphy/core';

export function getGatewayProviderModel(
  provider: GatewayProvider,
  modelId: string,
  apiKey: string
): LanguageModel {
  return createOpenAICompatible({
    name: provider.name ?? 'gateway',
    baseURL: provider.url,
    apiKey: apiKey,
  })(modelId);
}
