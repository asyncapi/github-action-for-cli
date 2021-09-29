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
// https://jira.sonarsource.com/browse/RSPEC-1488
var nodes_1 = require("../utils/nodes");
var rule = {
    meta: {
        fixable: "code",
    },
    create: function (context) {
        return {
            BlockStatement: function (node) {
                processStatements(node.body);
            },
            SwitchCase: function (node) {
                processStatements(node.consequent);
            },
        };
        function processStatements(statements) {
            if (statements.length > 1) {
                var last_1 = statements[statements.length - 1];
                var returnedIdentifier_1 = getOnlyReturnedVariable(last_1);
                var lastButOne_1 = statements[statements.length - 2];
                var declaredIdentifier_1 = getOnlyDeclaredVariable(lastButOne_1);
                if (returnedIdentifier_1 && declaredIdentifier_1) {
                    var sameVariable = getVariables(context).find(function (variable) {
                        return (variable.references.find(function (ref) { return ref.identifier === returnedIdentifier_1; }) !== undefined &&
                            variable.references.find(function (ref) { return ref.identifier === declaredIdentifier_1.id; }) !== undefined);
                    });
                    // there must be only one "read" - in `return` or `throw`
                    if (sameVariable && sameVariable.references.filter(function (ref) { return ref.isRead(); }).length === 1) {
                        context.report({
                            message: formatMessage(last_1, returnedIdentifier_1.name),
                            node: declaredIdentifier_1.init,
                            fix: function (fixer) { return fix(fixer, last_1, lastButOne_1, declaredIdentifier_1.init); },
                        });
                    }
                }
            }
        }
        function fix(fixer, last, lastButOne, expression) {
            var throwOrReturnKeyword = context.getSourceCode().getFirstToken(last);
            if (lastButOne.range && last.range && throwOrReturnKeyword) {
                var expressionText = context.getSourceCode().getText(expression);
                var fixedRangeStart = lastButOne.range[0];
                var fixedRangeEnd = last.range[1];
                var semicolonToken = context.getSourceCode().getLastToken(last);
                var semicolon = semicolonToken && semicolonToken.value === ";" ? ";" : "";
                return [
                    fixer.removeRange([fixedRangeStart, fixedRangeEnd]),
                    fixer.insertTextAfterRange([1, fixedRangeStart], throwOrReturnKeyword.value + " " + expressionText + semicolon),
                ];
            }
            else {
                return null;
            }
        }
        function getOnlyReturnedVariable(node) {
            return (nodes_1.isReturnStatement(node) || nodes_1.isThrowStatement(node)) && node.argument && nodes_1.isIdentifier(node.argument)
                ? node.argument
                : undefined;
        }
        function getOnlyDeclaredVariable(node) {
            if (nodes_1.isVariableDeclaration(node) && node.declarations.length === 1) {
                var _a = node.declarations[0], id = _a.id, init = _a.init;
                if (nodes_1.isIdentifier(id) && init) {
                    return { id: id, init: init };
                }
            }
            return undefined;
        }
        function formatMessage(node, variable) {
            var action = nodes_1.isReturnStatement(node) ? "return" : "throw";
            return "Immediately " + action + " this expression instead of assigning it to the temporary variable \"" + variable + "\".";
        }
        function getVariables(context) {
            var _a = context.getScope(), variableScope = _a.variableScope, currentScopeVariables = _a.variables;
            if (variableScope === context.getScope()) {
                return currentScopeVariables;
            }
            else {
                return currentScopeVariables.concat(variableScope.variables);
            }
        }
    },
};
module.exports = rule;
//# sourceMappingURL=prefer-immediate-return.js.map