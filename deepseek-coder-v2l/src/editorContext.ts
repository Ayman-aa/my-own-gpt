import * as vscode from 'vscode';

export interface EditorContext {
    filename: string;
    language: string;
    selectedText: string;
    fullText: string;
}

export async function getActiveEditorContext(): Promise<EditorContext | null> {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        const selection = editor.selection;
        return {
            filename: document.fileName,
            language: document.languageId,
            selectedText: document.getText(selection),
            fullText: document.getText()
        };
    }
    return null;
}