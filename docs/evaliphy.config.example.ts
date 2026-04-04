import { defineConfig } from 'evaliphy';

/**
 * Evaliphy Configuration Example
 * 
 * This file demonstrates a standard configuration for evaluating a RAG application.
 * It includes setup for the LLM Judge, the HTTP client for API interaction,
 * and reporting preferences.
 */
export default defineConfig({
  // --- Discovery & Execution ---
  
  /** Root directory for evaluation files */
  evalDir: './evals',
  
  /** Pattern to match evaluation files */
  testMatch: ['**/*.eval.ts'],
  
  /** Global timeout for each test function (30 seconds) */
  timeout: 30000,

  // --- LLM as Judge Configuration ---
  
  llmAsJudgeConfig: {
    /** The model used for evaluating assertions */
    model: 'gpt-4o-mini',
    
    /** Provider configuration */
    provider: {
      type: 'openai',
      /** 
       * API Key is typically pulled from environment variables.
       * Evaliphy automatically looks for OPENAI_API_KEY if not provided here.
       */
      apiKey: process.env.OPENAI_API_KEY,
    },
    
    /** 
     * Temperature 0 ensures deterministic results from the judge.
     * This is critical for consistent evaluation across runs.
     */
    temperature: 0,
    
    /** Maximum tokens for the judge's reasoning and verdict */
    maxTokens: 1000,
  },

  // --- HTTP Client Configuration ---
  
  http: {
    /** The base URL of your RAG application's API */
    baseUrl: 'https://api.example.com/v1',
    
    /** Global request timeout (2 minutes) */
    timeout: 120000,
    
    /** Common headers sent with every request */
    headers: {
      'Content-Type': 'application/json',
      'X-Eval-Source': 'evaliphy-ci',
    },
    
    /** Automatic retry logic for flaky network conditions or 5xx errors */
    retry: {
      attempts: 3,
      delay: 1000,
    },
  },

  // --- Reporting ---
  
  /** 
   * Reporters to use for results.
   * 'console' provides immediate feedback in the terminal.
   * 'html' generates a visual report in the `eval-results` directory.
   */
  reporters: ['console', 'html'],
});
