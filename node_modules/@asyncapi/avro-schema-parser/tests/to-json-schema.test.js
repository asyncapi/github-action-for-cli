const {avroToJsonSchema} = require('../to-json-schema');

const BYTES_PATTERN = '^[\u0000-\u00ff]*$';
const INT_MIN = Math.pow(-2, 31);
const INT_MAX = Math.pow(2, 31) - 1;
const LONG_MIN = Math.pow(-2, 63);
const LONG_MAX = Math.pow(2, 63) - 1;

describe('avroToJsonSchema()', function () {
  it('transforms null values', async function () {
    const result = await avroToJsonSchema({type: 'null'});
    expect(result).toEqual({type: 'null'});
  });

  it('transforms boolean values', async function () {
    const result = await avroToJsonSchema({type: 'boolean'});
    expect(result).toEqual({type: 'boolean'});
  });

  it('transforms int values', async function () {
    const result = await avroToJsonSchema({type: 'int'});
    expect(result).toEqual({type: 'integer', minimum: INT_MIN, maximum: INT_MAX});
  });

  it('transforms long values', async function () {
    const result = await avroToJsonSchema({type: 'long'});
    expect(result).toEqual({type: 'integer', minimum: LONG_MIN, maximum: LONG_MAX});
  });

  it('transforms float values', async function () {
    const result = await avroToJsonSchema({type: 'float'});
    expect(result).toEqual({type: 'number', format: 'float'});
  });

  it('transforms double values', async function () {
    const result = await avroToJsonSchema({type: 'double'});
    expect(result).toEqual({type: 'number', format: 'double'});
  });

  it('transforms bytes values', async function () {
    const result = await avroToJsonSchema({type: 'bytes'});
    expect(result).toEqual({type: 'string', pattern: BYTES_PATTERN});
  });

  it('transforms string values', async function () {
    const result = await avroToJsonSchema({type: 'string'});
    expect(result).toEqual({type: 'string'});
  });

  it('transforms uuid values', async function () {
    const result = await avroToJsonSchema({type: 'uuid'});
    expect(result).toEqual({type: 'string'});
  });

  it('transforms fixed values', async function () {
    const result = await avroToJsonSchema({type: 'fixed', size: 5});
    expect(result).toEqual({type: 'string', pattern: BYTES_PATTERN, minLength: 5, maxLength: 5});
  });

  it('transforms union values', async function () {
    const result = await avroToJsonSchema(['null', 'int']);
    expect(result).toEqual({oneOf: [{type: 'integer', minimum: INT_MIN, maximum: INT_MAX}, {type: 'null'}]});
  });

  it('transforms map values', async function () {
    const result = await avroToJsonSchema({type: 'map', values: 'long'});
    expect(result).toEqual({
      type: 'object',
      additionalProperties: {type: 'integer', minimum: LONG_MIN, maximum: LONG_MAX}
    });
  });

  it('transforms array values', async function () {
    const result = await avroToJsonSchema({type: 'array', items: 'long'});
    expect(result).toEqual({type: 'array', items: {type: 'integer', minimum: LONG_MIN, maximum: LONG_MAX}});
  });

  it('transforms enum values', async function () {
    const result = await avroToJsonSchema({
      type: 'enum',
      doc: 'My test enum',
      symbols: ['one', 'two', 'three'],
      default: 'one'
    });
    expect(result).toEqual({
      type: 'string',
      enum: ['one', 'two', 'three'],
      default: 'one',
      description: 'My test enum'
    });
  });

  it('transforms record values', async function () {
    const result = await avroToJsonSchema({
      type: 'record',
      doc: 'My test record',
      name: 'MyName',
      fields: [
        {name: 'key1', type: 'long', doc: 'Key1 docs'},
        {name: 'key2', type: 'string', default: 'value2', doc: 'Key2 docs'},
      ]
    });
    expect(result).toEqual({
      type: 'object',
      'x-parser-schema-id': 'MyName',
      description: 'My test record',
      required: ['key1'],
      properties: {
        key1: {
          type: 'integer',
          minimum: LONG_MIN,
          maximum: LONG_MAX,
          description: 'Key1 docs',
        },
        key2: {
          type: 'string',
          default: 'value2',
          description: 'Key2 docs',
        },
      }
    });
  });

  it('assigns default values correctly in types and fields', async function () {
    expect(
      await avroToJsonSchema({type: 'int', default: 1})
    ).toEqual({type: 'integer', minimum: INT_MIN, maximum: INT_MAX, default: 1});

    expect(
      await avroToJsonSchema({type: 'record', fields: [{name: 'field1', type: 'string', default: 'AsyncAPI rocks!'}]})
    ).toEqual({
      type: 'object',
      properties: {field1: {type: 'string', default: 'AsyncAPI rocks!'}}
    });
  });

  it('treats array Avro documents as unions', async function () {
    expect(
      await avroToJsonSchema([{type: 'int', default: 1}, 'string'])
    ).toEqual({
      oneOf: [
        {type: 'integer', minimum: INT_MIN, maximum: INT_MAX, default: 1},
        {type: 'string'},
      ]
    });
  });
});

