import { Rule, AST } from "eslint";
import * as estree from "estree";
export interface IssueLocation {
    column: number;
    line: number;
    endColumn: number;
    endLine: number;
    message?: string;
}
export interface EncodedMessage {
    message: string;
    cost?: number;
    secondaryLocations: IssueLocation[];
}
/**
 * Returns a location of the "main" function token:
 * - function name for a function declaration, method or accessor
 * - "function" keyword for a function expression
 * - "=>" for an arrow function
 */
export declare function getMainFunctionTokenLocation(fn: estree.Function, parent: estree.Node | undefined, context: Rule.RuleContext): estree.SourceLocation;
export declare type ReportDescriptor = Rule.ReportDescriptor & {
    message: string;
};
/**
 * Wrapper for `context.report`, supporting secondary locations and cost.
 * Encode those extra information in the issue message when rule is executed
 * in Sonar* environment.
 */
export declare function report(context: Rule.RuleContext, reportDescriptor: ReportDescriptor, secondaryLocations?: IssueLocation[], cost?: number): void;
/**
 * Converts `SourceLocation` range into `IssueLocation`
 */
export declare function issueLocation(startLoc: estree.SourceLocation, endLoc?: estree.SourceLocation, message?: string): IssueLocation;
export declare function toEncodedMessage(message: string, secondaryLocationsHolder: Array<AST.Token | estree.Node>, secondaryMessages?: string[], cost?: number): string;
export declare function getFirstTokenAfter(node: estree.Node, context: Rule.RuleContext): AST.Token | null;
export declare function getFirstToken(node: estree.Node, context: Rule.RuleContext): AST.Token;
