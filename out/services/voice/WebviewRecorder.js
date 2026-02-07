"use strict";
/**
 * Browser-based voice recording implementation
 * This file is for webview rendering (browser environment)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebviewRecorder = void 0;
const VoiceRecorder_1 = require("./VoiceRecorder");
class WebviewRecorder extends VoiceRecorder_1.VoiceRecorder {
    mediaRecorder = null;
    audioChunks = [];
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new window.MediaRecorder(stream);
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            this.mediaRecorder.start();
            this.isRecordingFlag = true;
        }
        catch (error) {
            throw new Error(`Failed to start recording: ${error}`);
        }
    }
    async stopRecording() {
        if (!this.mediaRecorder) {
            throw new Error('No recording in progress');
        }
        return new Promise((resolve) => {
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                this.audioChunks = [];
                this.isRecordingFlag = false;
                resolve(audioBlob);
            };
            this.mediaRecorder.stop();
        });
    }
}
exports.WebviewRecorder = WebviewRecorder;
//# sourceMappingURL=WebviewRecorder.js.map