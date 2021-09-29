"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns a location of the "main" function token:
 * - function name for a function declaration, method or accessor
 * - "function" keyword for a function expression
 * - "=>" for an arrow function
 */
function getMainFunctionTokenLocation(fn, parent, context) {
    var location;
    if (fn.type === "FunctionDeclaration") {
        // `fn.id` can be null when it is `export default function` (despite of the @types/estree definition)
        if (fn.id) {
            location = fn.id.loc;
        }
        else {
            var token = getTokenByValue(fn, "function", context);
            location = token && token.loc;
        }
    }
    else if (fn.type === "FunctionExpression") {
        if (parent && (parent.type === "MethodDefinition" || parent.type === "Property")) {
            location = parent.key.loc;
        }
        else {
            var token = getTokenByValue(fn, "function", context);
            location = token && token.loc;
        }
    }
    else if (fn.type === "ArrowFunctionExpression") {
        var token = context
            .getSourceCode()
            .getTokensBefore(fn.body)
            .reverse()
            .find(function (token) { return token.value === "=>"; });
        location = token && token.loc;
    }
    return location;
}
exports.getMainFunctionTokenLocation = getMainFunctionTokenLocation;
/**
 * Wrapper for `context.report`, supporting secondary locations and cost.
 * Encode those extra information in the issue message when rule is executed
 * in Sonar* environment.
 */
function report(context, reportDescriptor, secondaryLocations, cost) {
    if (secondaryLocations === void 0) { secondaryLocations = []; }
    var message = reportDescriptor.message;
    if (context.options[context.options.length - 1] === "sonar-runtime") {
        var encodedMessage = { secondaryLocations: secondaryLocations, message: message, cost: cost };
        reportDescriptor.message = JSON.stringify(encodedMessage);
    }
    context.report(reportDescriptor);
}
exports.report = report;
/**
 * Converts `SourceLocation` range into `IssueLocation`
 */
function issueLocation(startLoc, endLoc, message) {
    if (endLoc === void 0) { endLoc = startLoc; }
    if (message === void 0) { message = ""; }
    return {
        line: startLoc.start.line,
        column: startLoc.start.column,
        endLine: endLoc.end.line,
        endColumn: endLoc.end.column,
        message: message,
    };
}
exports.issueLocation = issueLocation;
function toEncodedMessage(message, secondaryLocationsHolder, secondaryMessages, cost) {
    var encodedMessage = {
        message: message,
        cost: cost,
        secondaryLocations: secondaryLocationsHolder.map(function (locationHolder, index) {
            return toSecondaryLocation(locationHolder, secondaryMessages ? secondaryMessages[index] : undefined);
        }),
    };
    return JSON.stringify(encodedMessage);
}
exports.toEncodedMessage = toEncodedMessage;
function toSecondaryLocation(locationHolder, message) {
    return {
        message: message,
        column: locationHolder.loc.start.column,
        line: locationHolder.loc.start.line,
        endColumn: locationHolder.loc.end.column,
        endLine: locationHolder.loc.end.line,
    };
}
function getTokenByValue(node, value, context) {
    return context
        .getSourceCode()
        .getTokens(node)
        .find(function (token) { return token.value === value; });
}
function getFirstTokenAfter(node, context) {
    return context.getSourceCode().getTokenAfter(node);
}
exports.getFirstTokenAfter = getFirstTokenAfter;
function getFirstToken(node, context) {
    return context.getSourceCode().getTokens(node)[0];
}
exports.getFirstToken = getFirstToken;
//# sourceMappingURL=locations.js.map