# OpenAPI Schema Parser

An AsyncAPI schema parser for OpenAPI 3.0.x and Swagger 2.x schemas.

## Installation

```
npm install @asyncapi/openapi-schema-parser
```

## Usage

```js
const parser = require('asyncapi-parser')
const openapiSchemaParser = require('@asyncapi/openapi-schema-parser')

const asyncapiWithOpenAPI = `
asyncapi: 2.0.0
info:
  title: Example with OpenAPI
  version: 0.1.0
channels:
  example:
    publish:
      message:
        schemaFormat: 'application/vnd.oai.openapi;version=3.0.0'
        payload: # The following is an OpenAPI schema
          type: object
          properties:
            title:
              type: string
              nullable: true
            author:
              type: string
              example: Jack Johnson
`

parser.registerSchemaParser(openapiSchemaParser);

await parser.parse(asyncapiWithOpenAPI)
```

It also supports referencing remote OpenAPI schemas:

```js
const parser = require('asyncapi-parser')
const openapiSchemaParser = require('@asyncapi/openapi-schema-parser')

const asyncapiWithOpenAPI = `
asyncapi: 2.0.0
info:
  title: Example with OpenAPI
  version: 0.1.0
channels:
  example:
    publish:
      message:
        schemaFormat: 'application/vnd.oai.openapi;version=3.0.0'
        payload:
          $ref: 'yourserver.com/schemas#/Book'
`

parser.registerSchemaParser(openapiSchemaParser)

await parser.parse(asyncapiWithOpenAPI)
```
