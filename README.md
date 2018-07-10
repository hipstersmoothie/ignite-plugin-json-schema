[![CircleCI branch](https://img.shields.io/circleci/project/github/hipstersmoothie/ignite-plugin-json-schema/master.svg?style=for-the-badge)](https://circleci.com/gh/hipstersmoothie/ignite-plugin-json-schema/tree/master) [![Codecov branch](https://img.shields.io/codecov/c/github/hipstersmoothie/ignite-plugin-json-schema/master.svg?style=for-the-badge)](https://codecov.io/gh/hipstersmoothie/ignite-plugin-json-schema/branch/master) [![npm](https://img.shields.io/npm/v/ignite-plugin-json-schema.svg?style=for-the-badge)](https://www.npmjs.com/package/ignite-plugin-json-schema)
[![npm](https://img.shields.io/npm/dt/ignite-plugin-json-schema.svg?style=for-the-badge)](https://www.npmjs.com/package/ignite-plugin-json-schema)

<img width="200" height="200"
      src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/fire.png">

  <h1>
    Ignite Plugin JSON-Schema
  </h1>
  <p>
This plugin for <a href="https://github.com/intuit/Ignite">Ignite</a> takes a <a href="http://json-schema.org/">JSON-Schema</a> and exposes a <a href="https://reactjs.org/docs/react-component.html">Component</a> that matches <a href="http://json-schema.org/latest/json-schema-core.html#id-keyword">ids</a> to auto-generate docs.</p>
</div>

## Usage

Simply provide an id that exists somewhere in your schema.

```html
<Schema id='card' />
```

The plugin will generate docs that describe the required and optional properties.

![Card Docs Example Image](https://raw.githubusercontent.com/hipstersmoothie/gitbook-plugin-json-schema/master/images/cardDocs.png)

## Configuration

### Schema

The basic configuration requires only a path to your schema definition or the schema itself.

```json
{
  "plugins": ["json-schema"],
  "pluginsConfig": {
    "json-schema": {
      "schema": "http://json-schema.org/example/card.json"
    }
  }
}
```

### Bundled

To properly parse a schema and generate the docs, this plugin requires the entire schema to be bundled into one file with only internal $ref pointers. When this plugin is in the `init` phase it will try to bundle the schema by default. If this schema is large it can take quite awhile to bundle it.

To speed up development you might want to pre-bundle your schema with [JSON-Schema-Ref-Parser](https://github.com/BigstickCarpet/json-schema-ref-parser). If you do this you should also state so in your config:

```json
{
  "pluginsConfig": {
    "json-schema": {
      "bundled": true,
      "schema": "./schema/merged_schema.json"
    }
  }
}
```

### Omit Properties

Globally omit properties that are included in all of your schema.

```json
{
  "pluginsConfig": {
    "json-schema": {
      "omitProperties": [
        "names",
        "of",
        "properties",
        "to",
        "exclude",
        "_comment"
      ],
      ...
    }
  }
}
```

### Traverse Objects

Set to true if you want properties that are objects to display their own property list.

```json
{
  "pluginsConfig": {
    "json-schema": {
      "traverseObjects": true,
      ...
    }
  }
}
```

### Plugins

Transform some property in your schema into a more complex UI component. To do this you can map the property key (or path to the key) to a render function. Top level property keys are omitted from the required and optional lists.

```json
{
  "pluginsConfig": {
    "json-schema": {
      "plugins": {
        "modifiers": "./path/to/plugin/modifierTable.jsx",
        "metaData.properties.role": "./path/to/plugin/roleTable.jsx"
      },
      ...
    }
  }
}
```

Example Plugin

```js
import get from 'lodash.get';
import React from 'react';
import PropTypes from 'prop-types';

const getEnumVal = decl => get(decl, 'const') || get(decl, 'enum.0');

const roleRow = schema => (
  <tr>
    <td>{getEnumVal(schema)}</td>
    <td>{schema.description}</td>
  </tr>
);

const RoleTable = ({ oneOf }) => {
  if (!oneOf) return '';

  return (
    <div styles={{ marginTop: 40 }}>
      <h4>Role</h4>
      <table>
        <thead>
          <tr>
            <td>Role</td>
            <td>Description</td>
          </tr>
        </thead>
        <tbody>{oneOf.map(roleRow)}</tbody>
      </table>
    </div>
  );
};

RoleTable.propTypes = {
  oneOf: PropTypes.array
};

RoleTable.defaultProps = {
  oneOf: null
};

export default RoleTable;
```

Which generates:

![Plugin Example](https://raw.githubusercontent.com/hipstersmoothie/gitbook-plugin-json-schema/master/images/pluginExample.png)

# Contributing / Bug Reporting

I built this to work with simple schemas and a very complex specific schema, so there might be patterns that aren't covered by the plugin. For these cases please file an [Issue](https://github.com/hipstersmoothie/ignite-plugin-json-schema/issues) or a [Pull Request](https://github.com/hipstersmoothie/ignite-plugin-json-schema/pulls).
