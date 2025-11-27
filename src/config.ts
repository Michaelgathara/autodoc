import * as vscode from 'vscode';

export class ConfigService {
    static get apiKey(): string | undefined {
        return vscode.workspace.getConfiguration('autodoc').get('apiKey');
    }

    static get model(): string {
        return vscode.workspace.getConfiguration('autodoc').get('model') || 'openai/gpt-4o';
    }

    static get enable(): boolean {
        return vscode.workspace.getConfiguration('autodoc').get('enable') || false;
    }
}

