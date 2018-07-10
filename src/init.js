import fs from 'fs';
import $RefParser from 'json-schema-ref-parser';

export function injectComponents(config = {}) {
  return config.plugins;
}

export default function initSchema(config) {
  if (typeof config !== 'object' || !config.schema) {
    throw new Error('Config must be an object with a schema key.');
  }

  if (config.bundled && typeof config.schema === 'object') {
    return config.schema;
  }

  if (config.bundled) {
    return JSON.parse(fs.readFileSync(config.schema, 'utf8'));
  }

  console.warn('Bundling Schema...');

  return $RefParser.bundle(config.schema).then(schema => schema);
}
