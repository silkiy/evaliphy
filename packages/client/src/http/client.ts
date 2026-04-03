import type { IHttpClient } from '@evaliphy/core';
import { RequestBuilder } from './builder.js';
import { composeMiddleware, createRetryMiddleware, createTimeoutMiddleware, loggingMiddleware } from './middleware.js';
import { Transport } from './transport.js';
import { EvalResponse, HttpClientConfig, Middleware, RequestOptions, StreamResponse } from './types.js';

/**
 * The standard HTTP client for Evaliphy tests.
 * 
 * This client provides a higher-level interface over the native Fetch API, 
 * automatically handling middleware like retries, timeouts, and logging.
 * It is typically provided as the `httpClient` fixture in evaluation tests.
 */
export class HttpClient implements IHttpClient {
  private builder: RequestBuilder;
  private transport: Transport;

  /**
   * Initializes a new HttpClient instance.
   * 
   * @param config - Configuration including baseUrl and optional middleware/retry settings.
   */
  constructor(private config: HttpClientConfig) {
    this.builder = new RequestBuilder(config);

    const middlewares: Middleware[] = [...(config.middleware || [])];

    // Add default middlewares if configured
    if (config.retry) {
      middlewares.push(createRetryMiddleware(config.retry));
    }
    if (config.timeout) {
      middlewares.push(createTimeoutMiddleware(config.timeout));
    }
    // Always add logging for production grade visibility
    middlewares.push(loggingMiddleware);

    const middlewareChain = composeMiddleware(middlewares, (req) => fetch(req));
    this.transport = new Transport(middlewareChain);
  }

  /**
   * Sends a POST request to the specified URL.
   * 
   * @param url - The relative or absolute endpoint URL.
   * @param payload - The body of the request (automatically serialized to JSON).
   * @param options - Optional per-request settings (headers, retries, etc.).
   * @returns A promise resolving to an EvalResponse. 
   *          Use `await response.json()` to access the parsed body.
   */
  async post(url: string, payload: any, options: RequestOptions = {}): Promise<EvalResponse> {
    const request = this.builder.build('POST', url, payload, options);
    return this.transport.request(request);
  }

  /**
   * Sends a GET request to the specified URL.
   * 
   * @param url - The relative or absolute endpoint URL.
   * @param options - Optional per-request settings (headers, retries, etc.).
   * @returns A promise resolving to an EvalResponse.
   *          Note: The `raw` property contains the native Fetch Response, which 
   *          appears "blank" when logged due to its internal stream state.
   */
  async get(url: string, options: RequestOptions = {}): Promise<EvalResponse> {
    const request = this.builder.build('GET', url, undefined, options);
    return this.transport.request(request);
  }

  /**
   * Sends a PUT request to the specified URL.
   * 
   * @param url - The relative or absolute endpoint URL.
   * @param payload - The body of the request.
   * @param options - Optional per-request settings.
   */
  async put(url: string, payload: any, options: RequestOptions = {}): Promise<EvalResponse> {
    const request = this.builder.build('PUT', url, payload, options);
    return this.transport.request(request);
  }

  /**
   * Sends a PATCH request to the specified URL.
   * 
   * @param url - The relative or absolute endpoint URL.
   * @param payload - The body of the request.
   * @param options - Optional per-request settings.
   */
  async patch(url: string, payload: any, options: RequestOptions = {}): Promise<EvalResponse> {
    const request = this.builder.build('PATCH', url, payload, options);
    return this.transport.request(request);
  }

  /**
   * Sends a DELETE request to the specified URL.
   * 
   * @param url - The relative or absolute endpoint URL.
   * @param options - Optional per-request settings.
   */
  async delete(url: string, options: RequestOptions = {}): Promise<EvalResponse> {
    const request = this.builder.build('DELETE', url, undefined, options);
    return this.transport.request(request);
  }

  /**
   * Initiates a streaming request (suitable for LLM completions or SSE).
   * 
   * @param url - The endpoint URL.
   * @param payload - The request body.
   * @param options - Optional per-request settings.
   * @returns A promise resolving to a StreamResponse which is an async iterator.
   */
  async stream(url: string, payload: any, options: RequestOptions = {}): Promise<StreamResponse> {
    const request = this.builder.build('POST', url, payload, options);
    return this.transport.stream(request);
  }

  /**
   * Creates a new scoped client instance that includes a specific session header.
   * Useful for maintaining context in multi-turn evaluation flows.
   * 
   * @param sessionKey - The name of the header (e.g., 'X-Session-ID').
   * @param sessionId - The actual session identifier string.
   */
  withSession(sessionKey:string, sessionId: string): HttpClient {
    return new HttpClient({
      ...this.config,
      headers: {
        ...this.config.headers,
        [sessionKey]: sessionId,
      },
    });
  }
}
