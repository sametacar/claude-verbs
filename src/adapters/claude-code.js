import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const SETTINGS_PATH = join(homedir(), '.claude', 'settings.json');

function readSettings() {
  try {
    return JSON.parse(readFileSync(SETTINGS_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function writeSettings(settings) {
  mkdirSync(join(homedir(), '.claude'), { recursive: true });
  writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + '\n');
}

export function apply(verbSet) {
  const settings = readSettings();
  settings.spinnerVerbs = {
    mode: 'replace',
    verbs: verbSet.verbs,
  };
  writeSettings(settings);
}

export function reset() {
  const settings = readSettings();
  delete settings.spinnerVerbs;
  writeSettings(settings);
}

export function current() {
  const settings = readSettings();
  return settings.spinnerVerbs ?? null;
}
