import { emitter } from '@evaliphy/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JsonAccumulator } from '../src/accumulator/JsonAccumulator.js';

describe('JsonAccumulator', () => {
  let onComplete: any;
  let accumulator: JsonAccumulator;

  beforeEach(() => {
    onComplete = vi.fn().mockResolvedValue(undefined);
    accumulator = new JsonAccumulator({ onComplete });
    emitter.removeAll();
  });

  it('should attach to emitter and handle run:start', async () => {
    accumulator.attach();
    
    const payload = {
      runId: 'test-run',
      totalTests: 1,
      resolvedConfig: { model: 'gpt-4' } as any
    };

    await emitter.emit('run:start', payload);
    
    // We can't easily check the internal builder state, but we can check if it finalizes correctly
    await emitter.emit('run:end', { runId: 'test-run', passed: 1, failed: 0, duration: 100 });
    
    expect(onComplete).toHaveBeenCalled();
    const report = onComplete.mock.calls[0][0];
    expect(report.meta.runId).toBe('test-run');
  });

  it('should handle test:pass and test:fail', async () => {
    accumulator.attach();
    
    await emitter.emit('run:start', { runId: 'test-run', totalTests: 2, resolvedConfig: {} as any });
    
    const result = {
      sampleId: 'test-1',
      evalFile: 'file1.eval.ts',
      status: 'passed',
      assertions: { 'a': { score: 1, passed: true, durationMs: 1, llmTokens: 1 } },
      inputs: { query: 'q', context: 'c', response: 'r' },
      http: { status: 200, url: 'u', method: 'POST' },
      timings: { ttfb: 1, total: 1 }
    };

    await emitter.emit('test:pass', { runId: 'test-run', testName: 'test-1', duration: 10, result } as any);
    await emitter.emit('test:fail', { runId: 'test-run', testName: 'test-2', duration: 10, error: new Error('fail') } as any);
    
    await emitter.emit('run:end', { runId: 'test-run', passed: 1, failed: 1, duration: 100 });
    
    expect(onComplete).toHaveBeenCalled();
    const report = onComplete.mock.calls[0][0];
    expect(report.results).toHaveLength(2);
    expect(report.summary.passed).toBe(1);
    expect(report.summary.failed).toBe(1);
  });
});
