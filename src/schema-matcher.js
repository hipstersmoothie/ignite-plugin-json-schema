import _ from 'lodash';
import deepmerge from 'deepmerge';

function escapeRegExp(string) {
  if (typeof string !== 'string') {
    return string;
  }

  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

class SchemaMatcher {
  constructor(userSchema) {
    this.schema = userSchema;
  }

  resolveRef(value) {
    if (!value.$ref) {
      return value;
    }

    const pathParts = value.$ref.substring(2).split('/');
    const pathLength = pathParts.length;
    const currentParts = [pathParts.shift()];

    let foundSchema;

    while (currentParts.length <= pathLength) {
      foundSchema = _.get(this.schema, currentParts.join('.'));

      if (foundSchema.$ref) {
        foundSchema = this.resolveRef(foundSchema);
        foundSchema = foundSchema[0] || foundSchema;

        return pathParts.length
          ? _.get(foundSchema, pathParts.join('.'))
          : foundSchema;
      }

      currentParts.push(pathParts.shift());
    }

    return foundSchema;
  }

  resolveSchema = definition => {
    if (!definition) {
      return definition;
    }

    if (definition.$ref) {
      const resolved = this.resolveRef(definition);
      return this.resolveSchema(resolved);
    }

    if (definition.allOf) {
      const allOf = _.map(definition.allOf, def => {
        const resolved = this.resolveSchema(def);
        return {
          ...resolved,
          properties: _.mapValues(resolved.properties, this.resolveSchema)
        };
      });

      definition = deepmerge.all([...allOf, definition]);
    }

    if (definition.anyOf) {
      definition.anyOf = _.map(definition.anyOf, def => {
        if (def.$ref) {
          const resolved = this.resolveRef(def);
          return this.resolveSchema(resolved);
        }

        return def;
      });
    }

    return definition;
  };

  tupleArray(properties) {
    return _.map(properties, (value, key) =>
      Object.assign({}, value, this.resolveRef(value), {
        name: key
      })
    );
  }

  resolveWhole(definition, levels = 3) {
    if (levels === 0) {
      return definition;
    }
    if (!_.isObject(definition)) {
      return definition;
    }

    definition = this.resolveSchema(definition);

    _.map(definition, (schemaDef, key) => {
      definition[key] = this.resolveWhole(schemaDef, levels - 1);
    });

    return definition;
  }

  findMatchingDefinitions = (schema = this.schema, identifier) => {
    if (!_.isObject(schema)) {
      return;
    }

    const id = schema.$id || schema.id;

    const idRegex = new RegExp(escapeRegExp(id), 'i');

    if (typeof id === 'string' && identifier.match(idRegex)) {
      return [schema];
    }

    let found = _.map(schema, schemaDef =>
      this.findMatchingDefinitions(schemaDef, identifier)
    );

    found = _.union(...found);
    found = _.filter(found, _.isObject);

    return found;
  };

  getRootDefinition = identifier => {
    const definitions = this.findMatchingDefinitions(this.schema, identifier);
    const definition = definitions ? definitions[0] : {};

    return this.resolveSchema(definition);
  };
}

export default SchemaMatcher;
