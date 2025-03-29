import * as vscode from 'vscode';
import { checkVulnerabilities, getComplexity, refactorCode } from './api';

export function activate(context: vscode.ExtensionContext) {

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
  };

  context.subscriptions.push(vscode.commands.registerCommand("hello-world.hello-world", analyzeAndDecorate));

  analyzeAndDecorate(); // Trigger automatically when extension is activated

  context.subscriptions.push(

    vscode.commands.registerCommand("codeResQ.analyzeSelection", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      if (selection.isEmpty) {
        vscode.window.showInformationMessage("Please select code to analyze for vulnerabilities.");
        return;
      }

      const selectedText = editor.document.getText(selection);
      const vulnerabilities = await checkVulnerabilities(selectedText);

      if (vulnerabilities && vulnerabilities.vulnerabilities.length > 0) {
        vscode.window.showInformationMessage(`Vulnerabilities: ${vulnerabilities.vulnerabilities.map((v: any) => v.description).join(", ")}`);
      } else {
        vscode.window.showInformationMessage("No vulnerabilities found.");
      }
    }),

    vscode.commands.registerCommand("codeResQ.refactorSelection", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      if (selection.isEmpty) {
        vscode.window.showInformationMessage("Please select code to refactor.");
        return;
      }

      const selectedText = editor.document.getText(selection);
      const optimizedCode = await refactorCode(selectedText);

      if (!optimizedCode) {
        vscode.window.showErrorMessage("Refactoring failed.");
        return;
      }

      const commentedOriginal = selectedText
        .split('\n')
        .map(line => `// ${line}`)
        .join('\n');

      editor.edit(editBuilder => {
        editBuilder.replace(selection, `${optimizedCode}\n\n// Original code:\n${commentedOriginal}`);
      });

      vscode.window.showInformationMessage("Code refactored successfully.");
    }),

    vscode.commands.registerCommand("codeResQ.checkComplexitySelection", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      if (selection.isEmpty) {
        vscode.window.showInformationMessage("Please select code to analyze for complexity.");
        return;
      }

      const selectedText = editor.document.getText(selection);
      const complexity = await getComplexity(selectedText);

      if (!complexity || !complexity.summary) {
        vscode.window.showErrorMessage("Complexity analysis failed.");
        return;
      }

      vscode.window.showInformationMessage(`Complexity: LOC=${complexity.summary.lines_of_code}, Maintainability=${complexity.summary.maintainability}, Cyclomatic=${complexity.summary.cyclomatic_complexity}, Cognitive=${complexity.summary.cognitive_complexity}, NPath=${complexity.summary.npath_complexity}`);
    })

  );
}

class CodeResQLensProvider implements vscode.CodeLensProvider {
  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const topOfDocument = new vscode.Range(0, 0, 0, 0);
    return [
      new vscode.CodeLens(topOfDocument, {
        title: "Analyze Selection",
        command: "codeResQ.analyzeSelection"
      }),
      new vscode.CodeLens(topOfDocument, {
        title: "Check Complexity",
        command: "codeResQ.checkComplexitySelection"
      }),
      new vscode.CodeLens(topOfDocument, {
        title: "Refactor Selection",
        command: "codeResQ.refactorSelection"
      })
    ];
  }
}

export function deactivate() {}