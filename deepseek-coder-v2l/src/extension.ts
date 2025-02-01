import * as vscode from 'vscode';
import ollama from 'ollama';
import { ChatProvider } from './chatProvider';
import { getActiveEditorContext } from './editorContext';
import { StatusBarManager } from './statusBarManager';

export function activate(context: vscode.ExtensionContext) {
    console.log('Deepseek Coder Chat is now active');

    const statusBarManager = new StatusBarManager();
    const chatProvider = new ChatProvider(context);

    // Register the main chat command
    let chatCommand = vscode.commands.registerCommand('deepseek-coder-v2l.start', () => {
        chatProvider.createOrShowPanel();
    });

    // Register the explain code command
    let explainCommand = vscode.commands.registerCommand('deepseek-coder-v2l.explainCode', async () => {
        const context = await getActiveEditorContext();
        if (context?.selectedText) {
            const panel = chatProvider.createOrShowPanel();
            const prompt = `Explain this code:\n\`\`\`${context.language}\n${context.selectedText}\n\`\`\``;
            panel.webview.postMessage({ command: 'setPredefinedPrompt', text: prompt });
        }
    });

    // Register the code action provider
    const codeActionProvider = vscode.languages.registerCodeActionsProvider(
        { pattern: '**/*.{js,ts,jsx,tsx,py,java,cpp,c,cs,php,ruby,go}' },
        {
            provideCodeActions(document, range) {
                const actions = [];
                if (!range.isEmpty) {
                    actions.push({
                        title: 'Explain this code',
                        command: 'deepseek-coder-v2l.explainCode',
                        arguments: [range]
                    });
                }
                return actions;
            }
        }
    );

    context.subscriptions.push(
        chatCommand,
        explainCommand,
        codeActionProvider,
        statusBarManager
    );
}

export function deactivate() {}