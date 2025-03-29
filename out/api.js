"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkVulnerabilities = void 0;
const axios_1 = __importDefault(require("axios"));
async function checkVulnerabilities(code) {
    try {
        const response = await axios_1.default.post('http://127.0.0.1:8000/analyze', { code });
        return response.data;
    }
    catch (error) {
        return "error";
    }
}
exports.checkVulnerabilities = checkVulnerabilities;
//# sourceMappingURL=api.js.map