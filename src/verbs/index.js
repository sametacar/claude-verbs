import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export const verbs = {
  lotr: require('./lotr.json'),
  sw: require('./sw.json'),
};

export function list() {
  return Object.values(verbs).map(({ id, name }) => ({ id, name }));
}

export function get(id) {
  const set = verbs[id];
  if (!set) {
    throw new Error(`Unknown verb set: "${id}". Available: ${Object.keys(verbs).join(', ')}`);
  }
  return set;
}
