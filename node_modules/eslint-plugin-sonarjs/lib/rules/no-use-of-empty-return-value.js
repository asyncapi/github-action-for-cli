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
// https://jira.sonarsource.com/browse/RSPEC-3699
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var nodes_1 = require("../utils/nodes");
function isReturnValueUsed(callExpr, context) {
    var parent = nodes_1.getParent(context);
    if (!parent) {
        return false;
    }
    if (parent.type === "LogicalExpression") {
        return parent.left === callExpr;
    }
    if (parent.type === "SequenceExpression") {
        return parent.expressions[parent.expressions.length - 1] === callExpr;
    }
    if (parent.type === "ConditionalExpression") {
        return parent.test === callExpr;
    }
    return (parent.type !== "ExpressionStatement" &&
        parent.type !== "ArrowFunctionExpression" &&
        parent.type !== "UnaryExpression" &&
        parent.type !== "AwaitExpression" &&
        parent.type !== "ReturnStatement" &&
        parent.type !== "ThrowStatement");
}
var rule = {
    create: function (context) {
        var callExpressionsToCheck = new Map();
        var functionsWithReturnValue = new Set();
        return {
            CallExpression: function (node) {
                var callExpr = node;
                if (!isReturnValueUsed(callExpr, context)) {
                    return;
                }
                var scope = context.getScope();
                var reference = scope.references.find(function (ref) { return ref.identifier === callExpr.callee; });
                if (reference && reference.resolved) {
                    var variable = reference.resolved;
                    if (variable.defs.length === 1) {
                        var definition = variable.defs[0];
                        if (definition.type === "FunctionName") {
                            callExpressionsToCheck.set(reference.identifier, definition.node);
                        }
                        else if (definition.type === "Variable") {
                            var init = definition.node.init;
                            if (init && (nodes_1.isFunctionExpression(init) || nodes_1.isArrowFunctionExpression(init))) {
                                callExpressionsToCheck.set(reference.identifier, init);
                            }
                        }
                    }
                }
            },
            ReturnStatement: function (node) {
                var returnStmt = node;
                if (returnStmt.argument) {
                    var ancestors = __spreadArrays(context.getAncestors()).reverse();
                    var functionNode = ancestors.find(function (node) {
                        return node.type === "FunctionExpression" ||
                            node.type === "FunctionDeclaration" ||
                            node.type === "ArrowFunctionExpression";
                    });
                    functionsWithReturnValue.add(functionNode);
                }
            },
            ArrowFunctionExpression: function (node) {
                var arrowFunc = node;
                if (arrowFunc.expression) {
                    functionsWithReturnValue.add(arrowFunc);
                }
            },
            ":function": function (node) {
                var func = node;
                if (func.async || func.generator || (nodes_1.isBlockStatement(func.body) && func.body.body.length === 0)) {
                    functionsWithReturnValue.add(func);
                }
            },
            "Program:exit": function () {
                callExpressionsToCheck.forEach(function (functionDeclaration, callee) {
                    if (!functionsWithReturnValue.has(functionDeclaration)) {
                        context.report({
                            message: "Remove this use of the output from \"{{name}}\"; \"{{name}}\" doesn't return anything.",
                            node: callee,
                            data: { name: callee.name },
                        });
                    }
                });
            },
        };
    },
};
module.exports = rule;
//# sourceMappingURL=no-use-of-empty-return-value.js.map