import { EvaliphyError, EvaliphyErrorCode, getResult } from '@evaliphy/core';
import { EvalResponse, StreamChunk, StreamResponse, Timings } from './types.js';

export class EvalResponseImpl implements EvalResponse {
  constructor(
    public readonly raw: Response,
    public readonly timings: Timings
  ) {
    const result = getResult();
    if (result) {
      result.http = {
        status: this.raw.status,
        url: this.raw.url,
        method: 'POST' // TODO: capture method
      };
      result.timings.ttfb = this.timings.ttfb;
      result.timings.total = this.timings.total;
    }
  }

  get status(): number {
    return this.raw.status;
  }

  get headers(): Headers {
    return this.raw.headers;
  }

  async json<T = unknown>(): Promise<T> {
    return this.raw.json();
  }

  async text(): Promise<string> {
    return this.raw.text();
  }
}

export class StreamResponseImpl implements StreamResponse {
  constructor(
    private readonly response: Response,
    public readonly timings: Timings
  ) {
    const result = getResult();
    if (result) {
      result.http = {
        status: this.response.status,
        url: this.response.url,
        method: 'POST'
      };
      result.timings.ttfb = this.timings.ttfb;
      result.timings.total = this.timings.total;
    }
  }

  async *[Symbol.asyncIterator](): AsyncIterator<StreamChunk> {
    const reader = this.response.body?.getReader();
    if (!reader) {
      throw new EvaliphyError(
        EvaliphyErrorCode.EVAL_FAILED,
        'Response body is not readable'
      );
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6);
            if (data === '[DONE]') continue;
            try {
              yield JSON.parse(data) as StreamChunk;
            } catch (e) {
              yield { text: data } as StreamChunk;
            }
          } else {
            // Fallback for non-SSE streams or raw text chunks
            try {
              yield JSON.parse(trimmed) as StreamChunk;
            } catch (e) {
              yield { text: trimmed } as StreamChunk;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
      this.timings.streamEnd = Date.now() - (this.timings.total - (this.timings.total - this.timings.ttfb)); // This is a bit simplified, will refine in transport
    }
  }

  async collect(): Promise<string> {
    let fullText = '';
    for await (const chunk of this) {
      fullText += chunk.text || '';
    }
    return fullText;
  }
}
