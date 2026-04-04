import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

const green  = (s: string) => `\x1b[32m${s}\x1b[0m`;
const bold   = (s: string) => `\x1b[1m${s}\x1b[0m`;
const dim    = (s: string) => `\x1b[2m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const red    = (s: string) => `\x1b[31m${s}\x1b[0m`;

export function createProject(projectName: string) {
  // ── resolve version ────────────────────────────────────────────
  const __filename = fileURLToPath(import.meta.url);
  const __dirname  = path.dirname(__filename);
  const {version}  = require(path.join(__dirname, '../package.json'));

  // ── validate project name ──────────────────────────────────────
  if (!/^[a-z0-9-_]+$/i.test(projectName)) {
    console.error(red(`\n  ✗ Invalid project name "${projectName}".`));
    console.error(dim('    Use only letters, numbers, hyphens and underscores.\n'));
    process.exit(1);
  }

  const rootPath = path.join(process.cwd(), projectName);

  if (fs.existsSync(rootPath)) {
    console.error(red(`\n  ✗ Directory "${projectName}" already exists.`));
    console.error(dim(`    Choose a different name or remove the existing directory.\n`));
    process.exit(1);
  }

  console.log(`\n  Creating project ${bold(projectName)}...\n`);

  // ── folder structure ───────────────────────────────────────────
  const structure: Record<string, any> = {
    evals: {
      'example.eval.ts': `import { evaluate, expect } from 'evaliphy';

/**
 * Example evaluation — replace this with your own RAG endpoint and samples.
 * Docs: https://evaliphy.com/docs/quick-start
 */
evaluate("context handling: multiple chunks", async ({ httpClient }) => {
  const query   = "What are the support hours?";
  const context = [
    "Support is available 24/7 via email.",
    "Live chat support is open from 9 AM to 5 PM EST.",
    "Phone support is currently unavailable."
  ];

  const res  = await httpClient.post("/api/generate", { prompt: query });
  const data = await res.json();

  await expect({
    query,
    response: data.content,
    context,
  }).toBeFaithful({ threshold: 0.7 });
});
`,
    },

    '.env.example': `# Copy this file to .env and fill in your values
OPENAI_API_KEY=your-api-key-here
`,

    '.gitignore': `.env
node_modules
dist
results
`,

    'evaliphy.config.ts': `import { defineConfig } from 'evaliphy';

export default defineConfig({
  http: {
    baseUrl: "http://localhost:8080",
    timeout: 10_000,
  },
  evalDir: './evals',
  llmAsJudgeConfig: {
    model: 'gpt-4o-mini',
    provider: {
      type: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
    },
    temperature: 0,
  },
});
`,

    'tsconfig.json': JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          module: 'ESNext',
          moduleResolution: 'bundler',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          outDir: './dist',
        },
        include: ['**/*.ts'],
        exclude: ['node_modules', 'dist'],
      },
      null,
      2
    ),
  };

  // ── create files ───────────────────────────────────────────────
  try {
    fs.mkdirSync(rootPath, {recursive: true});
    createStructure(rootPath, structure);
  } catch (err) {
    console.error(red('\n  ✗ Failed to create project files.'));
    console.error(dim(`    ${(err as Error).message}\n`));
    process.exit(1);
  }

  // ── package.json ───────────────────────────────────────────────
  const pkg = {
    name: projectName,
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      test:  'evaliphy eval',
      build: 'tsc',
    },
    devDependencies: {
      'evaliphy': `^${version}`,
      typescript: '^5.0.0',
    },
  };

  try {
    fs.writeFileSync(
      path.join(rootPath, 'package.json'),
      JSON.stringify(pkg, null, 2)
    );
  } catch (err) {
    console.error(red('\n  ✗ Failed to write package.json.'));
    console.error(dim(`    ${(err as Error).message}\n`));
    process.exit(1);
  }

  // ── success output ─────────────────────────────────────────────
  console.log(`  ${green('✓')} evaliphy.config.ts`);
  console.log(`  ${green('✓')} evals/example.eval.ts`);
  console.log(`  ${green('✓')} .env.example`);
  console.log(`  ${green('✓')} .gitignore`);
  console.log(`  ${green('✓')} tsconfig.json`);
  console.log(`  ${green('✓')} package.json`);

  console.log(`
  ${green('✓')} ${bold(`Project "${projectName}" created successfully!`)}

  ${bold('Next steps:')}
    ${dim('$')} Ensuer you have Node JS either v24.0.0 or higher.
    ${dim('$')} cd ${projectName}
    ${dim('$')} cp .env.example .env     ${dim('← add your OPENAI_API_KEY')}
    ${dim('$')} npm install
    ${dim('$')} npm test

  ${dim(`Docs     → https://evaliphy.com/docs`)}
  ${dim(`Examples → https://evaliphy.com/docs/examples`)}
`);
}


function createStructure(basePath: string, structure: Record<string, any>) {
  for (const [name, content] of Object.entries(structure)) {
    const fullPath = path.join(basePath, name);

    if (typeof content === 'string') {
      fs.mkdirSync(path.dirname(fullPath), {recursive: true});
      fs.writeFileSync(fullPath, content, 'utf8');
    } else {
      fs.mkdirSync(fullPath, {recursive: true});
      createStructure(fullPath, content);
    }
  }
}
