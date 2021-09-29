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
// https://jira.sonarsource.com/browse/RSPEC-1871
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var nodes_1 = require("../utils/nodes");
var equivalence_1 = require("../utils/equivalence");
var conditions_1 = require("../utils/conditions");
var locations_1 = require("../utils/locations");
var MESSAGE = "This {{type}}'s code block is the same as the block for the {{type}} on line {{line}}.";
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
            IfStatement: function (node) {
                visitIfStatement(node);
            },
            SwitchStatement: function (node) {
                visitSwitchStatement(node);
            },
        };
        function visitIfStatement(ifStmt) {
            var parent = nodes_1.getParent(context);
            if (!nodes_1.isIfStatement(parent)) {
                var _a = conditions_1.collectIfBranches(ifStmt), branches_1 = _a.branches, endsWithElse = _a.endsWithElse;
                if (allEquivalentWithoutDefault(branches_1, endsWithElse)) {
                    branches_1.slice(1).forEach(function (branch, i) { return reportIssue(branch, branches_1[i], "branch"); });
                    return;
                }
                for (var i = 1; i < branches_1.length; i++) {
                    if (hasRequiredSize([branches_1[i]])) {
                        for (var j = 0; j < i; j++) {
                            if (compareIfBranches(branches_1[i], branches_1[j])) {
                                break;
                            }
                        }
                    }
                }
            }
        }
        function visitSwitchStatement(switchStmt) {
            var cases = switchStmt.cases;
            var endsWithDefault = conditions_1.collectSwitchBranches(switchStmt).endsWithDefault;
            var nonEmptyCases = cases.filter(function (c) { return conditions_1.takeWithoutBreak(expandSingleBlockStatement(c.consequent)).length > 0; });
            var casesWithoutBreak = nonEmptyCases.map(function (c) { return conditions_1.takeWithoutBreak(expandSingleBlockStatement(c.consequent)); });
            if (allEquivalentWithoutDefault(casesWithoutBreak, endsWithDefault)) {
                nonEmptyCases.slice(1).forEach(function (caseStmt, i) { return reportIssue(caseStmt, nonEmptyCases[i], "case"); });
                return;
            }
            for (var i = 1; i < cases.length; i++) {
                var firstClauseWithoutBreak = conditions_1.takeWithoutBreak(expandSingleBlockStatement(cases[i].consequent));
                if (hasRequiredSize(firstClauseWithoutBreak)) {
                    for (var j = 0; j < i; j++) {
                        var secondClauseWithoutBreak = conditions_1.takeWithoutBreak(expandSingleBlockStatement(cases[j].consequent));
                        if (equivalence_1.areEquivalent(firstClauseWithoutBreak, secondClauseWithoutBreak, context.getSourceCode())) {
                            reportIssue(cases[i], cases[j], "case");
                            break;
                        }
                    }
                }
            }
        }
        function hasRequiredSize(nodes) {
            if (nodes.length > 0) {
                var tokens = __spreadArrays(context.getSourceCode().getTokens(nodes[0]), context.getSourceCode().getTokens(nodes[nodes.length - 1])).filter(function (token) { return token.value !== "{" && token.value !== "}"; });
                return tokens.length > 0 && tokens[tokens.length - 1].loc.end.line > tokens[0].loc.start.line;
            }
            return false;
        }
        function compareIfBranches(a, b) {
            var equivalent = equivalence_1.areEquivalent(a, b, context.getSourceCode());
            if (equivalent && b.loc) {
                reportIssue(a, b, "branch");
            }
            return equivalent;
        }
        function expandSingleBlockStatement(nodes) {
            if (nodes.length === 1) {
                var node = nodes[0];
                if (nodes_1.isBlockStatement(node)) {
                    return node.body;
                }
            }
            return nodes;
        }
        function allEquivalentWithoutDefault(branches, endsWithDefault) {
            return (!endsWithDefault &&
                branches.length > 1 &&
                branches.slice(1).every(function (branch, index) { return equivalence_1.areEquivalent(branch, branches[index], context.getSourceCode()); }));
        }
        function reportIssue(node, equivalentNode, type) {
            var equivalentNodeLoc = equivalentNode.loc;
            locations_1.report(context, { message: MESSAGE, data: { type: type, line: String(equivalentNode.loc.start.line) }, node: node }, [
                locations_1.issueLocation(equivalentNodeLoc, equivalentNodeLoc, "Original"),
            ]);
        }
    },
};
module.exports = rule;
//# sourceMappingURL=no-duplicated-branches.js.map