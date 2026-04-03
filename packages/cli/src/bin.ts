import { program } from 'commander';
import { ConfigLoader } from '@evaliphy/core';
import { handleFatalError, parseCLI } from './config/cliConfigUtil.js';
import { createProject } from "./initProject/createFolderStructure.js";
import { runRegistry } from './runner/runEval.js';

program
    .name('evaliphy')
    .version('1.0.0')
    .description('Evaliphy — eval runner for LLM pipelines')

program
    .command('init <project-name>')
    .description('Create project structure as recommended by Evaliphy.')
    .action((projectName: string) => {
        createProject(projectName);
    });

program
    .command('eval [file]')
    .description('Run eval function from a file or discover files')
    .option('--config-file <config>', 'Config file to use')
    .option('--eval-dir <path>', 'directory to discover tests in', 'evals')
    .option('--match <pattern>', 'glob pattern to match test files', (val, memo: string[]) => {
        memo.push(val);
        return memo;
    })
    .allowUnknownOption(true)
    .action(async (file, opts) => {
        try {
            // 1. Parse CLI options into config
            const cliConfig = parseCLI(opts)

            // 2. Initialize ConfigLoader with CLI overrides
            ConfigLoader.initialize(cliConfig);

            // 3. Run the registry (discovery mode if no file provided)
            await runRegistry(file)

            process.exit(0)
        } catch (err) {
            handleFatalError(err)
            process.exit(1)
        }
    })

program.parse(process.argv)



