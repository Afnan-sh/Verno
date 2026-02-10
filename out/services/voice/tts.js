"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.speak = speak;
async function speak(text, voice, speed) {
    try {
        // Dynamic require to avoid hard dependency
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const say = require('say');
        return new Promise((resolve, reject) => {
            say.speak(text, voice || undefined, speed || 1.0, (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
    catch (err) {
        // Fallback: log and no-op
        console.warn('TTS provider not available (say). Message:', text);
        return Promise.resolve();
    }
}
//# sourceMappingURL=tts.js.map