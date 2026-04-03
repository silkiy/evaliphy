import { LanguageModel } from "ai";
import { LLMJudgeConfig, logger } from '@evaliphy/core';
import { EvaliphyLLMClient } from '../client/EvaliphyLLMClient.js';
import { resolveApiKey } from '../providers/apiKey.js';
import { getDirectProviderModel } from '../providers/direct.js';
import { getGatewayProviderModel } from '../providers/gateway.js';

export function createLLMClient(config: LLMJudgeConfig): EvaliphyLLMClient {
  logger.debug({ config }, 'Creating LLM client');
  // 1. Resolve API Key
  const apiKey = resolveApiKey(config.provider);

  // 2. Resolve LanguageModel
  let model: LanguageModel;

  if (config.provider.type === 'gateway') {
    logger.debug({ provider: config.provider.type }, 'Using gateway provider');
    model = getGatewayProviderModel(config.provider, config.model, apiKey);
  } else {
    logger.debug({ provider: config.provider.type }, 'Using direct provider');
    model = getDirectProviderModel(config.provider, config.model, apiKey);
  }

  // 3. Return EvaliphyLLMClient
  return new EvaliphyLLMClient(model, config);
}
