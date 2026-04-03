import { RunEndPayload, RunStartPayload, TestFailPayload, TestPassPayload } from '@evaliphy/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConsoleReporter } from '../src/console/index.js';

describe('ConsoleReporter', () => {
  let reporter: ConsoleReporter;
  let consoleSpy: any;

  beforeEach(() => {
    reporter = new ConsoleReporter();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should log run start', () => {
    const payload: RunStartPayload = {
      runId: 'test-run',
      totalTests: 1,
      resolvedConfig: { llmAsJudgeConfig: { model: 'gpt-4o', provider: { type: 'openai' } } } as any
    };
    reporter.onRunStart(payload);
    expect(consoleSpy).toHaveBeenCalled();
    const calls = consoleSpy.mock.calls.join('\n');
    expect(calls).toContain('test-run');
    expect(calls).toContain('gpt-4o');
  });

  it('should log test pass', () => {
    const payload: TestPassPayload = {
      runId: 'test-run',
      testName: 'test-1',
      duration: 100
    };
    reporter.onTestPass(payload);
    expect(consoleSpy).toHaveBeenCalled();
    const calls = consoleSpy.mock.calls.join('\n');
    expect(calls).toContain('✓');
    expect(calls).toContain('test-1');
    expect(calls).toContain('100ms');
  });

  it('should log test fail', () => {
    const payload: TestFailPayload = {
      runId: 'test-run',
      testName: 'test-2',
      duration: 200,
      error: new Error('failed')
    };
    reporter.onTestFail(payload);
    expect(consoleSpy).toHaveBeenCalled();
    const calls = consoleSpy.mock.calls.join('\n');
    expect(calls).toContain('✗');
    expect(calls).toContain('test-2');
    expect(calls).toContain('200ms');
  });

  it('should log run end summary', () => {
    const payload: RunEndPayload = {
      runId: 'test-run',
      passed: 1,
      failed: 1,
      duration: 300
    };
    reporter.onRunEnd(payload);
    expect(consoleSpy).toHaveBeenCalled();
    const calls = consoleSpy.mock.calls.join('\n');
    expect(calls).toContain('1 passed');
    expect(calls).toContain('1 failed');
    expect(calls).toContain('300ms');
  });
});
