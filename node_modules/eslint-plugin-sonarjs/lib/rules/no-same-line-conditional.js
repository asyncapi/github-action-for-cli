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
// https://jira.sonarsource.com/browse/RSPEC-3972
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
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
        function checkStatements(statements) {
            var sourceCode = context.getSourceCode();
            var siblingIfStatements = getSiblingIfStatements(statements);
            siblingIfStatements.forEach(function (siblingIfStatement) {
                var precedingIf = siblingIfStatement.first;
                var followingIf = siblingIfStatement.following;
                if (!!precedingIf.loc &&
                    !!followingIf.loc &&
                    precedingIf.loc.end.line === followingIf.loc.start.line &&
                    precedingIf.loc.start.line !== followingIf.loc.end.line) {
                    var precedingIfLastToken = sourceCode.getLastToken(precedingIf);
                    var followingIfToken = sourceCode.getFirstToken(followingIf);
                    context.report({
                        message: locations_1.toEncodedMessage("Move this \"if\" to a new line or add the missing \"else\".", [
                            precedingIfLastToken,
                        ]),
                        loc: followingIfToken.loc,
                    });
                }
            });
        }
        return {
            Program: function (node) { return checkStatements(node.body); },
            BlockStatement: function (node) { return checkStatements(node.body); },
            SwitchCase: function (node) { return checkStatements(node.consequent); },
        };
    },
};
function getSiblingIfStatements(statements) {
    return statements.reduce(function (siblingsArray, statement, currentIndex) {
        var previousStatement = statements[currentIndex - 1];
        if (statement.type === "IfStatement" && !!previousStatement && previousStatement.type === "IfStatement") {
            return __spreadArrays([{ first: previousStatement, following: statement }], siblingsArray);
        }
        return siblingsArray;
    }, []);
}
module.exports = rule;
//# sourceMappingURL=no-same-line-conditional.js.map