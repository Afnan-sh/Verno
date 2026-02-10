"use strict";
/**
 * Google Gemini LLM provider implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
class GeminiProvider {
    apiKey = '';
    model = 'gemini-2.0-flash';
    apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    async initialize(apiKey) {
        if (!apiKey || apiKey.trim().length === 0) {
            throw new Error('Gemini API key cannot be empty');
        }
        // Validate API key format (should start with AIza for Gemini)
        if (!apiKey.startsWith('AIza')) {
            throw new Error('Invalid Gemini API key format. Expected key starting with "AIza"');
        }
        this.apiKey = apiKey.trim();
    }
    async generateText(prompt, options) {
        if (!this.apiKey) {
            throw new Error('Gemini API key not set');
        }
        try {
            const url = `${this.apiEndpoint}?key=${this.apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: options?.temperature || 0.7,
                        maxOutputTokens: options?.maxTokens || 2000,
                        topP: 0.95,
                        topK: 40
                    }
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
            }
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
        catch (error) {
            throw error;
        }
    }
    getModelInfo() {
        return {
            provider: 'Gemini',
            model: this.model,
            endpoint: this.apiEndpoint
        };
    }
    async transcribeAudio(base64Audio) {
        if (!this.apiKey) {
            throw new Error('Gemini API key not set');
        }
        try {
            const url = `${this.apiEndpoint}?key=${this.apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: "Please transcribe the following audio file exactly as spoken. Do not add any introductory or concluding text, just the transcription."
                                },
                                {
                                    inlineData: {
                                        mimeType: "audio/wav",
                                        data: base64Audio
                                    }
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.2, // Low temperature for accuracy
                        maxOutputTokens: 2000
                    }
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Gemini Audio Transcription error: ${errorData.error?.message || response.statusText}`);
            }
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
        catch (error) {
            console.error('[GeminiProvider] Transcribe error:', error);
            throw error;
        }
    }
}
exports.GeminiProvider = GeminiProvider;
//# sourceMappingURL=GeminiProvider.js.map