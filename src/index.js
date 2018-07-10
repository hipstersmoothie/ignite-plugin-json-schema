import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SchemaMatcher from './schema-matcher';

export const ListItem = ({
  name,
  type,
  description,
  values,
  schemaMatcher,
  ...rest
}) => {
  values = _.map(values, value => (_.isObject(value) ? value.title : value));
  values = _.isEmpty(values) ? '' : <code>{values}</code>;

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
  schemaMatcher: PropTypes.object
};

ListItem.defaultProps = {
  name: null,
  type: null,
  description: null,
  values: null,
  schemaMatcher: new SchemaMatcher()
};

export const PropertyList = ({ title, items, schemaMatcher }) =>
  items.length ? (
    <div>
      {title && <h4>{title}</h4>}
      <ul>
        {_.map(items, item => (
          <ListItem key={item.name} {...item} schemaMatcher={schemaMatcher} />
        ))}
      </ul>
    </div>
  ) : null;

PropertyList.propTypes = {
  title: PropTypes.string,
  schemaMatcher: PropTypes.object,
  items: PropTypes.array
};

PropertyList.defaultProps = {
  title: '',
  schemaMatcher: {},
  items: []
};

class Schema extends Component {
  constructor(props) {
    super(props);

    this.schemaMatcher = new SchemaMatcher(props._initData);
  }

  render() {
    const key = this.props.options[0] || this.props.id;
    const id = key.args ? key.args[0] : key;
    const rootDefinition = this.schemaMatcher.getRootDefinition(id);

    if (!rootDefinition) {
      return <div />;
    }

    const requiredProperties = rootDefinition.required || [];

    let properties = this.schemaMatcher.tupleArray(rootDefinition.properties);

    properties = _.filter(
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
        <PropertyList
          title="Required"
          items={required}
          schemaMatcher={this.schemaMatcher}
        />
        <PropertyList
          title="Optional"
          items={optional}
          schemaMatcher={this.schemaMatcher}
        />
        {Object.entries(this.props._injectedComponents).map(
          ([name, Component]) => (
            <Component
              key={name}
              schema={
                this.schemaMatcher.resolveWhole(
                  _.get(rootDefinition, `properties.${name}`)
                ) || {}
              }
            />
          )
        )}
      </div>
    );
  }
}

Schema.propTypes = {
  _injectedComponents: PropTypes.object,
  _initData: PropTypes.any,
  id: PropTypes.string,
  plugins: PropTypes.object,
  options: PropTypes.array,
  omitProperties: PropTypes.array
};

Schema.defaultProps = {
  _injectedComponents: {},
  _initData: null,
  id: '',
  plugins: {},
  options: [],
  omitProperties: []
};

export default Schema;
