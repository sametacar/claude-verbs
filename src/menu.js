import { list, get } from './verbs/index.js';
import * as claudeCode from './adapters/claude-code.js';

function getCurrentThemeId() {
  const current = claudeCode.current();
  if (!current) return null;
  for (const { id } of list()) {
    const verbSet = get(id);
    if (JSON.stringify(verbSet.verbs) === JSON.stringify(current.verbs)) {
      return id;
    }
  }
  return null;
}

function write(s) {
  process.stdout.write(s);
}

export function showMenu() {
  if (!process.stdin.isTTY) {
    console.error('No TTY available. Use: claude-verbs use <theme>');
    process.exit(1);
  }

  const themes = list();
  const items = [...themes, { id: 'reset', name: 'Reset to defaults' }];
  const themeCount = themes.length;

  const activeId = getCurrentThemeId();
  let selected = Math.max(0, items.findIndex(
    item => item.id === activeId || (item.id === 'reset' && activeId === null)
  ));

  write('\x1b[?1049h'); // enter alt screen
  write('\x1b[?25l');   // hide cursor

  const cleanup = () => {
    write('\x1b[?25h');   // show cursor
    write('\x1b[?1049l'); // exit alt screen
    process.stdin.setRawMode(false);
    process.stdin.pause();
  };

  const draw = () => {
    write('\x1b[H\x1b[2J\x1b[H'); // move top-left, clear, move again

    write('\x1b[1;36mclaude-verbs\x1b[0m\n');
    write('\x1b[2m────────────────────────────────────────\x1b[0m\n');
    write('\n');
    write('  \x1b[2m↑↓\x1b[0m navigate   \x1b[2mEnter\x1b[0m select   \x1b[2mq\x1b[0m quit\n');
    write('\n');

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (i === themeCount) {
        write('\x1b[2m  ────────────────────────\x1b[0m\n');
      }

      const isSelected = i === selected;
      const isActive = item.id === activeId || (item.id === 'reset' && activeId === null);
      const name = item.name;

      if (isSelected && isActive) {
        write(`  \x1b[1;32m> ${name.padEnd(24)}\x1b[2m [active]\x1b[0m\n`);
      } else if (isSelected) {
        write(`  \x1b[1;32m> ${name}\x1b[0m\n`);
      } else if (isActive) {
        write(`  \x1b[33m  ${name.padEnd(24)}\x1b[2m [active]\x1b[0m\n`);
      } else {
        write(`    ${name}\n`);
      }
    }
  };

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  draw();

  process.stdin.on('data', (key) => {
    if (key === '\x03' || key === 'q' || key === 'Q') {
      cleanup();
      process.exit(0);
    }

    if (key === '\x1b[A') {
      selected = (selected - 1 + items.length) % items.length;
      draw();
    } else if (key === '\x1b[B') {
      selected = (selected + 1) % items.length;
      draw();
    } else if (key === '\r') {
      const item = items[selected];
      cleanup();

      if (item.id === 'reset') {
        claudeCode.reset();
        write('\x1b[1;33m✓ Reset to Claude Code defaults\x1b[0m\n');
      } else {
        const verbSet = get(item.id);
        claudeCode.apply(verbSet);
        write(`\x1b[1;32m✓ Applied "${verbSet.name}" to Claude Code\x1b[0m\n`);
      }

      process.exit(0);
    }
  });
}
