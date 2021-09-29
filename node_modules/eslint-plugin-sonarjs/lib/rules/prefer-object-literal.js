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
// https://jira.sonarsource.com/browse/RSPEC-2428
var nodes_1 = require("../utils/nodes");
var equivalence_1 = require("../utils/equivalence");
var MESSAGE = "Declare one or more properties of this object inside of the object literal syntax instead of using separate statements.";
var rule = {
    create: function (context) {
        return {
            BlockStatement: function (node) { return checkObjectInitialization(node.body, context); },
            Program: function (node) {
                var statements = node.body.filter(function (statement) { return !nodes_1.isModuleDeclaration(statement); });
                checkObjectInitialization(statements, context);
            },
        };
    },
};
function checkObjectInitialization(statements, context) {
    var index = 0;
    while (index < statements.length - 1) {
        var objectDeclaration = getObjectDeclaration(statements[index]);
        if (objectDeclaration && nodes_1.isIdentifier(objectDeclaration.id)) {
            if (isPropertyAssignement(statements[index + 1], objectDeclaration.id, context.getSourceCode())) {
                context.report({ message: MESSAGE, node: objectDeclaration });
            }
        }
        index++;
    }
}
function getObjectDeclaration(statement) {
    if (nodes_1.isVariableDeclaration(statement)) {
        return statement.declarations.find(function (declaration) { return !!declaration.init && isEmptyObjectExpression(declaration.init); });
    }
    return undefined;
}
function isEmptyObjectExpression(expression) {
    return nodes_1.isObjectExpression(expression) && expression.properties.length === 0;
}
function isPropertyAssignement(statement, objectIdentifier, sourceCode) {
    if (nodes_1.isExpressionStatement(statement) && nodes_1.isAssignmentExpression(statement.expression)) {
        var _a = statement.expression, left = _a.left, right = _a.right;
        if (nodes_1.isMemberExpression(left)) {
            return (!left.computed &&
                isSingleLineExpression(right, sourceCode) &&
                equivalence_1.areEquivalent(left.object, objectIdentifier, sourceCode));
        }
    }
    return false;
}
function isSingleLineExpression(expression, sourceCode) {
    var first = sourceCode.getFirstToken(expression).loc;
    var last = sourceCode.getLastToken(expression).loc;
    return first.start.line === last.end.line;
}
module.exports = rule;
//# sourceMappingURL=prefer-object-literal.js.map