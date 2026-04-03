import { HttpClient } from './http/client.js';
import { HttpClientConfig } from './http/types.js';
import {LLMJudgeConfig} from "@evaliphy/core";

export { HttpClient } from './http/client.js';
export * from './http/types.js';

/**
 * Factory function to create a production-grade HttpClient.
 * Users should use this instead of calling `new HttpClient()` directly.
 */
export function createHttpClient(config: HttpClientConfig): HttpClient {
  return new HttpClient(config);
}
