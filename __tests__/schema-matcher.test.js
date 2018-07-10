import SchemaMatcher from '../src/schema-matcher';
import schema from './utils/complexSchema.json';

describe('SchemaMatcher', () => {
  test('resolveRef', () => {
    const matcher = new SchemaMatcher(schema);

    expect(
      matcher.resolveRef({
        $ref:
          '#/properties/errorsAndWarnings/additionalProperties/items/allOf/0/properties/trigger/oneOf/0'
      })
    ).toEqual({ enum: ['onChange', 'onNavigation'] });
  });

  describe('resolveSchema', () => {
    const matcher = new SchemaMatcher(schema);

    test('$ref', () => {
      expect(
        matcher.resolveSchema({
          $ref:
            '#/properties/errorsAndWarnings/additionalProperties/items/allOf/0/properties/trigger/oneOf/0'
        })
      ).toEqual({ enum: ['onChange', 'onNavigation'] });
    });

    test('allOf', () => {
      expect(
        matcher.resolveSchema(
          schema.properties.errorsAndWarnings.additionalProperties.items
        )
      ).toMatchSnapshot();
    });

    test('anyOF', () => {
      expect(
        matcher.resolveSchema(
          schema.properties.navigation.patternProperties['^(?!(?:BEGIN)$).*$']
            .properties.onStart
        )
      ).toMatchSnapshot();
    });
  });

  test('resolveWhole', () => {
    const matcher = new SchemaMatcher(schema);

    expect(
      matcher.resolveWhole(
        {
          $ref:
            '#/properties/errorsAndWarnings/additionalProperties/items/allOf/0/properties/trigger/oneOf/0'
        },
        0
      )
    ).toEqual({
      $ref:
        '#/properties/errorsAndWarnings/additionalProperties/items/allOf/0/properties/trigger/oneOf/0'
    });
  });
});
