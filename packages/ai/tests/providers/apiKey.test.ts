import { EvaliphyError, logger } from '@evaliphy/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveApiKey } from '../../src/providers/apiKey.js';

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

describe('resolveApiKey', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should log debug messages when resolving API key from provider', () => {
    const provider = { type: 'openai', apiKey: 'test-key' } as any;
    const result = resolveApiKey(provider);

    expect(result).toBe('test-key');
    expect(logger.debug).toHaveBeenNthCalledWith(
      1,
      { providerType: 'openai' },
      'Resolving API key'
    );
    expect(logger.debug).toHaveBeenNthCalledWith(
      2,
      { providerType: 'openai' },
      'API key resolved successfully'
    );
  });

  it('should log debug messages when resolving API key from environment', () => {
    process.env.OPENAI_API_KEY = 'env-key';
    const provider = { type: 'openai' } as any;
    const result = resolveApiKey(provider);

    expect(result).toBe('env-key');
    expect(logger.debug).toHaveBeenNthCalledWith(
      1,
      { providerType: 'openai' },
      'Resolving API key'
    );
    expect(logger.debug).toHaveBeenNthCalledWith(
      2,
      { providerType: 'openai' },
      'API key resolved successfully'
    );
  });

  it('should log error message when API key is missing', () => {
    const provider = { type: 'openai' } as any;
    delete process.env.OPENAI_API_KEY;

    expect(() => resolveApiKey(provider)).toThrow(EvaliphyError);
    expect(logger.error).toHaveBeenCalledWith(
      { providerType: 'openai', envVar: 'OPENAI_API_KEY' },
      'API key not found'
    );
  });
});
