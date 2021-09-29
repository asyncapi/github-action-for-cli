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
// https://jira.sonarsource.com/browse/RSPEC-1940
var nodes_1 = require("../utils/nodes");
var equivalence_1 = require("../utils/equivalence");
var MESSAGE = "Add logic to this catch clause or eliminate it and rethrow the exception automatically.";
var rule = {
    create: function (context) {
        return { CatchClause: function (node) { return visitCatchClause(node, context); } };
    },
};
function visitCatchClause(catchClause, context) {
    var statements = catchClause.body.body;
    if (catchClause.param &&
        statements.length === 1 &&
        onlyRethrows(statements[0], catchClause.param, context.getSourceCode())) {
        var catchKeyword = context.getSourceCode().getFirstToken(catchClause);
        context.report({
            message: MESSAGE,
            loc: catchKeyword.loc,
        });
    }
}
function onlyRethrows(statement, catchParam, sourceCode) {
    return nodes_1.isThrowStatement(statement) && equivalence_1.areEquivalent(catchParam, statement.argument, sourceCode);
}
module.exports = rule;
//# sourceMappingURL=no-useless-catch.js.map