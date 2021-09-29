const { avroToJsonSchema } = require('../to-json-schema');

const BYTES_PATTERN = '^[\u0000-\u00ff]*$';
const INT_MIN = Math.pow(-2, 31);
const INT_MAX = Math.pow(2, 31) - 1;
const LONG_MIN = Math.pow(-2, 63);
const LONG_MAX = Math.pow(2, 63) - 1;

describe('avroToJsonSchema()', function () {
  it('transforms null values', async function () {
    const result = await avroToJsonSchema({ type: 'null' });
    expect(result).toEqual({ type: 'null' });
  });
  
  it('transforms boolean values', async function () {
    const result = await avroToJsonSchema({ type: 'boolean' });
    expect(result).toEqual({ type: 'boolean' });
  });
  
  it('transforms int values', async function () {
    const result = await avroToJsonSchema({ type: 'int' });
    expect(result).toEqual({ type: 'integer', minimum: INT_MIN, maximum: INT_MAX });
  });
  
  it('transforms long values', async function () {
    const result = await avroToJsonSchema({ type: 'long' });
    expect(result).toEqual({ type: 'integer', minimum: LONG_MIN, maximum: LONG_MAX });
  });
  
  it('transforms float values', async function () {
    const result = await avroToJsonSchema({ type: 'float' });
    expect(result).toEqual({ type: 'number' });
  });
  
  it('transforms double values', async function () {
    const result = await avroToJsonSchema({ type: 'double' });
    expect(result).toEqual({ type: 'number' });
  });
  
  it('transforms bytes values', async function () {
    const result = await avroToJsonSchema({ type: 'bytes' });
    expect(result).toEqual({ type: 'string', pattern: BYTES_PATTERN });
  });
  
  it('transforms string values', async function () {
    const result = await avroToJsonSchema({ type: 'string' });
    expect(result).toEqual({ type: 'string' });
  });

  it('transforms uuid values', async function () {
    const result = await avroToJsonSchema({ type: 'uuid' });
    expect(result).toEqual({ type: 'string' });
  });
  
  it('transforms fixed values', async function () {
    const result = await avroToJsonSchema({ type: 'fixed', size: 5 });
    expect(result).toEqual({ type: 'string', pattern: BYTES_PATTERN, minLength: 5, maxLength: 5 });
  });
  
  it('transforms union values', async function () {
    const result = await avroToJsonSchema(['null', 'int']);
    expect(result).toEqual({ oneOf: [{ type: 'integer', minimum: INT_MIN, maximum: INT_MAX }, { type: 'null' }] });
  });
  
  it('transforms map values', async function () {
    const result = await avroToJsonSchema({ type: 'map', values: 'long' });
    expect(result).toEqual({ type: 'object', additionalProperties: { type: 'integer', minimum: LONG_MIN, maximum: LONG_MAX } });
  });
  
  it('transforms array values', async function () {
    const result = await avroToJsonSchema({ type: 'array', items: 'long' });
    expect(result).toEqual({ type: 'array', items: { type: 'integer', minimum: LONG_MIN, maximum: LONG_MAX } });
  });
  
  it('transforms enum values', async function () {
    const result = await avroToJsonSchema({ type: 'enum', doc: 'My test enum', symbols: ['one', 'two', 'three'], default: 'one' });
    expect(result).toEqual({ type: 'string', enum: ['one', 'two', 'three'], default: 'one', description: 'My test enum' });
  });
  
  it('transforms record values', async function () {
    const result = await avroToJsonSchema({
      type: 'record',
      doc: 'My test record',
      name: 'MyName',
      fields: [
        { name: 'key1', type: 'long', doc: 'Key1 docs' },
        { name: 'key2', type: 'string', default: 'value2', doc: 'Key2 docs' },
      ]
    });
    expect(result).toEqual({
      type: 'object',
      'x-parser-schema-id': 'MyName',
      description: 'My test record',
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
      await avroToJsonSchema({ type: 'int', default: 1 })
    ).toEqual({ type: 'integer', minimum: INT_MIN, maximum: INT_MAX, default: 1 });
    
    expect(
      await avroToJsonSchema({ type: 'record', fields: [{ name: 'field1', type: 'string', default: 'AsyncAPI rocks!' }] })
    ).toEqual({ type: 'object', properties: { field1: { type: 'string', default: 'AsyncAPI rocks!' } } });
  });
  
  it('treats array Avro documents as unions', async function () {
    expect(
      await avroToJsonSchema([{ type: 'int', default: 1 }, 'string'])
    ).toEqual({ oneOf: [
      { type: 'integer', minimum: INT_MIN, maximum: INT_MAX, default: 1 },
      { type: 'string' },
    ] });
  });
});
