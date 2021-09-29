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
// https://jira.sonarsource.com/browse/RSPEC-3981
var parser_services_1 = require("../utils/parser-services");
var CollectionLike = ["Array", "Map", "Set", "WeakMap", "WeakSet"];
var CollectionSizeLike = ["length", "size"];
var rule = {
    create: function (context) {
        var services = context.parserServices;
        var isTypeCheckerAvailable = parser_services_1.isRequiredParserServices(services);
        return {
            BinaryExpression: function (node) {
                var expr = node;
                if (["<", ">="].includes(expr.operator)) {
                    var lhs = expr.left;
                    var rhs = expr.right;
                    if (isZeroLiteral(rhs) && lhs.type === "MemberExpression") {
                        var object = lhs.object, property = lhs.property;
                        if (property.type === "Identifier" &&
                            CollectionSizeLike.includes(property.name) &&
                            (!isTypeCheckerAvailable || isCollection(object, services))) {
                            context.report({
                                message: "Fix this expression; " + property.name + " of \"" + context
                                    .getSourceCode()
                                    .getText(object) + "\" is always greater or equal to zero.",
                                node: node,
                            });
                        }
                    }
                }
            },
        };
    },
};
function isZeroLiteral(node) {
    return node.type === "Literal" && node.value === 0;
}
function isCollection(node, services) {
    var checker = services.program.getTypeChecker();
    var tp = checker.getTypeAtLocation(services.esTreeNodeToTSNodeMap.get(node));
    return !!tp.symbol && CollectionLike.includes(tp.symbol.name);
}
module.exports = rule;
//# sourceMappingURL=no-collection-size-mischeck.js.map