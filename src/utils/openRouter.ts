import * as https from 'https';
import { ConfigService } from '../config';

interface OpenRouterResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

export class OpenRouterClient {
    static async generateCompletion(prompt: string): Promise<string> {
        const apiKey = await ConfigService.getApiKey();
        const model = ConfigService.model;

        if (!apiKey) {
            throw new Error('OpenRouter API Key is missing in settings.');
        }

        const data = JSON.stringify({
            model: model,
            messages: [
                {
                    role: "system",
                    content: "You are an expert code documenter. Return ONLY the docstring for the code provided. Do not include markdown code blocks (```), do not include the function signature, and do not include any conversational text. Just the raw docstring content formatted for the specific language. If the code is simple you may return an example of an input and output within the docstring."
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

        const options = {
            hostname: 'openrouter.ai',
            path: '/api/v1/chat/completions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'HTTP-Referer': 'https://github.com/michaelgathara/autodoc', 
                'X-Title': 'AutoDoc Generator'
            }
        };

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let body = '';

                res.on('data', (chunk: string) => {
                    body += chunk;
                });

                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const response: OpenRouterResponse = JSON.parse(body);
                            const content = response.choices[0]?.message?.content || '';
                            resolve(content.trim());
                        } catch (e) {
                            reject(new Error('Failed to parse OpenRouter response.'));
                        }
                    } else {
                        reject(new Error(`OpenRouter API Error: ${res.statusCode} ${body}`));
                    }
                });
            });

            req.on('error', (error: Error) => {
                reject(error);
            });

            req.write(data);
            req.end();
        });
    }
}

