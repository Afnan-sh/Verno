"use strict";
/**
 * Groq LLM provider implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqProvider = void 0;
class GroqProvider {
    apiKey = '';
    model = 'allam-2-7b';
    apiEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
    async initialize(apiKey) {
        if (!apiKey || apiKey.trim().length === 0) {
            throw new Error('Groq API key cannot be empty');
        }
        this.apiKey = apiKey.trim();
    }
    async generateText(prompt, options) {
        if (!this.apiKey) {
            throw new Error('Groq API key not set');
        }
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    model: this.model,
                    temperature: options?.temperature || 0.7,
                    max_tokens: options?.maxTokens || 2000,
                    top_p: 0.95
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`);
            }
            const data = await response.json();
            return data.choices?.[0]?.message?.content || '';
        }
        catch (error) {
            throw error;
        }
    }
    getModelInfo() {
        return {
            provider: 'Groq',
            model: this.model,
            endpoint: this.apiEndpoint
        };
    }
    async transcribeAudio(base64Audio) {
        if (!this.apiKey) {
            throw new Error('Groq API key not set');
        }
        try {
            // 1. Convert base64 to Buffer
            const buffer = Buffer.from(base64Audio, 'base64');
            const boundary = '----GroqFormBoundary' + Math.random().toString(36).substring(2);
            // Construct the multipart body manually
            const parts = [
                `--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-large-v3\r\n`,
                `--${boundary}\r\nContent-Disposition: form-data; name="temperature"\r\n\r\n0\r\n`,
                `--${boundary}\r\nContent-Disposition: form-data; name="response_format"\r\n\r\njson\r\n`,
                `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="recording.wav"\r\nContent-Type: audio/wav\r\n\r\n`
            ];
            // Combine parts and file buffer
            const paramBuffer = Buffer.concat([
                Buffer.from(parts.join('')),
                buffer,
                Buffer.from(`\r\n--${boundary}--`)
            ]);
            console.log(`[GroqProvider] Sending audio to Groq API... (Size: ${paramBuffer.length} bytes)`);
            const headers = {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': paramBuffer.length.toString()
            };
            const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: headers,
                body: paramBuffer
            });
            if (!response.ok) {
                const errorText = await response.text();
                let errorMsg = `Groq Audio API error: ${response.status} ${response.statusText}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.error?.message)
                        errorMsg += ` - ${errorJson.error.message}`;
                }
                catch (e) {
                    errorMsg += ` - ${errorText}`;
                }
                console.error('[GroqProvider]', errorMsg);
                throw new Error(errorMsg);
            }
            const data = await response.json();
            console.log(`[GroqProvider] Transcription received: "${data.text?.substring(0, 50)}..."`);
            return data.text || '';
        }
        catch (error) {
            console.error('[GroqProvider] Transcribe error:', error);
            throw error;
        }
    }
}
exports.GroqProvider = GroqProvider;
//# sourceMappingURL=GroqProvider.js.map