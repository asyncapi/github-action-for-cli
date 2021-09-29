"use strict";
/*
 * eslint-plugin-sonarjs
 * Copyright (C) 2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
// https://jira.sonarsource.com/browse/RSPEC-1940
var nodes_1 = require("../utils/nodes");
var MESSAGE = "Use the opposite operator ({{invertedOperator}}) instead.";
var invertedOperators = {
    "==": "!=",
    "!=": "==",
    "===": "!==",
    "!==": "===",
    ">": "<=",
    "<": ">=",
    ">=": "<",
    "<=": ">",
};
var rule = {
    create: function (context) {
        return { UnaryExpression: function (node) { return visitUnaryExpression(node, context); } };
    },
};
function visitUnaryExpression(unaryExpression, context) {
    if (unaryExpression.operator === "!" && nodes_1.isBinaryExpression(unaryExpression.argument)) {
        var condition = unaryExpression.argument;
        var invertedOperator_1 = invertedOperators[condition.operator];
        if (invertedOperator_1) {
            var left_1 = context.getSourceCode().getText(condition.left);
            var right_1 = context.getSourceCode().getText(condition.right);
            context.report({
                message: MESSAGE,
                data: { invertedOperator: invertedOperator_1 },
                node: unaryExpression,
                fix: function (fixer) { return fixer.replaceText(unaryExpression, left_1 + " " + invertedOperator_1 + " " + right_1); },
            });
        }
    }
}
module.exports = rule;
//# sourceMappingURL=no-inverted-boolean-check.js.map