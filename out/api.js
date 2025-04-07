"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refactorCode = exports.getComplexity = exports.checkVulnerabilities = void 0;
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
async function getComplexity(code) {
    try {
        const response = await axios_1.default.post('http://127.0.0.1:8000/complexity', { code });
        return response.data;
    }
    catch (error) {
        return "error";
    }
}
exports.getComplexity = getComplexity;
async function refactorCode(code) {
    try {
        const response = await axios_1.default.post('http://127.0.0.1:8000/refactor', { code });
        return response.data.optimized_code;
    }
    catch (error) {
        return null;
    }
}
exports.refactorCode = refactorCode;
//# sourceMappingURL=api.js.map