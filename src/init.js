import fs from 'fs';
import $RefParser from 'json-schema-ref-parser';

export default function initSchema(config = {}) {
  if (config.bundled && typeof config.schema === 'object') {
    return config.schema;
  }

  if (config.bundled) {
    return JSON.parse(fs.readFileSync(config.schema, 'utf8'));
  }

  console.warn('Bundling Schema...');

  return $RefParser
    .bundle(config.schema)
    .then(schema => schema)
    .catch(err => {
      console.error(err);
    });
}
