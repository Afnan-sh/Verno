"use strict";
/**
 * Native Node.js voice recording implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NativeRecorder = void 0;
const VoiceRecorder_1 = require("./VoiceRecorder");
class NativeRecorder extends VoiceRecorder_1.VoiceRecorder {
    // TODO: Implement native recording using node modules like 'recorder' or 'sox'
    async startRecording() {
        this.isRecordingFlag = true;
        // TODO: Initialize native recording
    }
    async stopRecording() {
        this.isRecordingFlag = false;
        // TODO: Stop recording and return audio blob
        return new Blob([], { type: 'audio/wav' });
    }
}
exports.NativeRecorder = NativeRecorder;
//# sourceMappingURL=NativeRecorder.js.map