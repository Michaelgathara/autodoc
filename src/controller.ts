import * as vscode from 'vscode';
import { SymbolUtils } from './utils/symbolUtils';
import { DocGenerator } from './generators/docGenerator';
import { Debouncer } from './utils/debounce';
import { ConfigService } from './config';

export class AutoDocController implements vscode.Disposable {
    private _disposables: vscode.Disposable[] = [];
    private _debouncer: Debouncer;
    private _dirtyRanges: vscode.Range[] = [];

    constructor() {
        this._debouncer = new Debouncer(1500);
        this._disposables.push(
            vscode.workspace.onDidChangeTextDocument(this._onDocumentChanged, this),
            vscode.commands.registerCommand('autodoc.generate', this._forceGenerate, this)
        );
    }

    private async _onDocumentChanged(event: vscode.TextDocumentChangeEvent) {
        if (!event.contentChanges.length) return;
        
        event.contentChanges.forEach(change => {
            this._dirtyRanges.push(change.range);
        });

        await this._debouncer.debounce(async () => {
            await this._processDocument(event.document, [...this._dirtyRanges]);
            this._dirtyRanges = [];
        });
    }

    private async _forceGenerate() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const fullRange = new vscode.Range(0, 0, editor.document.lineCount, 0);
            await this._processDocument(editor.document, [fullRange], true);
        }
    }

    private async _processDocument(document: vscode.TextDocument, changedRanges: vscode.Range[], force = false) {
        if (!ConfigService.enable) return;
        
        const apiKey = await ConfigService.getApiKey();
        if (!apiKey) {
            console.log('AutoDoc: No API Key set.');
            return;
        }

        const symbols = await SymbolUtils.getDocumentSymbols(document);
        const functions = SymbolUtils.extractFunctions(symbols);

        for (const func of functions) {
            const existingDocRange = SymbolUtils.getDocStringRange(document, func);
            
            if (!existingDocRange) {
                const wasEdited = changedRanges.some(range => func.range.contains(range));
                
                if (wasEdited || force) {
                    const docString = await DocGenerator.generate(document, func);
                    if (docString) {
                        const indent = ' '.repeat(func.range.start.character);
                        const textToInsert = docString + '\n' + indent; 
                        
                        const edit = new vscode.WorkspaceEdit();
                        edit.insert(document.uri, func.range.start, textToInsert);
                        await vscode.workspace.applyEdit(edit);
                        return;
                    }
                }
            } 
            else {
                const codeChanged = changedRanges.some(range => func.range.contains(range));
                const docsChanged = changedRanges.some(range => existingDocRange.intersection(range));

                if (codeChanged && !docsChanged) {
                    const docString = await DocGenerator.generate(document, func);
                    if (docString) {
                        const edit = new vscode.WorkspaceEdit();
                        edit.replace(document.uri, existingDocRange, docString); 
                        await vscode.workspace.applyEdit(edit);
                        return; 
                    }
                }
            }
        }
    }

    dispose() {
        this._disposables.forEach(d => d.dispose());
    }
}
