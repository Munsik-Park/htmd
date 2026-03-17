import * as vscode from 'vscode';

/**
 * CustomTextEditorProvider that renders the HTML layer of .htmd files.
 * <!--HTMD ... HTMD--> blocks are standard HTML comments, so they are
 * invisible when the file is rendered as HTML in the webview.
 */
export class HtmdEditorProvider implements vscode.CustomTextEditorProvider {
    public static readonly viewType = 'htmd.preview';

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new HtmdEditorProvider(context);
        return vscode.window.registerCustomEditorProvider(
            HtmdEditorProvider.viewType,
            provider,
            {
                webviewOptions: { retainContextWhenHidden: true },
                supportsMultipleEditorsPerDocument: false,
            }
        );
    }

    constructor(private readonly _context: vscode.ExtensionContext) {}

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = { enableScripts: true };

        const render = () => {
            webviewPanel.webview.html = this._buildWebviewHtml(
                document.getText(),
                webviewPanel.webview
            );
        };

        render();

        const subscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                render();
            }
        });

        webviewPanel.onDidDispose(() => subscription.dispose());
    }

    private _buildWebviewHtml(content: string, webview: vscode.Webview): string {
        const nonce = getNonce();

        // If the .htmd file already has a <head>, inject CSP and reload script there.
        // Otherwise wrap the content in a minimal shell.
        if (/<html/i.test(content)) {
            return injectIntoHtml(content, nonce, webview.cspSource);
        }

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-editor-foreground);
      background: var(--vscode-editor-background);
      padding: 1em 2em;
      line-height: 1.6;
    }
  </style>
</head>
<body>
${content}
<script nonce="${nonce}">
  window.addEventListener('message', e => {
    if (e.data && e.data.type === 'update') {
      document.open(); document.write(e.data.html); document.close();
    }
  });
</script>
</body>
</html>`;
    }
}

/**
 * Inject a CSP meta tag into the <head> of an existing HTML document.
 * Leaves all other content intact.
 */
function injectIntoHtml(html: string, nonce: string, cspSource: string): string {
    const csp = `<meta http-equiv="Content-Security-Policy" `
        + `content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; `
        + `script-src 'nonce-${nonce}';">`;

    const headMatch = html.match(/<head[^>]*>/i);
    if (headMatch && headMatch.index !== undefined) {
        const insertAt = headMatch.index + headMatch[0].length;
        return html.slice(0, insertAt) + '\n' + csp + html.slice(insertAt);
    }

    return csp + '\n' + html;
}

function getNonce(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 32 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
}
