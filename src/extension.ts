import * as vscode from 'vscode';
import { checkVulnerabilities, getComplexity, refactorCode } from './api';

export function activate(context: vscode.ExtensionContext) {

  let vulnerabilityDisposable = vscode.commands.registerCommand("hello-world.hello-world", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage("No active text editor found.");
      return;
    }

    const document = editor.document;
    const text = document.getText();

    vscode.window.showInformationMessage("Analyzing code for vulnerabilities...");

    const vulnerabilities = await checkVulnerabilities(text);
    if (!vulnerabilities || !vulnerabilities.vulnerabilities) {
      vscode.window.showErrorMessage("Failed to analyze code or no vulnerabilities found.");
      return;
    }

    const decorationType = vscode.window.createTextEditorDecorationType({
      textDecoration: "underline wavy red"
    });

    const decorationsArray: vscode.DecorationOptions[] = [];
    vulnerabilities.vulnerabilities.forEach((vulnerability: any) => {
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
    const complexity = await getComplexity(text);

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
    const optimizedCode = await refactorCode(selectedText);

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

export function deactivate() {}
