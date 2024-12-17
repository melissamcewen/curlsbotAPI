#!/usr/bin/env node

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Command } from 'commander';

import { setupValidateCommands } from './commands/validate';
import { setupFixCommands } from './commands/fix';

const __dirname = dirname(fileURLToPath(import.meta.url));

const program = new Command();

program
  .name('curlsbot-cli')
  .description('CLI tools for CurlsBot API development')
  .version('1.0.0');

// Setup all commands
setupValidateCommands(program);
setupFixCommands(program);

program.parse();
