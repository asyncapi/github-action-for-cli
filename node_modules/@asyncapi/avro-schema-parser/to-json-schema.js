const BYTES_PATTERN = '^[\u0000-\u00ff]*$';
const INT_MIN = Math.pow(-2, 31);
const INT_MAX = Math.pow(2, 31) - 1;
const LONG_MIN = Math.pow(-2, 63);
const LONG_MAX = Math.pow(2, 63) - 1;

const typeMappings = {
  null: 'null',
  boolean: 'boolean',
  int: 'integer',
  long: 'integer',
  float: 'number',
  double: 'number',
  bytes: 'string',
  string: 'string',
  fixed: 'string',
  map: 'object',
  array: 'array',
  enum: 'string',
  record: 'object',
  uuid: 'string',
};

const commonAttributesMapping = (avroDefinition, jsonSchema, isTopLevel) => {
  if (avroDefinition.doc) jsonSchema.description = avroDefinition.doc;
  if (avroDefinition.default !== undefined) jsonSchema.default = avroDefinition.default;

  const fullyQualifiedName = getFullyQualifiedName(avroDefinition);
  if (isTopLevel && fullyQualifiedName !== undefined) {
    jsonSchema['x-parser-schema-id'] = fullyQualifiedName;
  }
};

function getFullyQualifiedName(avroDefinition) {
  let name;

  if (avroDefinition.name) {
    if (avroDefinition.namespace) {
      name = `${avroDefinition.namespace}.${avroDefinition.name}`;
    } else {
      name = avroDefinition.name;
    }
  }

  return name;
}

const exampleAttributeMapping = (typeInput, example, jsonSchemaInput) => {
  let type = typeInput;
  let jsonSchema = jsonSchemaInput;

  // Map example to first non-null type
  if (Array.isArray(typeInput) && typeInput.length > 0) {
    const pickSecondType = typeInput.length > 1 && typeInput[0] === 'null';
    type = typeInput[+pickSecondType];
    jsonSchema = jsonSchema.oneOf[0];
  }

  if (example === undefined || jsonSchema.examples || Array.isArray(type)) return;

  switch (type) {
  case 'boolean':
    jsonSchema.examples = [example === 'true'];
    break;
  case 'int':
    jsonSchema.examples = [parseInt(example, 10)];
    break;
  default:
    jsonSchema.examples = [example];
  }
};

async function convertAvroToJsonSchema(avroDefinition, isTopLevel) {
  const jsonSchema = {};
  const isUnion = Array.isArray(avroDefinition);

  if (isUnion) {
    jsonSchema.oneOf = [];
    let nullDef = null;
    for (const avroDef of avroDefinition) {
      const def = await convertAvroToJsonSchema(avroDef, isTopLevel);
      // avroDef can be { type: 'int', default: 1 } and this is why avroDef.type has priority here
      const defType = avroDef.type || avroDef;
      // To prefer non-null values in the examples skip null definition here and push it as the last element after loop
      if (defType === 'null') nullDef = def; else jsonSchema.oneOf.push(def);
    }

    if (nullDef) jsonSchema.oneOf.push(nullDef);

    return jsonSchema;
  }

  // Avro definition can be a string (e.g. "int")
  // or an object like { type: "int" }
  const type = avroDefinition.type || avroDefinition;
  jsonSchema.type = typeMappings[type];

  switch (type) {
  case 'int':
    jsonSchema.minimum = INT_MIN;
    jsonSchema.maximum = INT_MAX;
    break;
  case 'long':
    jsonSchema.minimum = LONG_MIN;
    jsonSchema.maximum = LONG_MAX;
    break;
  case 'bytes':
    jsonSchema.pattern = BYTES_PATTERN;
    break;
  case 'fixed':
    jsonSchema.pattern = BYTES_PATTERN;
    jsonSchema.minLength = avroDefinition.size;
    jsonSchema.maxLength = avroDefinition.size;
    break;
  case 'map':
    jsonSchema.additionalProperties = await convertAvroToJsonSchema(avroDefinition.values, false);
    break;
  case 'array':
    jsonSchema.items = await convertAvroToJsonSchema(avroDefinition.items, false);
    break;
  case 'enum':
    jsonSchema.enum = avroDefinition.symbols;
    break;
  case 'record':
    const propsMap = new Map();
    for (const field of avroDefinition.fields) {
      const def = await convertAvroToJsonSchema(field.type, false);

      commonAttributesMapping(field, def, false);
      exampleAttributeMapping(field.type, field.example, def);

      propsMap.set(field.name, def);
    }
    jsonSchema.properties = Object.fromEntries(propsMap.entries());
    break;
  }

  commonAttributesMapping(avroDefinition, jsonSchema, isTopLevel);
  exampleAttributeMapping(type, avroDefinition.example, jsonSchema);

  return jsonSchema;
}

module.exports.avroToJsonSchema = async function avroToJsonSchema(avroDefinition) {
  return convertAvroToJsonSchema(avroDefinition, true);
};