import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext)
{
	console.log("Ayman-ext is now active");

	const disposable = vscode.commands.registerCommand('Ayman-ext.himom', () => {
		vscode.window.showErrorMessage('Hi mom!');
	});
	context.subscriptions.push(disposable);
}