import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const SETTINGS_PATH = join(homedir(), '.claude', 'settings.json');

function getVscodeSettingsPath() {
  if (process.platform === 'win32') {
    return join(process.env.APPDATA || homedir(), 'Code', 'User', 'settings.json');
  }
  if (process.platform === 'darwin') {
    return join(homedir(), 'Library', 'Application Support', 'Code', 'User', 'settings.json');
  }
  return join(homedir(), '.config', 'Code', 'User', 'settings.json');
}

function readJsonFile(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return {};
  }
}

function writeJsonFile(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

function readSettings() {
  return readJsonFile(SETTINGS_PATH);
}

function writeSettings(settings) {
  mkdirSync(join(homedir(), '.claude'), { recursive: true });
  writeJsonFile(SETTINGS_PATH, settings);
}

function applyVscode(verbSet) {
  const vscPath = getVscodeSettingsPath();
  try {
    const vscSettings = readJsonFile(vscPath);
    vscSettings['claudeCode.spinnerVerbs'] = {
      mode: 'replace',
      verbs: verbSet.verbs,
    };
    writeJsonFile(vscPath, vscSettings);
  } catch {
    // VSCode settings not available, skip
  }
}

function resetVscode() {
  const vscPath = getVscodeSettingsPath();
  try {
    const vscSettings = readJsonFile(vscPath);
    delete vscSettings['claudeCode.spinnerVerbs'];
    writeJsonFile(vscPath, vscSettings);
  } catch {
    // VSCode settings not available, skip
  }
}

export function apply(verbSet) {
  const settings = readSettings();
  settings.spinnerVerbs = {
    mode: 'replace',
    verbs: verbSet.verbs,
  };
  writeSettings(settings);
  applyVscode(verbSet);
}

export function reset() {
  const settings = readSettings();
  delete settings.spinnerVerbs;
  writeSettings(settings);
  resetVscode();
}

export function current() {
  const settings = readSettings();
  return settings.spinnerVerbs ?? null;
}
