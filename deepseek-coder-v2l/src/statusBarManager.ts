import * as vscode from 'vscode';

export class StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.text = "$(symbol-method) AI Chat";
        this.statusBarItem.command = 'deepseek-coder-v2l.start';
        this.statusBarItem.show();
    }

    dispose() {
        this.statusBarItem.dispose();
    }
}
