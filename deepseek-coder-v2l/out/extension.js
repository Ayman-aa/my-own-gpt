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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const ollama_1 = __importDefault(require("ollama"));
const vscode = __importStar(require("vscode"));
function activate(context) {
    console.log('Congratulations, your extension "deepseek-coder-v2l" is now active!');
    const disposable = vscode.commands.registerCommand('deepseek-coder-v2l.start', () => {
        const panel = vscode.window.createWebviewPanel('deepchat', 'Deep Seek Chat', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = getWebViewContent();
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'chat') {
                const userPrompt = message.text;
                let responseText = '';
                try {
                    const streamResponse = await ollama_1.default.chat({
                        model: 'deepseek-coder-v2:16b',
                        messages: [{ role: 'user', content: userPrompt }],
                        stream: true
                    });
                    for await (const part of streamResponse) {
                        responseText += part.message.content;
                        panel.webview.postMessage({ command: 'chatResponse', text: responseText });
                    }
                }
                catch (err) {
                    panel.webview.postMessage({ command: 'chatResponse', text: `Error: ${String(err)}` });
                }
                finally {
                    panel.webview.postMessage({ command: 'enableButton' });
                }
            }
        });
        vscode.window.showInformationMessage('Hello World from Deepseek-Coder-v2L!');
    });
    context.subscriptions.push(disposable);
}
function getWebViewContent() {
    return /*html*/ `
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
`;
}
function deactivate() { }
//# sourceMappingURL=extension.js.map