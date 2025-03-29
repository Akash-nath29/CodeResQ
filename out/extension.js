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
    //   console.log('Congratulations, your extension "hello-world" is now active!');
    let disposable = vscode.commands.registerCommand("hello-world.hello-world", async () => {
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
        // Create decorations for the vulnerabilities
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
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map