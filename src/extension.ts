import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "hello-world" is now active!');

  let disposable = vscode.commands.registerCommand(
    "hello-world.hello-world",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const document = editor.document;
        const text = document.getText();

        const outputChannel = vscode.window.createOutputChannel("File Content");
        outputChannel.clear();
        outputChannel.append(text);
        outputChannel.show(true);
      } else {
        vscode.window.showInformationMessage("No active text editor found.");
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
