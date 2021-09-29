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
// https://jira.sonarsource.com/browse/RSPEC-4030
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var collections_1 = require("../utils/collections");
var message = "Either use this collection's contents or remove the collection.";
var rule = {
    create: function (context) {
        return {
            "Program:exit": function () {
                var unusedArrays = [];
                collectUnusedCollections(context.getScope(), unusedArrays);
                unusedArrays.forEach(function (unusedArray) {
                    context.report({
                        message: message,
                        node: unusedArray.identifiers[0],
                    });
                });
            },
        };
    },
};
function collectUnusedCollections(scope, unusedArray) {
    if (scope.type !== "global") {
        scope.variables.filter(isUnusedCollection).forEach(function (v) {
            unusedArray.push(v);
        });
    }
    scope.childScopes.forEach(function (childScope) {
        collectUnusedCollections(childScope, unusedArray);
    });
}
function isUnusedCollection(variable) {
    if (variable.references.length <= 1) {
        return false;
    }
    var assignCollection = false;
    for (var _i = 0, _a = variable.references; _i < _a.length; _i++) {
        var ref = _a[_i];
        if (ref.isWriteOnly()) {
            if (isReferenceAssigningCollection(ref)) {
                assignCollection = true;
            }
            else {
                //One assignment is not a collection, we don't go further
                return false;
            }
        }
        else if (isRead(ref)) {
            //Unfortunately, isRead (!isWrite) from Scope.Reference consider A[1] = 1; and A.xxx(); as a read operation, we need to filter further
            return false;
        }
    }
    return assignCollection;
}
function isReferenceAssigningCollection(ref) {
    var declOrExprStmt = findFirstMatchingAncestor(ref.identifier, function (n) { return n.type === "VariableDeclarator" || n.type === "ExpressionStatement"; });
    if (declOrExprStmt) {
        if (declOrExprStmt.type === "VariableDeclarator" && declOrExprStmt.init) {
            return isCollectionType(declOrExprStmt.init);
        }
        if (declOrExprStmt.type === "ExpressionStatement") {
            var expression = declOrExprStmt.expression;
            return (expression.type === "AssignmentExpression" &&
                isReferenceTo(ref, expression.left) &&
                isCollectionType(expression.right));
        }
    }
    return false;
}
function isCollectionType(node) {
    if (node && node.type === "ArrayExpression") {
        return true;
    }
    else if (node && (node.type === "CallExpression" || node.type === "NewExpression")) {
        return isIdentifier.apply(void 0, __spreadArrays([node.callee], collections_1.collectionConstructor));
    }
    return false;
}
function isRead(ref) {
    var expressionStatement = findFirstMatchingAncestor(ref.identifier, function (n) { return n.type === "ExpressionStatement"; });
    if (expressionStatement) {
        return !(isElementWrite(expressionStatement, ref) || isWritingMethodCall(expressionStatement, ref));
    }
    //All the write statement that we search are part of ExpressionStatement, if there is none, it's a read
    return true;
}
/**
 * Detect expression statements like the following:
 * myArray.push(1);
 */
function isWritingMethodCall(statement, ref) {
    if (statement.expression.type === "CallExpression") {
        var callee = statement.expression.callee;
        if (isMemberExpression(callee)) {
            var property = callee.property;
            return isReferenceTo(ref, callee.object) && isIdentifier.apply(void 0, __spreadArrays([property], collections_1.writingMethods));
        }
    }
    return false;
}
function isMemberExpression(node) {
    return node.type === "MemberExpression";
}
/**
 * Detect expression statements like the following:
 *  myArray[1] = 42;
 *  myArray[1] += 42;
 *  myObj.prop1 = 3;
 *  myObj.prop1 += 3;
 */
function isElementWrite(statement, ref) {
    if (statement.expression.type === "AssignmentExpression") {
        var assignmentExpression = statement.expression;
        var lhs = assignmentExpression.left;
        return isMemberExpressionReference(lhs, ref);
    }
    return false;
}
function isMemberExpressionReference(lhs, ref) {
    return (lhs.type === "MemberExpression" && (isReferenceTo(ref, lhs.object) || isMemberExpressionReference(lhs.object, ref)));
}
function isIdentifier(node) {
    var values = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        values[_i - 1] = arguments[_i];
    }
    return node.type === "Identifier" && values.some(function (value) { return value === node.name; });
}
function isReferenceTo(ref, node) {
    return node.type === "Identifier" && node === ref.identifier;
}
function findFirstMatchingAncestor(node, predicate) {
    return ancestorsChain(node, new Set()).find(predicate);
}
function ancestorsChain(node, boundaryTypes) {
    var chain = [];
    var currentNode = node.parent;
    while (currentNode) {
        chain.push(currentNode);
        if (boundaryTypes.has(currentNode.type)) {
            break;
        }
        currentNode = currentNode.parent;
    }
    return chain;
}
module.exports = rule;
//# sourceMappingURL=no-unused-collection.js.map