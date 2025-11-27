# AutoDoc Generator

AutoDoc Generator is a VSCode extension that uses AI to automatically generate documentation for your functions as you write them. It detects when you pause typing, analyzes your code, and inserts meaningful docstrings using the latest LLMs via OpenRouter.

## Features

- **AI-Powered Documentation**: Uses OpenRouter to access models like GPT-4o, Claude 3.5 Sonnet, and others to generate context-aware docstrings.
- **Automatic Detection**: Intelligently detects new functions and methods as you write them.
- **Language Support**: Works out of the box with TypeScript, JavaScript, and Python.
- **Configurable**: Choose your preferred AI model and manage your API keys securely in VSCode settings.
- **Non-Intrusive**: Runs in the background and only activates when you pause typing to avoid interrupting your flow.

## Requirements

You must have an **OpenRouter API Key** to use this extension.

1.  Sign up at [OpenRouter.ai](https://openrouter.ai).
2.  Create an API Key.
3.  Add it to the extension settings.

## Extension Settings

This extension contributes the following settings:

*   `autodoc.apiKey`: Your OpenRouter API Key. (Required)
*   `autodoc.model`: The AI model to use for generation. Defaults to `openai/gpt-4o`.
*   `autodoc.enable`: Enable/Disable the automatic generation feature.

## Usage

1.  Open a supported file (TypeScript, JavaScript, Python).
2.  Write a function.
3.  Pause for a moment (default 1.5s).
4.  The extension will automatically insert a docstring above your function.

Alternatively, you can manually trigger generation:
*   Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
*   Run `AutoDoc: Generate Docs`

## Known Issues

- Rate limiting may occur depending on your OpenRouter plan.
- Very large files may take longer to process as the extension analyzes document symbols.


