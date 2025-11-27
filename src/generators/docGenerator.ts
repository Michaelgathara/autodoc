import * as vscode from 'vscode';
import { OpenRouterClient } from '../utils/openRouter';

export class DocGenerator {
    static async generate(document: vscode.TextDocument, symbol: vscode.DocumentSymbol): Promise<string | null> {
        const functionRange = new vscode.Range(symbol.range.start, symbol.range.end);
        const functionCode = document.getText(functionRange);
        
        const languageId = document.languageId;
        const prompt = `Generate a docstring for this ${languageId} function:\n\n${functionCode}\n\nFormat: Return only the docstring block.`;

        try {
            const docString = await OpenRouterClient.generateCompletion(prompt);
            
            const indent = ' '.repeat(symbol.range.start.character);
            const indentedDocString = docString.split('\n').map((line, index) => {
                if (index === 0) return line;
                return indent + line;
            }).join('\n');

            return indentedDocString + '\n' + indent;
        } catch (error) {
            console.error('AutoDoc Gen Error:', error);
            // Fallback or silent fail?
            // For now, let's just show an error message if it's an explicit trigger
            return null;
        }
    }
}
