import React, { Component } from 'react';
import { map, isEmpty, isObject, get, filter } from 'lodash-es';
import PropTypes from 'prop-types';

import SchemaMatcher from './schema-matcher';

// import modifiers from './plugins/modifierTable';
// import role from './plugins/roleTable';

const plugins = {
  // modifiers,
  // 'metaData.properties.role': role
};

export const ListItem = ({
  name,
  type,
  description,
  values,
  schemaMatcher,
  ...rest
}) => {
  values = map(values, value => (isObject(value) ? value.title : value));
  values = isEmpty(values) ? '' : `<code>${values}</code>`;

  let subProps;

  if (type === 'object') {
    // eslint-disable-next-line no-use-before-define
    subProps = (
      <PropertyList
        items={schemaMatcher.tupleArray(rest.properties)}
        schemaMatcher={schemaMatcher}
      />
    );
  }

  return (
    <li>
      <b>{name}</b>
      <i>[{type}]</i>
      {description}
      {values}
      {subProps}
    </li>
  );
};

ListItem.propTypes = {
  name: PropTypes.string,
  type: PropTypes.string,
  description: PropTypes.string,
  values: PropTypes.array,
  schemaMatcher: PropTypes.func
};

ListItem.defaultProps = {
  name: null,
  type: null,
  description: null,
  values: null,
  schemaMatcher: null
};

export const PropertyList = ({ items, schemaMatcher }) => (
  <ul>
    {map(items, item => <ListItem {...item} schemaMatcher={schemaMatcher} />)}
  </ul>
);

PropertyList.propTypes = {
  schemaMatcher: PropTypes.func,
  items: PropTypes.array
};

PropertyList.defaultProps = {
  schemaMatcher: () => {},
  items: null
};

class Schema extends Component {
  constructor(props) {
    super(props);

    this.schemaMatcher = new SchemaMatcher(props._initData);
  }

  render() {
    const key = this.props.options[0];
    const id = key.args ? key.args[0] : key;
    const rootDefinition = this.schemaMatcher.getRootDefinition(id);

    if (!rootDefinition) {
      return '<div />';
    }

    const requiredProperties = rootDefinition.required || [];

    let properties = this.schemaMatcher.tupleArray(rootDefinition.properties);
    properties = filter(
      properties,
      property =>
        !Object.keys(this.props.plugins).includes(property.name) &&
        !this.props.omitProperties.includes(property.name)
    );

    const required = properties.filter(
      prop => requiredProperties.indexOf(prop.name) > -1
    );
    const optional = properties.filter(
      prop => requiredProperties.indexOf(prop.name) === -1
    );

    return (
      <div>
        <h1>
          {rootDefinition.title || rootDefinition.id || rootDefinition.$id}
        </h1>
        <p>{rootDefinition.description}</p>
        <h2>Structure</h2>
        <h4>Required</h4>
        <PropertyList items={required} schemaMatcher={this.schemaMatcher} />
        <h4>Optional</h4>
        <PropertyList items={optional} schemaMatcher={this.schemaMatcher} />
        {map(plugins, (render, name) =>
          render(
            this.schemaMatcher.resolveWhole(
              get(rootDefinition, `properties.${name}`)
            ) || {}
          )
        )}
      </div>
    );
  }
}

Schema.propTypes = {
  _initData: PropTypes.any,
  plugins: PropTypes.object,
  options: PropTypes.array,
  omitProperties: PropTypes.array
};

Schema.defaultProps = {
  _initData: null,
  plugins: {},
  options: [],
  omitProperties: []
};

export default Schema;