describe('supportExampleAttribute', function () {
  it('transforms example on union values', async function () {
    const result = await avroToJsonSchema({
      type: 'record',
      name: 'MyName',
      fields: [
        {name: 'example', type: ['null', 'int'], example: 3}
      ]
    });
    expect(result).toEqual({
      type: 'object',
      'x-parser-schema-id': 'MyName',
      properties: {
        example: {
          oneOf: [{
            type: 'integer',
            minimum: INT_MIN,
            maximum: INT_MAX,
            examples: [3]
          }, {
            type: 'null'
          }
          ]
        }
      }
    });
  });
});

describe('requiredAttributesMapping()', function () {
  it('support required fields', async function () {
    const result = await avroToJsonSchema({
      type: 'record',
      doc: 'My test record',
      name: 'MyName',
      fields: [
        {name: 'required1', type: ['int', 'long']},
        {name: 'required2', type: ['long']},
        {name: 'notRequiredBecauseDefault', type: 'string', default: 'value2'},
        {name: 'notRequiredBecauseUnionWithNull', type: ['null', 'string']},
      ]
    });
    expect(result).toMatchObject({
      type: 'object',
      'x-parser-schema-id': 'MyName',
      description: 'My test record',
      required: ['required1', 'required2']
    });
  });
});

describe('additionalAttributesMapping()', function () {
  it('support minimum and maximum for float', async function () {
    const result = await avroToJsonSchema({type: 'float', minimum: 0, maximum: 10});
    expect(result).toEqual({type: 'number', format: 'float', minimum: 0, maximum: 10});
  });

  it('support exclusiveMinimum and exclusiveMaximum for float', async function () {
    const result = await avroToJsonSchema({type: 'float', exclusiveMinimum: 0, exclusiveMaximum: 10});
    expect(result).toEqual({type: 'number', format: 'float', exclusiveMinimum: 0, exclusiveMaximum: 10});
  });

  it('support minimum and maximum for double', async function () {
    const result = await avroToJsonSchema({type: 'double', minimum: 0, maximum: 10});
    expect(result).toEqual({type: 'number', format: 'double', minimum: 0, maximum: 10});
  });

  it('support exclusiveMinimum and exclusiveMaximum for double', async function () {
    const result = await avroToJsonSchema({type: 'double', exclusiveMinimum: 0, exclusiveMaximum: 10});
    expect(result).toMatchObject({type: 'number', format: 'double', exclusiveMinimum: 0, exclusiveMaximum: 10});
  });

  it('support minimum and maximum for long and int', async function () {
    let result = await avroToJsonSchema({type: 'long', minimum: 0, maximum: 10});
    expect(result).toEqual({type: 'integer', minimum: 0, maximum: 10});

    result = await avroToJsonSchema({type: 'int', minimum: 0, maximum: 10});
    expect(result).toEqual({type: 'integer', minimum: 0, maximum: 10});
  });

  it('long and int type support exclusiveMinimum and exclusiveMaximum', async function () {
    let result = await avroToJsonSchema({type: 'long', exclusiveMinimum: 0, exclusiveMaximum: 10});
    expect(result).toMatchObject({type: 'integer', exclusiveMinimum: 0, exclusiveMaximum: 10});

    result = await avroToJsonSchema({type: 'int', exclusiveMinimum: 0, exclusiveMaximum: 10});
    expect(result).toMatchObject({type: 'integer', exclusiveMinimum: 0, exclusiveMaximum: 10});
  });

  it('support pattern, minLength and maxLength for string', async function () {
    const result = await avroToJsonSchema({type: 'string', pattern: '$pattern^', minLength: 1, maxLength: 10});
    expect(result).toEqual({type: 'string', pattern: '$pattern^', minLength: 1, maxLength: 10});
  });

  it('handle non-negative integer value for minLength and maxLength', async function () {
    const result = await avroToJsonSchema({type: 'string', minLength: -1, maxLength: -110});
    expect(result).toEqual({type: 'string'});
  });

  it('support minItems and maxItems for array', async function () {
    const result = await avroToJsonSchema({type: 'array', items: 'long', minItems: 0, maxItems: 10});
    expect(result).toMatchObject({type: 'array', items: {type: 'integer'}, minItems: 0, maxItems: 10});
  });

  it('support uniqueItems for array', async function () {
    const result = await avroToJsonSchema({type: 'array', items: 'long', uniqueItems: true});
    expect(result).toMatchObject({type: 'array', items: {type: 'integer'}, uniqueItems: true});
  });
});
