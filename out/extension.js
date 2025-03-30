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
    vscode.languages.registerCodeLensProvider('*', new CodeResQLensProvider());
    const analyzeAndDecorate = async () => {
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
    };
    context.subscriptions.push(vscode.commands.registerCommand("crq.crq", analyzeAndDecorate));
    analyzeAndDecorate(); // Trigger automatically when extension is activated
    context.subscriptions.push(vscode.commands.registerCommand("codeResQ.analyzeSelection", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showInformationMessage("Please select code to analyze for vulnerabilities.");
            return;
        }
        const selectedText = editor.document.getText(selection);
        const vulnerabilities = await (0, api_1.checkVulnerabilities)(selectedText);
        if (vulnerabilities && vulnerabilities.vulnerabilities.length > 0) {
            vscode.window.showInformationMessage(`Vulnerabilities: ${vulnerabilities.vulnerabilities.map((v) => v.description).join(", ")}`);
        }
        else {
            vscode.window.showInformationMessage("No vulnerabilities found.");
        }
    }), vscode.commands.registerCommand("codeResQ.refactorSelection", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showInformationMessage("Please select code to refactor.");
            return;
        }
        const selectedText = editor.document.getText(selection);
        let optimizedCode = await (0, api_1.refactorCode)(selectedText);
        if (!optimizedCode) {
            vscode.window.showErrorMessage("Refactoring failed.");
            return;
        }
        const importRegex = /^(import .+|from .+ import .+)$/gm;
        const imports = optimizedCode.match(importRegex) || [];
        optimizedCode = optimizedCode.replace(importRegex, '').trim();
        editor.edit(editBuilder => {
            const fullText = editor.document.getText();
            const existingImports = new Set(fullText.match(importRegex) || []);
            const newImports = imports.filter(i => !existingImports.has(i));
            if (newImports.length > 0) {
                editBuilder.insert(new vscode.Position(0, 0), `${newImports.join('\n')}\n`);
            }
            const commentedOriginal = selectedText
                .split('\n')
                .map(line => `# ${line}`)
                .join('\n');
            editBuilder.replace(selection, `${optimizedCode}\n\n\n${commentedOriginal}`);
        });
        vscode.window.showInformationMessage("Code refactored successfully.");
    }), vscode.commands.registerCommand("codeResQ.checkComplexitySelection", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showInformationMessage("Please select code to analyze for complexity.");
            return;
        }
        const selectedText = editor.document.getText(selection);
        const complexity = await (0, api_1.getComplexity)(selectedText);
        if (!complexity || !complexity.summary) {
            vscode.window.showErrorMessage("Complexity analysis failed.");
            return;
        }
        vscode.window.showInformationMessage(`Complexity: LOC=${complexity.summary.lines_of_code}, Maintainability=${complexity.summary.maintainability}, Cyclomatic=${complexity.summary.cyclomatic_complexity}, Cognitive=${complexity.summary.cognitive_complexity}, NPath=${complexity.summary.npath_complexity}`);
    }));
}
exports.activate = activate;
class CodeResQLensProvider {
    provideCodeLenses(document) {
        const lenses = [];
        const topOfDocument = new vscode.Range(0, 0, 0, 0);
        lenses.push(new vscode.CodeLens(topOfDocument, { title: "Analyze Selection", command: "codeResQ.analyzeSelection" }));
        lenses.push(new vscode.CodeLens(topOfDocument, { title: "Check Complexity", command: "codeResQ.checkComplexitySelection" }));
        lenses.push(new vscode.CodeLens(topOfDocument, { title: "Refactor Selection", command: "codeResQ.refactorSelection" }));
        const regex = /^\s*def\s+/;
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            if (regex.test(line.text)) {
                lenses.push(new vscode.CodeLens(line.range, { title: "Refactor Function", command: "codeResQ.refactorSelection" }));
                lenses.push(new vscode.CodeLens(line.range, { title: "Check Function Complexity", command: "codeResQ.checkComplexitySelection" }));
            }
        }
        return lenses;
    }
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map