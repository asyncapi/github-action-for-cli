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
// https://jira.sonarsource.com/browse/RSPEC-1764
var nodes_1 = require("../utils/nodes");
var equivalence_1 = require("../utils/equivalence");
var locations_1 = require("../utils/locations");
var EQUALITY_OPERATOR_TOKEN_KINDS = new Set(["==", "===", "!=", "!=="]);
// consider only binary expressions with these operators
var RELEVANT_OPERATOR_TOKEN_KINDS = new Set(["&&", "||", "/", "-", "<<", ">>", "<", "<=", ">", ">="]);
var message = function (operator) {
    return "Correct one of the identical sub-expressions on both sides of operator \"" + operator + "\"";
};
function hasRelevantOperator(node) {
    return (RELEVANT_OPERATOR_TOKEN_KINDS.has(node.operator) ||
        (EQUALITY_OPERATOR_TOKEN_KINDS.has(node.operator) && !hasIdentifierOperands(node)));
}
function hasIdentifierOperands(node) {
    return nodes_1.isIdentifier(node.left) && nodes_1.isIdentifier(node.right);
}
function isOneOntoOneShifting(node) {
    return node.operator === "<<" && nodes_1.isLiteral(node.left) && node.left.value === 1;
}
var rule = {
    meta: {
        schema: [
            {
                // internal parameter
                enum: ["sonar-runtime"],
            },
        ],
    },
    create: function (context) {
        return {
            LogicalExpression: function (node) {
                check(node);
            },
            BinaryExpression: function (node) {
                check(node);
            },
        };
        function check(expr) {
            if (hasRelevantOperator(expr) &&
                !isOneOntoOneShifting(expr) &&
                equivalence_1.areEquivalent(expr.left, expr.right, context.getSourceCode())) {
                var secondaryLocations = [];
                if (expr.left.loc) {
                    secondaryLocations.push(locations_1.issueLocation(expr.left.loc));
                }
                locations_1.report(context, {
                    message: message(expr.operator),
                    node: isSonarRuntime() ? expr.right : expr,
                }, secondaryLocations);
            }
        }
        function isSonarRuntime() {
            return context.options[context.options.length - 1] === "sonar-runtime";
        }
    },
};
module.exports = rule;
//# sourceMappingURL=no-identical-expressions.js.map