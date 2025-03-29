"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const api_1 = require("./api");
function activate(context) {
    let vulnerabilityDisposable = vscode.commands.registerCommand("hello-world.hello-world", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage("No active text editor found.");
            return;
        }
        const document = editor.document;
        const text = document.getText();
        vscode.window.showInformationMessage("Analyzing code for vulnerabilities...");
        const vulnerabilities = await (0, api_1.checkVulnerabilities)(text);
        if (!vulnerabilities || !vulnerabilities.vulnerabilities) {
            vscode.window.showErrorMessage("Failed to analyze code or no vulnerabilities found.");
            return;
        }
        const decorationType = vscode.window.createTextEditorDecorationType({
            textDecoration: "underline wavy red"
        });
        const decorationsArray = [];
        vulnerabilities.vulnerabilities.forEach((vulnerability) => {
            const line = vulnerability.line - 1;
            const range = new vscode.Range(line, 0, line, 1000);
            decorationsArray.push({
                range,
                hoverMessage: `${vulnerability.severity.toUpperCase()}: ${vulnerability.description}`
            });
        });
        editor.setDecorations(decorationType, decorationsArray);
        vscode.window.showInformationMessage(`Detected ${vulnerabilities.vulnerabilities.length} vulnerabilities.`);
    });
    let complexityDisposable = vscode.commands.registerCommand("hello-world.checkComplexity", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage("No active text editor found.");
            return;
        }
        const text = editor.document.getText();
        const complexity = await (0, api_1.getComplexity)(text);
        if (!complexity || !complexity.summary) {
            vscode.window.showErrorMessage("Failed to get complexity analysis.");
            return;
        }
        vscode.window.showInformationMessage(`Complexity Analysis: LOC=${complexity.summary.lines_of_code}, Maintainability=${complexity.summary.maintainability}, Cyclomatic=${complexity.summary.cyclomatic_complexity}, Cognitive=${complexity.summary.cognitive_complexity}, NPath=${complexity.summary.npath_complexity}`);
    });
    let refactorDisposable = vscode.commands.registerCommand("hello-world.refactorCode", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage("No active text editor found.");
            return;
        }
        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showInformationMessage("Please select the code you want to refactor.");
            return;
        }
        const selectedText = editor.document.getText(selection);
        const optimizedCode = await (0, api_1.refactorCode)(selectedText);
        if (!optimizedCode) {
            vscode.window.showErrorMessage("Refactoring failed.");
            return;
        }
        editor.edit(editBuilder => {
            editBuilder.replace(selection, optimizedCode);
        });
        vscode.window.showInformationMessage("Code refactored successfully.");
    });
    context.subscriptions.push(vulnerabilityDisposable);
    context.subscriptions.push(complexityDisposable);
    context.subscriptions.push(refactorDisposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map