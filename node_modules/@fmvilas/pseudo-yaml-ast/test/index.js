const { yamlAST, loc } = require('../src/index');
const get = require('lodash.get');
const test = require('ava');

const testCases = [{
  name: 'tree with leading whitespace',
  input: `
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
  `,
  nodesToCheck: [{
    path: [],
    expectedKeys: ['obj'],
    expectedLoc: {
      start: {line: 2, column: 4},
      end: {line: 14, column: 2}
    },
  }, {
    path: ['obj'],
    expectedKeys: ['arr', 'str', 'num'],
    expectedLoc: {
      start: {line: 2, column: 4},
      end: {line: 13, column: 12}
    },
  }, {
    path: ['obj', 'str'],
    expectedLoc: {
      start: {line: 12, column: 6},
      end: {line: 12, column: 14}
    },
  }, {
    path: ['obj', 'num'],
    expectedLoc: {
      start: {line: 13, column: 6},
      end: {line: 13, column: 12}
    },
  }, {
    path: ['obj', 'arr', 0],
    expectedKeys: ['nums', 'strs1'],
    expectedLoc: {
      start: {line: 4, column: 8},
      end: {line: 12, column: 6}
    },
  }, {
    path: ['obj', 'arr', 0, 'nums'],
    expectedLoc: {
      start: {line: 4, column: 8},
      end: {line: 8, column: 8}
    },
  }, {
    path: ['obj', 'arr', 0, 'strs1'],
    expectedLoc: {
      start: {line: 8, column: 8},
      end: {line: 12, column: 6}
    },
  }]
}, {
  name: 'tree with no leading whitespace',
  input: `obj:
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
`,
  nodesToCheck: [{
    path: [],
    expectedKeys: ['obj'],
    expectedLoc: {
      start: {line: 1, column: 0},
      end: {line: 13, column: 0}
    },
  }, {
    path: ['obj'],
    expectedKeys: ['arr', 'str', 'num'],
    expectedLoc: {
      start: {line: 1, column: 0},
      end: {line: 12, column: 8}
    },
  }, {
    path: ['obj', 'str'],
    expectedLoc: {
      start: {line: 11, column: 2},
      end: {line: 11, column: 10}
    },
  }, {
    path: ['obj', 'num'],
    expectedLoc: {
      start: {line: 12, column: 2},
      end: {line: 12, column: 8}
    },
  }, {
    path: ['obj', 'arr', 0],
    expectedKeys: ['nums', 'strs1'],
    expectedLoc: {
      start: {line: 3, column: 4},
      end: {line: 11, column: 2}
    },
  }, {
    path: ['obj', 'arr', 0, 'nums'],
    expectedLoc: {
      start: {line: 3, column: 4},
      end: {line: 7, column: 4}
    },
  }, {
    path: ['obj', 'arr', 0, 'strs1'],
    expectedLoc: {
      start: {line: 7, column: 4},
      end: {line: 11, column: 2}
    },
  }]
}];

testCases.forEach(testCase => {
  test(`works for ${testCase.name}`, t => {
    const ast = yamlAST(testCase.input);
    testCase.nodesToCheck.forEach(nodeDefinition => {
      const node = nodeDefinition.path.length ? get(ast, nodeDefinition.path) : ast;
      const pathAsStr = nodeDefinition.path.join(' → ') || 'root';

      if (nodeDefinition.expectedKeys) {
        t.deepEqual(Object.keys(node), nodeDefinition.expectedKeys, `keys for ${pathAsStr}`);
      }

      if (nodeDefinition.expectedLoc) {
        t.deepEqual(node[loc], nodeDefinition.expectedLoc, `loc for ${pathAsStr}`);
      }
    });
  });
});
