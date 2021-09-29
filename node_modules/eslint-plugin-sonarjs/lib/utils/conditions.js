"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nodes_1 = require("./nodes");
/** Returns a list of statements corresponding to a `if - else if - else` chain */
function collectIfBranches(node) {
    var branches = [node.consequent];
    var endsWithElse = false;
    var statement = node.alternate;
    while (statement) {
        if (nodes_1.isIfStatement(statement)) {
            branches.push(statement.consequent);
            statement = statement.alternate;
        }
        else {
            branches.push(statement);
            endsWithElse = true;
            break;
        }
    }
    return { branches: branches, endsWithElse: endsWithElse };
}
exports.collectIfBranches = collectIfBranches;
/** Returns a list of `switch` clauses (both `case` and `default`) */
function collectSwitchBranches(node) {
    var endsWithDefault = false;
    var branches = node.cases
        .filter(function (clause, index) {
        if (!clause.test) {
            endsWithDefault = true;
        }
        // if a branch has no implementation, it's fall-through and it should not be considered
        // the only exception is the last case
        var isLast = index === node.cases.length - 1;
        return isLast || clause.consequent.length > 0;
    })
        .map(function (clause) { return takeWithoutBreak(clause.consequent); });
    return { branches: branches, endsWithDefault: endsWithDefault };
}
exports.collectSwitchBranches = collectSwitchBranches;
/** Excludes the break statement from the list */
function takeWithoutBreak(nodes) {
    return nodes.length > 0 && nodes[nodes.length - 1].type === "BreakStatement" ? nodes.slice(0, -1) : nodes;
}
exports.takeWithoutBreak = takeWithoutBreak;
//# sourceMappingURL=conditions.js.map