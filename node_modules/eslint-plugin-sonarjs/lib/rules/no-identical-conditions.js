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
// https://jira.sonarsource.com/browse/RSPEC-1862
var nodes_1 = require("../utils/nodes");
var equivalence_1 = require("../utils/equivalence");
var locations_1 = require("../utils/locations");
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
                var ifStmt = node;
                var condition = ifStmt.test;
                var statement = ifStmt.alternate;
                while (statement) {
                    if (nodes_1.isIfStatement(statement)) {
                        if (equivalence_1.areEquivalent(condition, statement.test, context.getSourceCode())) {
                            var line = ifStmt.loc && ifStmt.loc.start.line;
                            if (line && condition.loc) {
                                locations_1.report(context, {
                                    message: "This branch duplicates the one on line " + line,
                                    node: statement.test,
                                }, [locations_1.issueLocation(condition.loc, condition.loc, "Original")]);
                            }
                        }
                        statement = statement.alternate;
                    }
                    else {
                        break;
                    }
                }
            },
        };
    },
};
module.exports = rule;
//# sourceMappingURL=no-identical-conditions.js.map