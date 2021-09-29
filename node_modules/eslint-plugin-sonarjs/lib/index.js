"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sonarjsRules = [
    ["cognitive-complexity", "error"],
    ["max-switch-cases", "error"],
    ["no-all-duplicated-branches", "error"],
    ["no-collapsible-if", "error"],
    ["no-collection-size-mischeck", "error"],
    ["no-duplicate-string", "error"],
    ["no-duplicated-branches", "error"],
    ["no-element-overwrite", "error"],
    ["no-extra-arguments", "error"],
    ["no-identical-conditions", "error"],
    ["no-identical-functions", "error"],
    ["no-identical-expressions", "error"],
    ["no-inverted-boolean-check", "error"],
    ["no-one-iteration-loop", "error"],
    ["no-redundant-boolean", "error"],
    ["no-redundant-jump", "error"],
    ["no-same-line-conditional", "error"],
    ["no-small-switch", "error"],
    ["no-unused-collection", "error"],
    ["no-use-of-empty-return-value", "error"],
    ["no-useless-catch", "error"],
    ["prefer-immediate-return", "error"],
    ["prefer-object-literal", "error"],
    ["prefer-single-boolean-return", "error"],
    ["prefer-while", "error"],
];
var sonarjsRuleModules = {};
exports.rules = sonarjsRuleModules;
var configs = {
    recommended: { plugins: ["sonarjs"], rules: {} },
};
exports.configs = configs;
sonarjsRules.forEach(function (rule) { return (sonarjsRuleModules[rule[0]] = require("./rules/" + rule[0])); });
sonarjsRules.forEach(function (rule) { return (configs.recommended.rules["sonarjs/" + rule[0]] = rule[1]); });
//# sourceMappingURL=index.js.map