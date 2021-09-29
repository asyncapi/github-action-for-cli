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
// https://jira.sonarsource.com/browse/RSPEC-1192
var nodes_1 = require("../utils/nodes");
// Number of times a literal must be duplicated to trigger an issue
var DEFAULT_THRESHOLD = 3;
var MIN_LENGTH = 10;
var NO_SEPARATOR_REGEXP = /^\w*$/;
var EXCLUDED_CONTEXTS = ["ImportDeclaration", "JSXAttribute", "ExportAllDeclaration", "ExportNamedDeclaration"];
var MESSAGE = "Define a constant instead of duplicating this literal {{times}} times.";
var rule = {
    meta: {
        schema: [{ type: "integer", minimum: 2 }],
    },
    create: function (context) {
        var literalsByValue = new Map();
        var threshold = context.options[0] !== undefined ? context.options[0] : DEFAULT_THRESHOLD;
        return {
            Literal: function (node) {
                var literal = node;
                var parent = nodes_1.getParent(context);
                if (typeof literal.value === "string" && (parent && parent.type !== "ExpressionStatement")) {
                    var stringContent = literal.value.trim();
                    if (!isExcludedByUsageContext(context, literal) &&
                        stringContent.length >= MIN_LENGTH &&
                        !stringContent.match(NO_SEPARATOR_REGEXP)) {
                        var sameStringLiterals = literalsByValue.get(stringContent) || [];
                        sameStringLiterals.push(literal);
                        literalsByValue.set(stringContent, sameStringLiterals);
                    }
                }
            },
            "Program:exit": function () {
                literalsByValue.forEach(function (literals) {
                    if (literals.length >= threshold) {
                        context.report({
                            message: MESSAGE,
                            node: literals[0],
                            data: { times: literals.length + "" },
                        });
                    }
                });
            },
        };
    },
};
function isExcludedByUsageContext(context, literal) {
    var parent = nodes_1.getParent(context);
    var parentType = parent.type;
    return (EXCLUDED_CONTEXTS.includes(parentType) || isRequireContext(parent, context) || isObjectPropertyKey(parent, literal));
}
function isRequireContext(parent, context) {
    return parent.type === "CallExpression" && context.getSourceCode().getText(parent.callee) === "require";
}
function isObjectPropertyKey(parent, literal) {
    return parent.type === "Property" && parent.key === literal;
}
module.exports = rule;
//# sourceMappingURL=no-duplicate-string.js.map