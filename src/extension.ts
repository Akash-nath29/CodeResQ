import * as vscode from 'vscode';
import { checkVulnerabilities } from './api';

export function activate(context: vscode.ExtensionContext) {
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

    const vulnerabilities = await checkVulnerabilities(text);
    if (!vulnerabilities || !vulnerabilities.vulnerabilities) {
      vscode.window.showErrorMessage("Failed to analyze code or no vulnerabilities found.");
      return;
    }

    // Create decorations for the vulnerabilities
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

  context.subscriptions.push(disposable);
}

export function deactivate() {}
