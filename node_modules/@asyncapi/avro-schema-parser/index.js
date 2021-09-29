const { avroToJsonSchema } = require('./to-json-schema.js');

module.exports.parse = async ({ message, defaultSchemaFormat }) => {
  const transformed = await avroToJsonSchema(message.payload);

  message['x-parser-original-schema-format'] = message.schemaFormat || defaultSchemaFormat;
  message['x-parser-original-payload'] = message.payload;
  message.payload = transformed;
  delete message.schemaFormat;

  // remove that function when https://github.com/asyncapi/spec/issues/622 will be introduced in AsyncAPI spec
  async function handleKafkaProtocolKey() {
    if (message.bindings && message.bindings.kafka) {
      const key = message.bindings.kafka.key;
      if (key) {
        const bindingsTransformed = await avroToJsonSchema(key);
        message['x-parser-original-bindings-kafka-key'] = key;
        message.bindings.kafka.key = bindingsTransformed;
      }
    }
  }

  await handleKafkaProtocolKey();
};

module.exports.getMimeTypes = () => {
  return [
    'application/vnd.apache.avro;version=1.9.0',
    'application/vnd.apache.avro+json;version=1.9.0',
    'application/vnd.apache.avro+yaml;version=1.9.0',
    'application/vnd.apache.avro;version=1.8.2',
    'application/vnd.apache.avro+json;version=1.8.2',
    'application/vnd.apache.avro+yaml;version=1.8.2'
  ];
};
