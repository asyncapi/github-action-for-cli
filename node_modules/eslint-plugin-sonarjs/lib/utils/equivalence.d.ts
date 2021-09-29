import { Node } from "estree";
import { SourceCode } from "eslint";
/**
 * Equivalence is implemented by comparing node types and their tokens.
 * Classic implementation would recursively compare children,
 * but "estree" doesn't provide access to children when node type is unknown
 */
export declare function areEquivalent(first: Node | Node[], second: Node | Node[], sourceCode: SourceCode): boolean;
