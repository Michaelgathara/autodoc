import * as vscode from 'vscode';

export class SymbolUtils {
    static async getDocumentSymbols(document: vscode.TextDocument): Promise<vscode.DocumentSymbol[]> {
        const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
            'vscode.executeDocumentSymbolProvider',
            document.uri
        );
        return symbols || [];
    }

    static extractFunctions(symbols: vscode.DocumentSymbol[]): vscode.DocumentSymbol[] {
        const functions: vscode.DocumentSymbol[] = [];
        
        for (const symbol of symbols) {
            if (symbol.kind === vscode.SymbolKind.Function || symbol.kind === vscode.SymbolKind.Method) {
                functions.push(symbol);
            }
            if (symbol.children) {
                functions.push(...this.extractFunctions(symbol.children));
            }
        }
        
        return functions;
    }

    static hasDocString(document: vscode.TextDocument, symbol: vscode.DocumentSymbol): boolean {
        const startLine = symbol.range.start.line;
        if (startLine === 0) return false;

        const previousLine = document.lineAt(startLine - 1);
        const text = previousLine.text.trim();
        
        return text.endsWith('*/') || text.endsWith('"""') || text.startsWith('///');
    }
}

