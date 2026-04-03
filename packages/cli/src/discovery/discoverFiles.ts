import { EvaliphyError, EvaliphyErrorCode, logger } from '@evaliphy/core';
import fg from 'fast-glob';
import fs from 'fs';
import path from 'path';

export interface DiscoveryOptions {
  testDir: string;
  testMatch: string[];
  testIgnore: string[];
}

export async function discoverFiles(options: DiscoveryOptions): Promise<string[]> {
  const { testDir, testMatch, testIgnore } = options;


  const absoluteTestDir = path.resolve(testDir);

  logger.debug({ testDir, absoluteTestDir, testMatch, testIgnore }, 'Discovering files');

  if (!fs.existsSync(absoluteTestDir)) {
    throw new EvaliphyError(
      EvaliphyErrorCode.INVALID_CONFIG,
      `Test directory "${testDir}" does not exist.`,
      'Please check your configuration or provide a valid directory via --dir flag.',
      `Resolved path: ${absoluteTestDir}`
    );
  }

  const entries = await fg(testMatch, {
    cwd: absoluteTestDir,
    ignore: testIgnore,
    absolute: true,
    onlyFiles: true,
  });

  const sortedEntries = entries.sort();
  logger.debug({ count: sortedEntries.length }, 'Discovered %d files', sortedEntries.length);
  logger.debug({ files: sortedEntries }, 'Discovered files list');

  return sortedEntries;
}
