#!/usr/bin/env node
import { list, get } from '../src/verbs/index.js';
import * as claudeCode from '../src/adapters/claude-code.js';
import { showMenu } from '../src/menu.js';

const [,, command, ...args] = process.argv;

function help() {
  console.log(`
claude-verbs — Change Claude Code spinner verbs

Usage:
  claude-verbs list              List available themes
  claude-verbs use <theme>       Apply a theme
  claude-verbs reset             Reset to Claude Code defaults
  claude-verbs current           Show currently applied verbs
`);
}

switch (command) {
  case 'list': {
    const themes = list();
    console.log('\nAvailable themes:\n');
    for (const { id, name } of themes) {
      console.log(`  ${id.padEnd(12)} ${name}`);
    }
    console.log();
    break;
  }

  case 'use': {
    const id = args[0];
    if (!id) {
      console.error('Usage: claude-verbs use <theme>');
      process.exit(1);
    }
    try {
      const verbSet = get(id);
      claudeCode.apply(verbSet);
      console.log(`✓ Applied "${verbSet.name}" to Claude Code`);
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
    break;
  }

  case 'reset': {
    claudeCode.reset();
    console.log('✓ Spinner verbs reset to Claude Code defaults');
    break;
  }

  case 'current': {
    const current = claudeCode.current();
    if (!current) {
      console.log('No custom spinner verbs set (using Claude Code defaults)');
    } else {
      console.log('\nCurrent spinner verbs:\n');
      for (const verb of current.verbs) {
        console.log(`  ${verb}`);
      }
      console.log();
    }
    break;
  }

  case undefined: {
    showMenu();
    break;
  }

  default: {
    help();
    break;
  }
}
