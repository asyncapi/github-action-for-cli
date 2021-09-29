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
// https://jira.sonarsource.com/browse/RSPEC-1751
var nodes_1 = require("../utils/nodes");
var rule = {
    create: function (context) {
        var loopingNodes = new Set();
        var loops = new Set();
        var loopsAndTheirSegments = [];
        var currentCodePaths = [];
        return {
            ForStatement: function (node) {
                loops.add(node);
            },
            WhileStatement: function (node) {
                loops.add(node);
            },
            DoWhileStatement: function (node) {
                loops.add(node);
            },
            onCodePathStart: function (codePath) {
                currentCodePaths.push(codePath);
            },
            onCodePathEnd: function () {
                currentCodePaths.pop();
            },
            "WhileStatement > *": function () {
                var parent = nodes_1.getParent(context);
                visitLoopChild(parent);
            },
            "ForStatement > *": function () {
                var parent = nodes_1.getParent(context);
                visitLoopChild(parent);
            },
            onCodePathSegmentLoop: function (_, toSegment, node) {
                if (nodes_1.isContinueStatement(node)) {
                    loopsAndTheirSegments.forEach(function (_a) {
                        var segments = _a.segments, loop = _a.loop;
                        if (segments.includes(toSegment)) {
                            loopingNodes.add(loop);
                        }
                    });
                }
                else {
                    loopingNodes.add(node);
                }
            },
            "Program:exit": function () {
                loops.forEach(function (loop) {
                    if (!loopingNodes.has(loop)) {
                        context.report({
                            message: "Refactor this loop to do more than one iteration.",
                            loc: context.getSourceCode().getFirstToken(loop).loc,
                        });
                    }
                });
            },
        };
        // Required to correctly process "continue" looping.
        // When a loop has a "continue" statement, this "continue" statement triggers a "onCodePathSegmentLoop" event,
        // and the corresponding event node is that "continue" statement. Current implementation is based on the fact
        // that the "onCodePathSegmentLoop" event is triggerent with a loop node. To work this special case around,
        // we visit loop children and collect corresponding path segments as these segments are "toSegment"
        // in "onCodePathSegmentLoop" event.
        function visitLoopChild(parent) {
            if (currentCodePaths.length > 0) {
                var currentCodePath = currentCodePaths[currentCodePaths.length - 1];
                loopsAndTheirSegments.push({ segments: currentCodePath.currentSegments, loop: parent });
            }
        }
    },
};
module.exports = rule;
//# sourceMappingURL=no-one-iteration-loop.js.map