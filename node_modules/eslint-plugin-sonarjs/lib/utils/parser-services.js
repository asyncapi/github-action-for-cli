"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isRequiredParserServices(services) {
    return !!services && !!services.program && !!services.esTreeNodeToTSNodeMap;
}
exports.isRequiredParserServices = isRequiredParserServices;
//# sourceMappingURL=parser-services.js.map