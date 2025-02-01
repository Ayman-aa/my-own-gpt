export function getWebviewContent(): string {
    return /*html*/`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deepseek Chat</title>
    <style>
        :root {
            --vscode-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        body {
            font-family: var(--vscode-font-family);
            padding: 0;
            margin: 0;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        .chat-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            padding: 1rem;
        }
        .messages {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 1rem;
            padding: 1rem;
        }
        .message {
            margin-bottom: 1rem;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            max-width: 80%;
        }
        .user-message {
            background-color: var(--vscode-button-background);
            margin-left: auto;
        }
        .assistant-message {
            background-color: var(--vscode-editor-selectionBackground);
        }
        .input-container {
            display: flex;
            gap: 0.5rem;
        }
        #prompt {
            flex: 1;
            padding: 0.5rem;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            resize: vertical;
            min-height: 2.5rem;
        }
        button {
            padding: 0.5rem 1rem;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        pre {
            background-color: var(--vscode-textBlockQuote-background);
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
        }
        code {
            font-family: var(--vscode-editor-font-family);
        }
        .message-content {
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="messages" id="messages"></div>
        <div class="input-container">
            <textarea 
                id="prompt" 
                placeholder="Ask something..."
                rows="3"
            ></textarea>
            <button id="sendButton">Send</button>
        </div>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        const messagesDiv = document.getElementById('messages');
        const promptInput = document.getElementById('prompt');
        const sendButton = document.getElementById('sendButton');
        let isProcessing = false;

        function createMessageElement(content, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = \`message \${isUser ? 'user-message' : 'assistant-message'}\`;
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        messageDiv.appendChild(contentDiv);
        return messageDiv;
    }

        function scrollToBottom() {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        sendButton.addEventListener('click', () => {
            if (isProcessing || !promptInput.value.trim()) return;
            
            const message = promptInput.value;
            messagesDiv.appendChild(createMessageElement(message, true));
            scrollToBottom();
            
            promptInput.value = '';
            isProcessing = true;
            sendButton.disabled = true;
            
            vscode.postMessage({ command: 'chat', text: message });
        });

        promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendButton.click();
            }
        });

        window.addEventListener('message', event => {
            const message = event.data;

            switch (message.command) {
                case 'chatResponse':
                    const lastMessage = messagesDiv.lastElementChild;
                    if (lastMessage?.classList.contains('assistant-message')) {
                        lastMessage.querySelector('.message-content').textContent = message.text;
                    } else {
                        messagesDiv.appendChild(createMessageElement(message.text, false));
                    }
                    scrollToBottom();
                    
                    if (message.done) {
                        isProcessing = false;
                        sendButton.disabled = false;
                    }
                    break;

                case 'setPredefinedPrompt':
                    promptInput.value = message.text;
                    promptInput.focus();
                    break;

                case 'error':
                    messagesDiv.appendChild(createMessageElement(message.text, false));
                    isProcessing = false;
                    sendButton.disabled = false;
                    scrollToBottom();
                    break;
            }
        });
    </script>
</body>
</html>`;
}