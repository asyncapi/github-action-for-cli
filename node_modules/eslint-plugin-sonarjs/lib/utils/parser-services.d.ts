import { ParserServices } from "@typescript-eslint/parser";
export declare type RequiredParserServices = {
    [k in keyof ParserServices]: Exclude<ParserServices[k], undefined>;
};
export declare function isRequiredParserServices(services: ParserServices): services is RequiredParserServices;
