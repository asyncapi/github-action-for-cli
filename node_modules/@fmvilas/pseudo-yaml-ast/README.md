# @fmvilas/pseudo-yaml-ast

> This project is a fork of [pseudo-yaml-ast](https://github.com/yldio/pseudo-yaml-ast)

Parse a YAML string into an object with location properties.

## Table of Contents

* [Install](#install)
* [Usage](#usage)
* [License](#license)

## Install

```
npm install @fmvilas/pseudo-yaml-ast
```

## Usage

```js
const { yamlAST, loc } = require('pseudo-yaml-ast');
const assert = require('assert');

const ast = yamlAST(`
  obj:
    arr:
    - nums:
      - 1
      - 2
      - 3
      strs1:
      - '1'
      - '2'
      - '3'
    str: '1'
    num: 1
`);

assert.deepEqual(Object.keys(ast), ['obj']);
assert.deepEqual(ast[loc].start.line, 2);
assert.deepEqual(ast[loc].end.line, 14);

assert.deepEqual(Object.keys(ast.obj), ['arr', 'str', 'num']);
assert.deepEqual(ast.obj[loc].start.line, 2);
assert.deepEqual(ast.obj[loc].end.line, 13);

assert.deepEqual(ast.obj.str[loc].start.line, 12);
assert.deepEqual(ast.obj.str[loc].end.line, 12);
assert.deepEqual(ast.obj.num[loc].start.line, 13);
assert.deepEqual(ast.obj.num[loc].end.line, 13);
assert.deepEqual(ast.obj.arr[0][loc].start.line, 4);
assert.deepEqual(ast.obj.arr[0][loc].end.line, 12);

assert.deepEqual(Object.keys(ast.obj.arr[0]), ['nums', 'strs1']);
assert.deepEqual(ast.obj.arr[0].nums[loc].start.line, 4);
assert.deepEqual(ast.obj.arr[0].nums[loc].end.line, 8);
assert.deepEqual(ast.obj.arr[0].strs1[loc].start.line, 8);
assert.deepEqual(ast.obj.arr[0].strs1[loc].end.line, 12);
```

## License

Apache 2.0