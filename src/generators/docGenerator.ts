import * as vscode from 'vscode';
import { OpenRouterClient } from '../utils/openRouter';

export class DocGenerator {
    static async generate(document: vscode.TextDocument, symbol: vscode.DocumentSymbol): Promise<string | null> {
        const functionRange = new vscode.Range(symbol.range.start, symbol.range.end);
        const functionCode = document.getText(functionRange);
        
        const languageId = document.languageId;
        const prompt = `
        Update or generate a docstring for this ${languageId} function.
        Code:
        ${functionCode}
        
        Instructions:
        - Return ONLY the docstring block (e.g., /** ... */ or """ ... """).
        - Do not include the function signature in the output.
        - Do not include markdown fences.
        - Use the standard style for ${languageId}.
        - Ensure indentation is consistent with the code provided.
        `;

        try {
            const docString = await OpenRouterClient.generateCompletion(prompt);
            
            const indent = ' '.repeat(symbol.range.start.character);
            const lines = docString.split('\n');
            
            const indentedLines = lines.map((line, index) => {
                if (index === 0) return line.trimStart(); 
                return indent + line.trimStart();
            });

            let finalString = indentedLines.join('\n');
            
            return finalString;
        } catch (error) {
            console.error('AutoDoc Gen Error:', error);
            return null;
        }
    }
}
