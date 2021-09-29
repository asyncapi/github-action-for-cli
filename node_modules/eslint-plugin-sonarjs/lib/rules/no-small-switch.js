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
// https://jira.sonarsource.com/browse/RSPEC-1301
var MESSAGE = '"switch" statements should have at least 3 "case" clauses';
var rule = {
    create: function (context) {
        return {
            SwitchStatement: function (node) {
                var switchStatement = node;
                var cases = switchStatement.cases;
                var hasDefault = cases.some(function (x) { return !x.test; });
                if (cases.length < 2 || (cases.length === 2 && hasDefault)) {
                    var firstToken = context.getSourceCode().getFirstToken(node);
                    if (firstToken) {
                        context.report({ message: MESSAGE, loc: firstToken.loc });
                    }
                }
            },
        };
    },
};
module.exports = rule;
//# sourceMappingURL=no-small-switch.js.map