import _ from 'lodash';
import React from 'react';
import renderer from 'react-test-renderer';

import Schema, { ListItem, PropertyList } from '../src';

const render = node => renderer.create(node).toJSON();

describe('ListItem', () => {
  test('no value', () => {
    expect(
      render(<ListItem name="testItem" type="something" />)
    ).toMatchSnapshot();
  });

  test('with value', () => {
    expect(
      render(
        <ListItem
          name="testItem"
          type="something"
          values={['one', { title: 'two' }, 'three']}
        />
      )
    ).toMatchSnapshot();
  });

  test('with sub props', () => {
    expect(
      render(
        <ListItem
          name="testItem"
          type="object"
          properties={{
            prop1: {
              type: 'string'
            },
            prop2: {
              type: 'string'
            }
          }}
        />
      )
    ).toMatchSnapshot();
  });
});

describe('PropertyList', () => {
  test('no properties', () => {
    expect(render(<PropertyList title="Title" />)).toMatchSnapshot();
  });

  test('has properties', () => {
    expect(
      render(
        <PropertyList
          title="Title"
          items={[
            { name: 'testItem', type: 'something' },
            {
              name: 'testItem2',
              type: 'something',
              values: ['one', { title: 'two' }, 'three']
            }
          ]}
        />
      )
    ).toMatchSnapshot();
  });
});

describe('Schema Component', () => {
  const _initData = {
    title: 'title',
    id: 'root',
    description: 'description',
    required: ['requiredProp'],
    properties: {
      requiredProp: {
        type: 'string'
      },
      optionalProp: {
        type: 'string'
      }
    }
  };

  test('root def not found', () => {
    expect(render(<Schema _initData={_initData} />)).toMatchSnapshot();
  });

  test('root def found', () => {
    expect(
      render(<Schema id="root" _initData={_initData} />)
    ).toMatchSnapshot();
    expect(
      render(<Schema options={[{ args: ['root'] }]} _initData={_initData} />)
    ).toMatchSnapshot();
  });

  test('displays correct title', () => {
    expect(
      render(<Schema id="root" _initData={_.omit(_initData, 'title')} />)
    ).toMatchSnapshot();
    expect(
      render(
        <Schema
          options={[{ args: ['root'] }]}
          _initData={{
            ..._.omit(_initData, ['title', 'id']),
            $id: 'root'
          }}
        />
      )
    ).toMatchSnapshot();
  });

  test('excludes plugins', () => {
    expect(
      render(
        <Schema
          id="root"
          _initData={_initData}
          plugins={{ optionalProp: () => {} }}
          _injectedComponents={{
            optionalProp: () => <div>Custom</div>,
            nonExistentProp: () => <div>Nothing here</div>
          }}
        />
      )
    ).toMatchSnapshot();
  });

  test('excludes omitted property', () => {
    expect(
      render(
        <Schema
          id="root"
          _initData={_.omit(_initData, 'required')}
          omitProperties={['requiredProp']}
        />
      )
    ).toMatchSnapshot();
  });
});
