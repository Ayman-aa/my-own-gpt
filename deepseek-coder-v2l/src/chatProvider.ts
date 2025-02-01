import * as vscode from 'vscode';
import ollama from 'ollama';
import { getWebviewContent } from './webview';
import { getActiveEditorContext } from './editorContext';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export class ChatProvider {
    private static readonly viewType = 'deepseekChat';
    private static panel: vscode.WebviewPanel | undefined;
    private messageHistory: Message[] = [];
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public createOrShowPanel(): vscode.WebviewPanel {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (ChatProvider.panel) {
            ChatProvider.panel.reveal(column);
            return ChatProvider.panel;
        }

        ChatProvider.panel = vscode.window.createWebviewPanel(
            ChatProvider.viewType,
            'Deepseek Chat',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        ChatProvider.panel.webview.html = getWebviewContent();

        this.setupWebviewMessageHandler(ChatProvider.panel);

        ChatProvider.panel.onDidDispose(
            () => {
                ChatProvider.panel = undefined;
                this.messageHistory = [];
            },
            null,
            this.context.subscriptions
        );

        return ChatProvider.panel;
    }

    private async setupWebviewMessageHandler(panel: vscode.WebviewPanel) {
        panel.webview.onDidReceiveMessage(
            async (message: any) => {
                switch (message.command) {
                    case 'chat':
                        await this.handleChatMessage(panel, message.text);
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    private async handleChatMessage(panel: vscode.WebviewPanel, userPrompt: string) {
        try {
            const context = await getActiveEditorContext();
            const enhancedPrompt = `Context: ${context?.filename || 'No file selected'}
Language: ${context?.language || 'unknown'}

Selected code:
${context?.selectedText || 'No code selected'}

User question: ${userPrompt}`;

            this.messageHistory.push({ role: 'user', content: userPrompt });

            let responseText = '';
            const streamResponse = await ollama.chat({
                model: 'deepseek-coder-v2:16b',
                messages: [...this.messageHistory],
                stream: true
            });

            for await (const part of streamResponse) {
                responseText += part.message.content;
                panel.webview.postMessage({ 
                    command: 'chatResponse',
                    text: responseText,
                    done: false
                });
            }

            this.messageHistory.push({ role: 'assistant', content: responseText });
            panel.webview.postMessage({ 
                command: 'chatResponse',
                text: responseText,
                done: true
            });

        } catch (err) {
            panel.webview.postMessage({
                command: 'error',
                text: `Error: ${String(err)}`
            });
        }
    }
}