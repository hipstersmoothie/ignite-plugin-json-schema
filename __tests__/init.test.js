import path from 'path';
import initSchema, { injectComponents } from '../src/init';

test('injectComponents', () => {
  const plugins = {
    foo: 'path/to/foo',
    bar: 'path/to/foo'
  };

  expect(injectComponents({ plugins })).toEqual(plugins);
  expect(injectComponents()).toBeUndefined();
});

describe('initSchema', () => {
  test('bad config', () => {
    expect(() => initSchema()).toThrow();
    expect(() => initSchema({})).toThrow();
  });

  test('already bundled and object included', () => {
    expect(
      initSchema({
        bundled: true,
        schema: {
          id: 'foo',
          properties: {
            bar: {
              type: 'string'
            }
          }
        }
      })
    ).toMatchSnapshot();
  });

  test('already bundled and filepath', () => {
    expect(
      initSchema({
        bundled: true,
        schema: path.resolve(__dirname, './utils/complexSchema.json')
      })
    ).toMatchSnapshot();
  });

  test('bundles schema', async () => {
    expect(
      await initSchema({
        schema: 'http://json-schema.org/learn/examples/address.schema.json'
      })
    ).toMatchSnapshot();
  });

  test('throws error for bad schema', async () => {
    expect(
      initSchema({
        schema: 'http://json-schema.org/learn/examples/card.schema.json'
      })
    ).rejects.toThrow();
  });
});
