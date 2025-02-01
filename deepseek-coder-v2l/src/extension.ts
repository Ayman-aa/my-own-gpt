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

        panel.webview.onDidReceiveMessage(async (message: any) => {
            if (message.command === 'chat') {
                const userPrompt = message.text
                let responseText = ''

                try {
                    const streamResponse = await ollama.chat({
                        model: 'deepseek-coder-v2:16b',
                        messages: [{ role: 'user', content: userPrompt }],
                        stream: true
                    })

                    for await (const part of streamResponse) {
                        responseText += part.message.content
                        panel.webview.postMessage({ command: 'chatResponse', text: responseText })
                    }

                } catch (err) {
                    panel.webview.postMessage({ command: 'chatResponse', text: `Error: ${String(err)}` })
                } finally {
                    panel.webview.postMessage({ command: 'enableButton' })
                }
            }
        })

        vscode.window.showInformationMessage('Hello World from Deepseek-Coder-v2L!');
    });

    context.subscriptions.push(disposable);
}

function getWebViewContent(): string {
    return /*html*/`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <style>
        body {
            font-family: sans-serif;
            margin: 1rem;
            background-color: #1e1e1e;
            color: #ffffff;
        }
        #prompt {
            width: 100%;
            box-sizing: border-box;
            background-color: #2d2d2d;
            color: #ffffff;
            border: 1px solid #555;
            padding: 0.5rem;
        }
        #response {
            border: 1px solid #555;
            margin-top: 1rem;
            padding: 0.5rem;
            min-height: 0.5rem;
            background-color: #2d2d2d;
        }
        button {
            background-color: #6a0dad;
            color: #ffffff;
            border: none;
            padding: 0.5rem 1rem;
            cursor: pointer;
            margin-top: 0.5rem;
        }
        button:disabled {
            background-color: #4b0082;
            cursor: not-allowed;
        }
        #loading {
            display: none;
            margin-top: 1rem;
            color: #6a0dad;
        }
    </style>
</head>
<body>
    <h2>Deep VSCode Extension</h2>
    <textarea id="prompt" rows="3" placeholder="Ask something..."></textarea><br />
    <button id="askBtn">Ask</button>
    <div id="response"></div>
    <div id="loading">Loading...</div>

    <script>
        const vscode = acquireVsCodeApi();

        document.getElementById('askBtn').addEventListener('click', () => {
            const text = document.getElementById('prompt').value;
            const askBtn = document.getElementById('askBtn');
            const responseDiv = document.getElementById('response');
            const loadingDiv = document.getElementById('loading');
            askBtn.disabled = true;
            responseDiv.innerText = '';
            loadingDiv.style.display = 'block';
            vscode.postMessage({ command: 'chat', text });
        });

        window.addEventListener('message', event => {
            const { command, text } = event.data;
            const loadingDiv = document.getElementById('loading');
            if (command === 'chatResponse') {
                document.getElementById('response').innerText = text;
                loadingDiv.style.display = 'none';
            } else if (command === 'enableButton') {
                document.getElementById('askBtn').disabled = false;
            }
        });
    </script> 
</body>
</html>
`
}

export function deactivate() { }
