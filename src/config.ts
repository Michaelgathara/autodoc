import * as vscode from 'vscode';

export class ConfigService {
    private static _secrets: vscode.SecretStorage;

    static initialize(context: vscode.ExtensionContext) {
        this._secrets = context.secrets;
    }

    static async getApiKey(): Promise<string | undefined> {
        return await this._secrets.get('autodoc.apiKey');
    }

    static get model(): string {
        return vscode.workspace.getConfiguration('autodoc').get('model') || 'openai/gpt-4o';
    }

    static get enable(): boolean {
        return vscode.workspace.getConfiguration('autodoc').get('enable') || false;
    }
}

