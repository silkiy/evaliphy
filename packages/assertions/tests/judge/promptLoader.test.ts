import { EvaliphyError } from '@evaliphy/core';
import fs from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { PromptLoader } from '../../src/promptManager/promptLoader.js';
import { assertionRegistry } from "../../src/registry.js";

vi.mock('node:fs');

describe('PromptLoader', () => {
  const mockAssertion = assertionRegistry.toBeFaithful;

  it('should load and validate a correct prompt', () => {
    const mockContent = `---
name: toBeFaithful
input_variables:
  - question
  - context
  - response
---
Question: {{question}}
Context: {{context}}
Response: {{response}}
`;
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

    const result = PromptLoader.load('test.md', mockAssertion);
    expect(result.template).toContain('Question: {{question}}');
    expect(result.frontmatter.name).toBe('toBeFaithful');
  });

  it('should throw error if file not found', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(() => PromptLoader.load('missing.md', mockAssertion)).toThrow(EvaliphyError);
  });

  it('should throw error if required variables are missing in frontmatter', () => {
    const mockContent = `---
name: toBeFaithful
input_variables:
  - question
---
{{question}}
`;
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

    expect(() => PromptLoader.load('test.md', mockAssertion)).toThrow(/missing required input_variables/);
  });

  it('should throw error if declared variables are not used in template', () => {
    const mockContent = `---
name: toBeFaithful
input_variables:
  - question
  - context
  - response
---
{{question}} {{context}} {{response}}
`;
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

    // This test was failing because it was missing required variables in input_variables
    // but also testing for template usage. Let's fix the template usage test.
    const mockContent2 = `---
name: toBeFaithful
input_variables:
  - question
  - context
  - response
---
{{question}} {{context}}
`;
    vi.mocked(fs.readFileSync).mockReturnValue(mockContent2);
    expect(() => PromptLoader.load('test.md', mockAssertion)).toThrow(/never uses them in the template/);
  });

  it('should throw error if frontmatter is missing', () => {
    const mockContent = `No frontmatter here`;
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

    expect(() => PromptLoader.load('test.md', mockAssertion)).toThrow(/Missing frontmatter block/);
  });

  it('should throw error if template is empty', () => {
    const mockContent = `---
name: toBeFaithful
input_variables:
  - question
  - context
  - response
---
`;
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

    expect(() => PromptLoader.load('test.md', mockAssertion)).toThrow(/template at "test.md" is empty/);
  });
});
