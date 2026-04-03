import { EvaliphyError } from '@evaliphy/core';
import { describe, expect, it, vi } from 'vitest';
import { composeMiddleware, createRetryMiddleware, createTimeoutMiddleware, loggingMiddleware } from '../../src/http/middleware.js';

describe('Middleware', () => {
  describe('composeMiddleware', () => {
    it('should execute middlewares in order', async () => {
      const order: number[] = [];
      const m1 = {
        name: 'm1',
        handle: async (req: Request, next: any) => {
          order.push(1);
          const res = await next(req);
          order.push(4);
          return res;
        }
      };
      const m2 = {
        name: 'm2',
        handle: async (req: Request, next: any) => {
          order.push(2);
          const res = await next(req);
          order.push(3);
          return res;
        }
      };

      const baseFetch = vi.fn().mockResolvedValue(new Response('ok'));
      const chain = composeMiddleware([m1, m2], baseFetch);

      await chain(new Request('https://test.com'));

      expect(order).toEqual([1, 2, 3, 4]);
      expect(baseFetch).toHaveBeenCalled();
    });
  });

  describe('loggingMiddleware', () => {
    it('should log request and response', async () => {
      const next = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
      const req = new Request('https://test.com', { method: 'GET' });

      await loggingMiddleware.handle(req, next);

      expect(next).toHaveBeenCalledWith(req);
    });

    it('should log errors', async () => {
      const next = vi.fn().mockRejectedValue(new Error('fail'));
      const req = new Request('https://test.com', { method: 'GET' });

      await expect(loggingMiddleware.handle(req, next)).rejects.toThrow('fail');
    });
  });

  describe('createTimeoutMiddleware', () => {
    it('should timeout if next() takes too long', async () => {
      const middleware = createTimeoutMiddleware(10);
      const next = () => new Promise<Response>((resolve) => setTimeout(() => resolve(new Response('ok')), 50));
      const req = new Request('https://test.com');

      await expect(middleware.handle(req, next)).rejects.toThrow(EvaliphyError);
    });

    it('should not timeout if next() is fast', async () => {
      const middleware = createTimeoutMiddleware(100);
      const next = async () => new Response('ok');
      const req = new Request('https://test.com');

      const res = await middleware.handle(req, next);
      expect(await res.text()).toBe('ok');
    });
  });

  describe('createRetryMiddleware', () => {
    it('should retry on 500', async () => {
      const middleware = createRetryMiddleware({ attempts: 1, delay: 0 });
      let calls = 0;
      const next = async () => {
        calls++;
        if (calls === 1) return new Response('error', { status: 500 });
        return new Response('ok', { status: 200 });
      };
      const req = new Request('https://test.com');

      const res = await middleware.handle(req, next);
      expect(calls).toBe(2);
      expect(res.status).toBe(200);
    });

    it('should retry on network error', async () => {
      const middleware = createRetryMiddleware({ attempts: 1, delay: 0 });
      let calls = 0;
      const next = async () => {
        calls++;
        if (calls === 1) throw new Error('network error');
        return new Response('ok', { status: 200 });
      };
      const req = new Request('https://test.com');

      const res = await middleware.handle(req, next);
      expect(calls).toBe(2);
      expect(res.status).toBe(200);
    });

    it('should throw after max attempts', async () => {
      const middleware = createRetryMiddleware({ attempts: 1, delay: 0 });
      const next = async () => new Response('error', { status: 500 });
      const req = new Request('https://test.com');

      const res = await middleware.handle(req, next);
      expect(res.status).toBe(500);
    });
  });
});
