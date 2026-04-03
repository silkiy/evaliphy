import type { Timings, EvalResponse, StreamResponse, StreamChunk, RequestOptions } from '@evaliphy/core';

export interface HttpClientConfig {
  baseUrl: string
  headers?: Record<string, string>
  timeout?: number
  retry?: RetryConfig
  middleware?: Middleware[]
}

export { Timings, EvalResponse, StreamResponse, StreamChunk, RequestOptions };

export interface RetryConfig {
  attempts: number
  delay: number
}

export type MiddlewareFn = (req: Request) => Promise<Response>

export interface Middleware {
  name: string
  handle(req: Request, next: MiddlewareFn): Promise<Response>
}
