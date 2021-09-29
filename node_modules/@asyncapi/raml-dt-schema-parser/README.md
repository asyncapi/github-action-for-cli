# RAML Data Types Schema Parser

A schema parser for RAML data types.

> **ATTENTION: This package is not browser-compatible.**

## Installation

```
npm install @asyncapi/raml-dt-schema-parser
```

## Usage

```js
const parser = require('asyncapi-parser')
const ramlDtParser = require('@asyncapi/raml-dt-schema-parser')

const asyncapiWithRAML = `
asyncapi: 2.0.0
info:
  title: Example with RAML
  version: 0.1.0
channels:
  example:
    publish:
      message:
        schemaFormat: 'application/raml+yaml;version=1.0'
        payload: # The following is a RAML data type
          type: object
          properties:
            title: string
            author:
              type: string
              examples:
                anExample: Jack Johnson
`

parser.registerSchemaParser(ramlDtParser)

await parser.parse(asyncapiWithRAML)
```

It also supports referencing remote RAML data types:

```js
const parser = require('asyncapi-parser')
const ramlDtParser = require('@asyncapi/raml-dt-schema-parser')

const asyncapiWithRAML = `
asyncapi: 2.0.0
info:
  title: Example with RAML
  version: 0.1.0
channels:
  example:
    publish:
      message:
        schemaFormat: 'application/raml+yaml;version=1.0'
        payload:
          $ref: 'yourserver.com/data-types/library.raml#/Book'
`

parser.registerSchemaParser(ramlDtParser)

await parser.parse(asyncapiWithRAML)
```
