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
// https://jira.sonarsource.com/browse/RSPEC-4143
var equivalence_1 = require("../utils/equivalence");
var nodes_1 = require("../utils/nodes");
var locations_1 = require("../utils/locations");
var message = function (index, line) {
    return "Verify this is the index that was intended; \"" + index + "\" was already set on line " + line + ".";
};
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
            SwitchCase: function (node) {
                var switchCase = node;
                checkStatements(switchCase.consequent);
            },
            BlockStatement: function (node) {
                var block = node;
                checkStatements(block.body);
            },
            Program: function (node) {
                var program = node;
                checkStatements(program.body);
            },
        };
        function checkStatements(statements) {
            var usedKeys = new Map();
            var collection;
            statements.forEach(function (statement) {
                var keyWriteUsage = getKeyWriteUsage(statement);
                if (keyWriteUsage) {
                    if (collection && !equivalence_1.areEquivalent(keyWriteUsage.collectionNode, collection, context.getSourceCode())) {
                        usedKeys.clear();
                    }
                    var sameKeyWriteUsage = usedKeys.get(keyWriteUsage.indexOrKey);
                    if (sameKeyWriteUsage && sameKeyWriteUsage.node.loc) {
                        var sameKeyWriteUsageLoc = sameKeyWriteUsage.node.loc;
                        var secondaryLocations = [locations_1.issueLocation(sameKeyWriteUsageLoc, sameKeyWriteUsageLoc, "Original value")];
                        locations_1.report(context, {
                            node: keyWriteUsage.node,
                            message: message(keyWriteUsage.indexOrKey, String(sameKeyWriteUsage.node.loc.start.line)),
                        }, secondaryLocations);
                    }
                    usedKeys.set(keyWriteUsage.indexOrKey, keyWriteUsage);
                    collection = keyWriteUsage.collectionNode;
                }
                else {
                    usedKeys.clear();
                }
            });
        }
        function getKeyWriteUsage(node) {
            if (nodes_1.isExpressionStatement(node)) {
                return arrayKeyWriteUsage(node.expression) || mapOrSetKeyWriteUsage(node.expression);
            }
            return undefined;
        }
        function arrayKeyWriteUsage(node) {
            // a[b] = ...
            if (isSimpleAssignment(node) && nodes_1.isMemberExpression(node.left) && node.left.computed) {
                var left = node.left, right = node.right;
                var index = extractIndex(left.property);
                if (index !== undefined && !isUsed(left.object, right)) {
                    return {
                        collectionNode: left.object,
                        indexOrKey: index,
                        node: node,
                    };
                }
            }
            return undefined;
        }
        function mapOrSetKeyWriteUsage(node) {
            if (nodes_1.isCallExpression(node) && nodes_1.isMemberExpression(node.callee)) {
                var propertyAccess = node.callee;
                if (nodes_1.isIdentifier(propertyAccess.property)) {
                    var methodName = propertyAccess.property.name;
                    var addMethod = methodName === "add" && node.arguments.length === 1;
                    var setMethod = methodName === "set" && node.arguments.length === 2;
                    if (addMethod || setMethod) {
                        var key = extractIndex(node.arguments[0]);
                        if (key) {
                            return {
                                collectionNode: propertyAccess.object,
                                indexOrKey: key,
                                node: node,
                            };
                        }
                    }
                }
            }
            return undefined;
        }
        function extractIndex(node) {
            if (nodes_1.isLiteral(node)) {
                var value = node.value;
                return typeof value === "number" || typeof value === "string" ? String(value) : undefined;
            }
            else if (nodes_1.isIdentifier(node)) {
                return node.name;
            }
            return undefined;
        }
        function isUsed(value, expression) {
            var valueTokens = context.getSourceCode().getTokens(value);
            var expressionTokens = context.getSourceCode().getTokens(expression);
            var foundUsage = expressionTokens.find(function (token, index) {
                if (eq(token, valueTokens[0])) {
                    for (var expressionIndex = index, valueIndex = 0; expressionIndex < expressionTokens.length && valueIndex < valueTokens.length; expressionIndex++, valueIndex++) {
                        if (!eq(expressionTokens[expressionIndex], valueTokens[valueIndex])) {
                            break;
                        }
                        else if (valueIndex === valueTokens.length - 1) {
                            return true;
                        }
                    }
                }
                return false;
            });
            return foundUsage !== undefined;
        }
    },
};
function eq(token1, token2) {
    return token1.value === token2.value;
}
function isSimpleAssignment(node) {
    return nodes_1.isAssignmentExpression(node) && node.operator === "=";
}
module.exports = rule;
//# sourceMappingURL=no-element-overwrite.js.map