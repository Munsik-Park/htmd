import * as path from 'path';
import * as vscode from 'vscode';

const HTMD_BLOCK_RE = /<!--HTMD\r?\n([\s\S]*?)\r?\nHTMD-->/g;

/**
 * WebviewPanel that displays only the Markdown (MD) layer of an .htmd file —
 * the content inside <!--HTMD ... HTMD--> comment blocks.
 */
export class HtmdMdPreviewPanel {
    private static readonly _viewType = 'htmd.mdPreview';
    private static readonly _panels = new Map<string, HtmdMdPreviewPanel>();

    private readonly _panel: vscode.WebviewPanel;
    private readonly _disposables: vscode.Disposable[] = [];

    public static createOrShow(
        document: vscode.TextDocument,
        context: vscode.ExtensionContext
    ): void {
        const key = document.uri.toString();

        if (HtmdMdPreviewPanel._panels.has(key)) {
            HtmdMdPreviewPanel._panels.get(key)!._panel.reveal(vscode.ViewColumn.Beside);
            return;
        }

        new HtmdMdPreviewPanel(document, context);
    }

    private constructor(
        document: vscode.TextDocument,
        _context: vscode.ExtensionContext
    ) {
        const fileName = path.basename(document.fileName);

        this._panel = vscode.window.createWebviewPanel(
            HtmdMdPreviewPanel._viewType,
            `MD: ${fileName}`,
            vscode.ViewColumn.Beside,
            { enableScripts: false, retainContextWhenHidden: false }
        );

        this._render(document.getText());

        HtmdMdPreviewPanel._panels.set(document.uri.toString(), this);

        this._disposables.push(
            vscode.workspace.onDidChangeTextDocument(e => {
                if (e.document.uri.toString() === document.uri.toString()) {
                    this._render(e.document.getText());
                }
            })
        );

        this._panel.onDidDispose(() => this._dispose(document.uri.toString()), null, this._disposables);
    }

    private _render(content: string): void {
        const blocks = extractMdBlocks(content);
        this._panel.webview.html = buildMdHtml(blocks);
    }

    private _dispose(key: string): void {
        HtmdMdPreviewPanel._panels.delete(key);
        this._panel.dispose();
        this._disposables.forEach(d => d.dispose());
    }
}

function extractMdBlocks(content: string): string[] {
    const blocks: string[] = [];
    let match: RegExpExecArray | null;
    const re = new RegExp(HTMD_BLOCK_RE.source, 'g');
    while ((match = re.exec(content)) !== null) {
        blocks.push(match[1].trim());
    }
    return blocks;
}

function escape(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function buildMdHtml(blocks: string[]): string {
    const body = blocks.length === 0
        ? '<p class="empty">No <code>&lt;!--HTMD ... HTMD--&gt;</code> blocks found in this file.</p>'
        : blocks.map((b, i) => `<section>
  <div class="label">Block ${i + 1}</div>
  <pre><code>${escape(b)}</code></pre>
</section>`).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTMD MD Preview</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-editor-foreground);
      background: var(--vscode-editor-background);
      padding: 1em 2em;
      line-height: 1.6;
    }
    h1 {
      font-size: 1.1em;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 1.2em;
      border-bottom: 1px solid var(--vscode-panel-border);
      padding-bottom: 0.4em;
    }
    section { margin-bottom: 1.5em; }
    .label {
      font-size: 0.75em;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 0.3em;
    }
    pre {
      margin: 0;
      padding: 0.8em 1em;
      background: var(--vscode-textBlockQuote-background,
                      var(--vscode-editor-inactiveSelectionBackground));
      border-left: 3px solid var(--vscode-activityBarBadge-background, #0078d4);
      border-radius: 2px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }
    code {
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: var(--vscode-editor-font-size, 0.9em);
    }
    .empty {
      color: var(--vscode-descriptionForeground);
      font-style: italic;
    }
  </style>
</head>
<body>
  <h1>HTMD — Markdown Layer</h1>
  ${body}
</body>
</html>`;
}
