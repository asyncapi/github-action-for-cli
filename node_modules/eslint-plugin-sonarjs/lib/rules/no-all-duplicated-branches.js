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
// https://jira.sonarsource.com/browse/RSPEC-3923
var nodes_1 = require("../utils/nodes");
var equivalence_1 = require("../utils/equivalence");
var conditions_1 = require("../utils/conditions");
var MESSAGE = "Remove this conditional structure or edit its code blocks so that they're not all the same.";
var MESSAGE_CONDITIONAL_EXPRESSION = 'This conditional operation returns the same value whether the condition is "true" or "false".';
var rule = {
    create: function (context) {
        return {
            IfStatement: function (node) {
                var ifStmt = node;
                // don't visit `else if` statements
                var parent = nodes_1.getParent(context);
                if (!nodes_1.isIfStatement(parent)) {
                    var _a = conditions_1.collectIfBranches(ifStmt), branches = _a.branches, endsWithElse = _a.endsWithElse;
                    if (endsWithElse && allDuplicated(branches)) {
                        context.report({ message: MESSAGE, node: ifStmt });
                    }
                }
            },
            SwitchStatement: function (node) {
                var switchStmt = node;
                var _a = conditions_1.collectSwitchBranches(switchStmt), branches = _a.branches, endsWithDefault = _a.endsWithDefault;
                if (endsWithDefault && allDuplicated(branches)) {
                    context.report({ message: MESSAGE, node: switchStmt });
                }
            },
            ConditionalExpression: function (node) {
                var conditional = node;
                var branches = [conditional.consequent, conditional.alternate];
                if (allDuplicated(branches)) {
                    context.report({ message: MESSAGE_CONDITIONAL_EXPRESSION, node: conditional });
                }
            },
        };
        function allDuplicated(branches) {
            return (branches.length > 1 &&
                branches.slice(1).every(function (branch, index) {
                    return equivalence_1.areEquivalent(branch, branches[index], context.getSourceCode());
                }));
        }
    },
};
module.exports = rule;
//# sourceMappingURL=no-all-duplicated-branches.js.map