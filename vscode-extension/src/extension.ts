import * as vscode from 'vscode';
import { HtmdEditorProvider } from './htmdEditorProvider';
import { HtmdMdPreviewPanel } from './htmdMdPreviewPanel';

export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(HtmdEditorProvider.register(context));

    context.subscriptions.push(
        vscode.commands.registerCommand('htmd.openPreview', () => {
            const uri = activeHtmdUri();
            if (!uri) {
                vscode.window.showWarningMessage('Open an .htmd file first.');
                return;
            }
            vscode.commands.executeCommand(
                'vscode.openWith',
                uri,
                HtmdEditorProvider.viewType,
                vscode.ViewColumn.Beside
            );
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('htmd.openMdPreview', () => {
            const doc = activeHtmdDocument();
            if (!doc) {
                vscode.window.showWarningMessage('Open an .htmd file first.');
                return;
            }
            HtmdMdPreviewPanel.createOrShow(doc, context);
        })
    );
}

export function deactivate(): void {}

function activeHtmdUri(): vscode.Uri | undefined {
    const editor = vscode.window.activeTextEditor;
    if (editor?.document.fileName.endsWith('.htmd')) {
        return editor.document.uri;
    }
    return undefined;
}

function activeHtmdDocument(): vscode.TextDocument | undefined {
    const editor = vscode.window.activeTextEditor;
    if (editor?.document.fileName.endsWith('.htmd')) {
        return editor.document;
    }
    return undefined;
}
