import { EvaliphyError, EvaliphyErrorCode } from '@evaliphy/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpClient } from '../../src/http/client.js';

describe('HttpClient', () => {
  const config = {
    baseUrl: 'https://api.example.com',
    headers: { 'Authorization': 'Bearer token' },
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should perform a POST request with correct headers and body', async () => {
    const client = new HttpClient(config);
    const payload = { query: 'test' };

    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ result: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));

    const response = await client.post('/chat', payload);

    expect(fetch).toHaveBeenCalledWith(
      expect.any(Request)
    );

    const request = vi.mocked(fetch).mock.calls[0][0] as Request;
    expect(request.url).toBe('https://api.example.com/chat');
    expect(request.method).toBe('POST');
    expect(request.headers.get('Authorization')).toBe('Bearer token');
    expect(request.headers.get('Content-Type')).toBe('application/json');

    const data = await response.json();
    expect(data).toEqual({ result: 'ok' });
    expect(response.status).toBe(200);
  });

  it('should handle session ID correctly', async () => {
    const client = new HttpClient(config);
    const sessionClient = client.withSession("x-session-id", 'session-123');

    vi.mocked(fetch).mockResolvedValueOnce(new Response('ok'));

    await sessionClient.get('/test');

    const request = vi.mocked(fetch).mock.calls[0][0] as Request;
    expect(request.headers.get('x-session-id')).toBe('session-123');
  });

  it('should retry on 500 errors if configured', async () => {
    const retryConfig = {
      ...config,
      retry: { attempts: 2, delay: 0 },
    };
    const client = new HttpClient(retryConfig);

    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response('error', { status: 500 }))
      .mockResolvedValueOnce(new Response('error', { status: 500 }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));

    const response = await client.get('/retry');

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(response.status).toBe(200);
  });

  it('should throw EvaliphyError on timeout', async () => {
    const timeoutConfig = {
      ...config,
      timeout: 10,
    };
    const client = new HttpClient(timeoutConfig);

    vi.mocked(fetch).mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(new Response('ok')), 100)));

    await expect(client.get('/timeout')).rejects.toThrow(EvaliphyError);
    try {
      await client.get('/timeout');
    } catch (err: any) {
      expect(err.code).toBe(EvaliphyErrorCode.EVAL_TIMEOUT);
    }
  });

  it('should handle streaming responses', async () => {
    const client = new HttpClient(config);

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"text": "hello"}\n\n'));
        controller.enqueue(new TextEncoder().encode('data: {"text": " world"}\n\n'));
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    vi.mocked(fetch).mockResolvedValueOnce(new Response(stream));

    const response = await client.stream('/stream', { prompt: 'hi' });

    const fullText = await response.collect();
    expect(fullText).toBe('hello world');
  });
});
