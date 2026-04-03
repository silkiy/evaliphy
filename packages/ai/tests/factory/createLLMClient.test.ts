import { logger } from '@evaliphy/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createLLMClient } from '../../src/factory/createLLMClient.js';

vi.mock('../../src/providers/apiKey.js', () => ({
  resolveApiKey: vi.fn().mockReturnValue('mock-api-key'),
}));

vi.mock('../../src/providers/direct.js', () => ({
  getDirectProviderModel: vi.fn().mockReturnValue({}),
}));

vi.mock('../../src/providers/gateway.js', () => ({
  getGatewayProviderModel: vi.fn().mockReturnValue({}),
}));

vi.mock('@evaliphy/core', async () => {
  const actual = await vi.importActual('@evaliphy/core') as any;
  return {
    ...actual,
    logger: {
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    },
  };
});

describe('createLLMClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log debug messages when creating client with direct provider', () => {
    const config = {
      model: 'gpt-4',
      provider: { type: 'openai' },
    } as any;

    createLLMClient(config);

    expect(logger.debug).toHaveBeenCalledWith(
      expect.objectContaining({ config }),
      'Creating LLM client'
    );
    expect(logger.debug).toHaveBeenCalledWith(
      { provider: 'openai' },
      'Using direct provider'
    );
  });

  it('should log debug messages when creating client with gateway provider', () => {
    const config = {
      model: 'gpt-4',
      provider: { type: 'gateway' },
    } as any;

    createLLMClient(config);

    expect(logger.debug).toHaveBeenCalledWith(
      expect.objectContaining({ config }),
      'Creating LLM client'
    );
    expect(logger.debug).toHaveBeenCalledWith(
      { provider: 'gateway' },
      'Using gateway provider'
    );
  });
});
