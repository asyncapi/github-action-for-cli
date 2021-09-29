import { Linter } from "eslint";
declare const sonarjsRuleModules: any;
declare const configs: {
    recommended: Linter.Config & {
        plugins: string[];
    };
};
export { sonarjsRuleModules as rules, configs };
