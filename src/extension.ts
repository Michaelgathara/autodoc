import * as vscode from 'vscode';
import { AutoDocController } from './controller';
import { ConfigService } from './config';

export function activate(context: vscode.ExtensionContext) {
    ConfigService.initialize(context);

    const setKeyCommand = vscode.commands.registerCommand('autodoc.setApiKey', async () => {
        const key = await vscode.window.showInputBox({
            placeHolder: 'Enter your OpenRouter API Key',
            password: true,
            ignoreFocusOut: true
        });

        if (key) {
            await context.secrets.store('autodoc.apiKey', key);
            vscode.window.showInformationMessage('AutoDoc API Key saved successfully.');
        }
    });

    context.subscriptions.push(setKeyCommand);

    const controller = new AutoDocController();
    context.subscriptions.push(controller);
}

export function deactivate() {}

