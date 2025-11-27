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

    static getDocStringRange(document: vscode.TextDocument, symbol: vscode.DocumentSymbol): vscode.Range | undefined {
        let lineIndex = symbol.range.start.line - 1;
        
        while (lineIndex >= 0) {
            const line = document.lineAt(lineIndex);
            if (!line.isEmptyOrWhitespace && !line.text.trim().startsWith('@')) {
                break;
            }
            if (line.text.trim().startsWith('@')) {
                lineIndex--;
                continue;
            }
            lineIndex--;
        }

        if (lineIndex < 0) return undefined;

        const endLine = document.lineAt(lineIndex);
        const endText = endLine.text.trim();

        const isPython = document.languageId === 'python';
        const closeToken = isPython ? '"""' : '*/';
        const openToken = isPython ? '"""' : '/**';

        if (!endText.endsWith(closeToken)) return undefined;

        let startLineIndex = lineIndex;
        let foundStart = false;

        while (startLineIndex >= 0) {
            const line = document.lineAt(startLineIndex);
            const text = line.text.trim();
            
            if (text.startsWith(openToken)) {
                if (startLineIndex === lineIndex && text === closeToken) {
                    startLineIndex--;
                    continue;
                }
                foundStart = true;
                break;
            }

            startLineIndex--;
        }

        if (foundStart) {
            return new vscode.Range(
                startLineIndex, 
                0, 
                lineIndex, 
                document.lineAt(lineIndex).text.length
            );
        }

        return undefined;
    }

    static hasDocString(document: vscode.TextDocument, symbol: vscode.DocumentSymbol): boolean {
        return !!this.getDocStringRange(document, symbol);
    }
}
