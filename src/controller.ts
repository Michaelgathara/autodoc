import * as vscode from 'vscode';
import { SymbolUtils } from './utils/symbolUtils';
import { DocGenerator } from './generators/docGenerator';
import { Debouncer } from './utils/debounce';
import { ConfigService } from './config';

export class AutoDocController implements vscode.Disposable {
    private _disposables: vscode.Disposable[] = [];
    private _debouncer: Debouncer;

    constructor() {
        this._debouncer = new Debouncer(1500);
        this._disposables.push(
            vscode.workspace.onDidChangeTextDocument(this._onDocumentChanged, this),
            vscode.commands.registerCommand('autodoc.generate', this._forceGenerate, this)
        );
    }

    private async _onDocumentChanged(event: vscode.TextDocumentChangeEvent) {
        if (!event.contentChanges.length) return;
        
        await this._debouncer.debounce(async () => {
            await this._processDocument(event.document);
        });
    }

    private async _forceGenerate() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            await this._processDocument(editor.document);
        }
    }

    private async _processDocument(document: vscode.TextDocument) {
        if (!ConfigService.enable) return;

        if (!ConfigService.apiKey) {
            console.log('AutoDoc: No API Key set.');
            return;
        }

        const symbols = await SymbolUtils.getDocumentSymbols(document);
        const functions = SymbolUtils.extractFunctions(symbols);
        const functionsNeedingDocs = functions.filter(f => !SymbolUtils.hasDocString(document, f));

        for (const func of functionsNeedingDocs) {
            const docString = await DocGenerator.generate(document, func);
            
            if (docString) {
                const edit = new vscode.WorkspaceEdit();
                edit.insert(document.uri, func.range.start, docString);
                await vscode.workspace.applyEdit(edit);
                
                break; 
            }
        }
    }

    dispose() {
        this._disposables.forEach(d => d.dispose());
    }
}
