import * as vscode from 'vscode';
import { AutoDocController } from './controller';

export function activate(context: vscode.ExtensionContext) {
    const controller = new AutoDocController();
    context.subscriptions.push(controller);
}

export function deactivate() {}

