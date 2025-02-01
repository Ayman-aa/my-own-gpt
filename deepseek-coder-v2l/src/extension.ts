import ollama from 'ollama'
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "deepseek-coder-v2l" is now active!');

	const disposable = vscode.commands.registerCommand('deepseek-coder-v2l.start', () => {

		const panel = vscode.window.createWebviewPanel(
			'deepchat',
			'Deep Seek Chat',
			vscode.ViewColumn.One,
			{ enableScripts: true }
		)

		panel.webview.html = getWebViewContent()

		panel.webview.onDidReceiveMessage(async (message:any) => {
			if (message.command === 'chat')
			{
				const userPrompt = message.text
				let responseText = ''

				try
				{
					const streamResponse = await ollama.chat({
						model:'deepseek-coder-v2:16b',
						messages:[{ role: 'user', content: userPrompt}],
						stream: true
					})

					for await(const part of streamResponse)
					{
						responseText += part.message.content
						panel.webview.postMessage({ command: 'chatResponse', text: responseText })
					}

				} catch(err)
				{
					panel.webview.postMessage({ command:'chatResponse', text:`Error: ${String(err)}` })
				}
			}
		})
		
		vscode.window.showInformationMessage('Hello World from Deepseek-Coder-v2L!');
	});

	context.subscriptions.push(disposable);
}

function getWebViewContent(): string
{
	return /*html*/`
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<style>
			body { font-family: sans-serif; margin: 1rem; }
			#prompt { width:100%; box-sizing: border-box; }
			#response { border: 1px solid #ccc; margin-top: 1rem; padding: 0.5rem; min-height: 0.5rem; }
		</style>
	</head>
	<body>
	<h2>Deep VSCode Extension</h2>
	<textarea id="prompt" rows="3" placeholder="Ask something..."></textarea><br />
	<button id="askBtn">Ask</button>
	<div id="response"></div>

	<script>
		const vscode = acquireVsCodeApi();

		document.getElementById('askBtn').addEventListener('click', () => {
			const text = document.getElementById('prompt').value;
			vscode.postMessage({ command: 'chat', text })
		});
	
		window.addEventListener('message', event => {
			const {command, text} = event.data;
			if (command === 'chatResponse')
			{
				document.getElementById('response').innerText = text;
			}
		});

	</script> 
	</body>
	</html>
	`
}

export function deactivate() {}
