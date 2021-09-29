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
// https://jira.sonarsource.com/browse/RSPEC-4144
var equivalence_1 = require("../utils/equivalence");
var locations_1 = require("../utils/locations");
var nodes_1 = require("../utils/nodes");
var message = function (line) {
    return "Update this function so that its implementation is not identical to the one on line " + line + ".";
};
var rule = {
    meta: {
        schema: [
            {
                enum: ["sonar-runtime"],
            },
        ],
    },
    create: function (context) {
        var functions = [];
        return {
            FunctionDeclaration: function (node) {
                visitFunction(node);
            },
            FunctionExpression: function (node) {
                visitFunction(node);
            },
            ArrowFunctionExpression: function (node) {
                visitFunction(node);
            },
            "Program:exit": function () {
                processFunctions();
            },
        };
        function visitFunction(node) {
            if (isBigEnough(node.body)) {
                functions.push({ function: node, parent: nodes_1.getParent(context) });
            }
        }
        function processFunctions() {
            if (functions.length < 2)
                return;
            for (var i = 1; i < functions.length; i++) {
                var duplicatingFunction = functions[i].function;
                for (var j = 0; j < i; j++) {
                    var originalFunction = functions[j].function;
                    if (equivalence_1.areEquivalent(duplicatingFunction.body, originalFunction.body, context.getSourceCode()) &&
                        originalFunction.loc) {
                        var loc = locations_1.getMainFunctionTokenLocation(duplicatingFunction, functions[i].parent, context);
                        var originalFunctionLoc = locations_1.getMainFunctionTokenLocation(originalFunction, functions[j].parent, context);
                        var secondaryLocations = [
                            locations_1.issueLocation(originalFunctionLoc, originalFunctionLoc, "Original implementation"),
                        ];
                        locations_1.report(context, {
                            message: message(String(originalFunction.loc.start.line)),
                            loc: loc,
                        }, secondaryLocations);
                        break;
                    }
                }
            }
        }
        function isBigEnough(node) {
            var tokens = context.getSourceCode().getTokens(node);
            if (tokens.length > 0 && tokens[0].value === "{") {
                tokens.shift();
            }
            if (tokens.length > 0 && tokens[tokens.length - 1].value === "}") {
                tokens.pop();
            }
            if (tokens.length > 0) {
                var firstLine = tokens[0].loc.start.line;
                var lastLine = tokens[tokens.length - 1].loc.end.line;
                return lastLine - firstLine > 1;
            }
            return false;
        }
    },
};
module.exports = rule;
//# sourceMappingURL=no-identical-functions.js.map