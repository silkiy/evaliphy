import { EvaliphyError, EvaliphyErrorCode, LLMProvider, logger } from '@evaliphy/core';

export function resolveApiKey(provider: LLMProvider): string {
  logger.debug({ providerType: provider.type }, 'Resolving API key');
  if (provider.apiKey) {
    logger.debug({ providerType: provider.type }, 'API key resolved successfully');
    return provider.apiKey;
  }

  const envVarMap: Record<string, string> = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    google: 'GOOGLE_API_KEY',
    mistral: 'MISTRAL_API_KEY',
    groq: 'GROQ_API_KEY',
    cohere: 'COHERE_API_KEY',
    gateway: 'GATEWAY_API_KEY',
  };

  const envVar = envVarMap[provider.type];
  const apiKey = process.env[envVar];

  if (!apiKey) {
    logger.error({ providerType: provider.type, envVar }, 'API key not found');
    throw new EvaliphyError(
      EvaliphyErrorCode.MISSING_API_KEY,
      `No API key found for provider '${provider.type}'`,
      `Set ${envVar} in your environment or pass apiKey in llmAsJudge.provider.apiKey`
    );
  }

  logger.debug({ providerType: provider.type }, 'API key resolved successfully');
  return apiKey;
}
