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
// https://jira.sonarsource.com/browse/RSPEC-930
var nodes_1 = require("../utils/nodes");
var locations_1 = require("../utils/locations");
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
        var callExpressionsToCheck = [];
        var usingArguments = new Set();
        var emptyFunctions = new Set();
        return {
            CallExpression: function (node) {
                var callExpr = node;
                if (nodes_1.isIdentifier(callExpr.callee)) {
                    var reference = context.getScope().references.find(function (ref) { return ref.identifier === callExpr.callee; });
                    var definition = reference && getSingleDefinition(reference);
                    if (definition) {
                        if (definition.type === "FunctionName") {
                            checkFunction(callExpr, definition.node);
                        }
                        else if (definition.type === "Variable") {
                            var init = definition.node.init;
                            if (init && (nodes_1.isFunctionExpression(init) || nodes_1.isArrowFunctionExpression(init))) {
                                checkFunction(callExpr, init);
                            }
                        }
                    }
                }
                else if (nodes_1.isArrowFunctionExpression(callExpr.callee) || nodes_1.isFunctionExpression(callExpr.callee)) {
                    // IIFE
                    checkFunction(callExpr, callExpr.callee);
                }
            },
            ":function": function (node) {
                var fn = node;
                if (nodes_1.isBlockStatement(fn.body) && fn.body.body.length === 0 && fn.params.length === 0) {
                    emptyFunctions.add(node);
                }
            },
            "FunctionDeclaration > BlockStatement Identifier": function (node) {
                checkArguments(node);
            },
            "FunctionExpression > BlockStatement Identifier": function (node) {
                checkArguments(node);
            },
            "Program:exit": function () {
                callExpressionsToCheck.forEach(function (_a) {
                    var callExpr = _a.callExpr, functionNode = _a.functionNode;
                    if (!usingArguments.has(functionNode) && !emptyFunctions.has(functionNode)) {
                        reportIssue(callExpr, functionNode);
                    }
                });
            },
        };
        function getSingleDefinition(reference) {
            if (reference && reference.resolved) {
                var variable = reference.resolved;
                if (variable.defs.length === 1) {
                    return variable.defs[0];
                }
            }
            return undefined;
        }
        function checkArguments(identifier) {
            if (identifier.name === "arguments") {
                var reference = context.getScope().references.find(function (ref) { return ref.identifier === identifier; });
                var definition = reference && getSingleDefinition(reference);
                // special `arguments` variable has no definition
                if (!definition) {
                    var ancestors = context.getAncestors().reverse();
                    var fn = ancestors.find(function (node) { return nodes_1.isFunctionDeclaration(node) || nodes_1.isFunctionExpression(node); });
                    if (fn) {
                        usingArguments.add(fn);
                    }
                }
            }
        }
        function checkFunction(callExpr, functionNode) {
            var hasRest = functionNode.params.some(function (param) { return param.type === "RestElement"; });
            if (!hasRest) {
                if (callExpr.arguments.length > functionNode.params.length) {
                    callExpressionsToCheck.push({ callExpr: callExpr, functionNode: functionNode });
                }
            }
        }
        function reportIssue(callExpr, functionNode) {
            var paramLength = functionNode.params.length;
            var argsLength = callExpr.arguments.length;
            // prettier-ignore
            var expectedArguments = paramLength === 0 ? "no arguments" :
                paramLength === 1 ? "1 argument" :
                    paramLength + " arguments";
            // prettier-ignore
            var providedArguments = argsLength === 0 ? "none was" :
                argsLength === 1 ? "1 was" :
                    argsLength + " were";
            var message = "This function expects " + expectedArguments + ", but " + providedArguments + " provided.";
            locations_1.report(context, {
                message: message,
                node: callExpr,
            }, getSecondaryLocations(functionNode));
        }
        function getSecondaryLocations(functionNode) {
            var paramLength = functionNode.params.length;
            var secondaryLocations = [];
            if (paramLength > 0) {
                var startLoc = functionNode.params[0].loc;
                var endLoc = functionNode.params[paramLength - 1].loc;
                // defensive check as `loc` property may be undefined according to
                // its type declaration
                if (startLoc && endLoc) {
                    secondaryLocations.push(locations_1.issueLocation(startLoc, endLoc, "Formal parameters"));
                }
            }
            else {
                // as we're not providing parent node, `getMainFunctionTokenLocation` may return `undefined`
                var fnToken = locations_1.getMainFunctionTokenLocation(functionNode, undefined, context);
                if (fnToken) {
                    secondaryLocations.push(locations_1.issueLocation(fnToken, fnToken, "Formal parameters"));
                }
            }
            return secondaryLocations;
        }
    },
};
module.exports = rule;
//# sourceMappingURL=no-extra-arguments.js.map