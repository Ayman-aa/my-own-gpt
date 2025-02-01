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
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const chatProvider_1 = require("./chatProvider");
const editorContext_1 = require("./editorContext");
const statusBarManager_1 = require("./statusBarManager");
function activate(context) {
    console.log('Deepseek Coder Chat is now active');
    const statusBarManager = new statusBarManager_1.StatusBarManager();
    const chatProvider = new chatProvider_1.ChatProvider(context);
    // Register the main chat command
    let chatCommand = vscode.commands.registerCommand('deepseek-coder-v2l.start', () => {
        chatProvider.createOrShowPanel();
    });
    // Register the explain code command
    let explainCommand = vscode.commands.registerCommand('deepseek-coder-v2l.explainCode', async () => {
        const context = await (0, editorContext_1.getActiveEditorContext)();
        if (context?.selectedText) {
            const panel = chatProvider.createOrShowPanel();
            const prompt = `Explain this code:\n\`\`\`${context.language}\n${context.selectedText}\n\`\`\``;
            panel.webview.postMessage({ command: 'setPredefinedPrompt', text: prompt });
        }
    });
    // Register the code action provider
    const codeActionProvider = vscode.languages.registerCodeActionsProvider({ pattern: '**/*.{js,ts,jsx,tsx,py,java,cpp,c,cs,php,ruby,go}' }, {
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
    });
    context.subscriptions.push(chatCommand, explainCommand, codeActionProvider, statusBarManager);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map