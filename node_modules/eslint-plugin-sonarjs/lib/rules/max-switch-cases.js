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
// https://jira.sonarsource.com/browse/RSPEC-1479
var MESSAGE = "Reduce the number of non-empty switch cases from {{numSwitchCases}} to at most {{maxSwitchCases}}.";
var DEFAULT_MAX_SWITCH_CASES = 30;
var maxSwitchCases = DEFAULT_MAX_SWITCH_CASES;
var rule = {
    meta: {
        schema: [
            {
                type: "integer",
                minimum: 0,
            },
        ],
    },
    create: function (context) {
        if (context.options.length > 0) {
            maxSwitchCases = context.options[0];
        }
        return { SwitchStatement: function (node) { return visitSwitchStatement(node, context); } };
    },
};
function visitSwitchStatement(switchStatement, context) {
    var nonEmptyCases = switchStatement.cases.filter(function (switchCase) { return switchCase.consequent.length > 0 && !isDefaultCase(switchCase); });
    if (nonEmptyCases.length > maxSwitchCases) {
        var switchKeyword = context.getSourceCode().getFirstToken(switchStatement);
        context.report({
            message: MESSAGE,
            loc: switchKeyword.loc,
            data: { numSwitchCases: nonEmptyCases.length + "", maxSwitchCases: maxSwitchCases + "" },
        });
    }
}
function isDefaultCase(switchCase) {
    return switchCase.test === null;
}
module.exports = rule;
//# sourceMappingURL=max-switch-cases.js.map