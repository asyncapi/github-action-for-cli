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
// https://jira.sonarsource.com/browse/RSPEC-3626
var nodes_1 = require("../utils/nodes");
var message = "Remove this redundant jump.";
var loops = "WhileStatement, ForStatement, DoWhileStatement, ForInStatement, ForOfStatement";
var rule = {
    create: function (context) {
        var _a;
        function reportIfLastStatement(node) {
            var withArgument = node.type === "ContinueStatement" ? !!node.label : !!node.argument;
            if (!withArgument) {
                var block = nodes_1.getParent(context);
                if (block.body[block.body.length - 1] === node && block.body.length > 1) {
                    context.report({
                        message: message,
                        node: node,
                    });
                }
            }
        }
        function reportIfLastStatementInsideIf(node) {
            var ancestors = context.getAncestors();
            var ifStatement = ancestors[ancestors.length - 2];
            var upperBlock = ancestors[ancestors.length - 3];
            if (upperBlock.body[upperBlock.body.length - 1] === ifStatement) {
                reportIfLastStatement(node);
            }
        }
        return _a = {},
            _a[":matches(" + loops + ") > BlockStatement > ContinueStatement"] = function (node) {
                reportIfLastStatement(node);
            },
            _a[":matches(" + loops + ") > BlockStatement > IfStatement > BlockStatement > ContinueStatement"] = function (node) {
                reportIfLastStatementInsideIf(node);
            },
            _a[":function > BlockStatement > ReturnStatement"] = function (node) {
                reportIfLastStatement(node);
            },
            _a[":function > BlockStatement > IfStatement > BlockStatement > ReturnStatement"] = function (node) {
                reportIfLastStatementInsideIf(node);
            },
            _a;
    },
};
module.exports = rule;
//# sourceMappingURL=no-redundant-jump.js.map