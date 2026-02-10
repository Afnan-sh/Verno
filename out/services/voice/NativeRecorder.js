"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NativeRecorder = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const VoiceRecorder_1 = require("./VoiceRecorder");
class NativeRecorder extends VoiceRecorder_1.VoiceRecorder {
    recorder = null;
    recordingFile = null;
    writeStream = null;
    audioChunks = [];
    constructor() {
        super();
    }
    async startRecording() {
        try {
            const record = require('node-record-lpcm16');
            this.recordingFile = path.join(process.env.TEMP || '/tmp', `recording-${Date.now()}.wav`);
            this.recorder = record.record({
                sampleRate: 16000,
                channels: 1,
                audioType: 'wav',
            });
            this.writeStream = fs.createWriteStream(this.recordingFile);
            const audioStream = this.recorder.stream();
            audioStream.on('data', (chunk) => {
                this.audioChunks.push(chunk);
                this.writeStream?.write(chunk);
            });
            audioStream.on('error', (error) => {
                console.error('Recording error:', error);
                this.isRecordingFlag = false;
            });
            this.isRecordingFlag = true;
        }
        catch (error) {
            console.error('Failed to start recording:', error);
            this.isRecordingFlag = false;
            throw error;
        }
    }
    async stopRecording() {
        try {
            this.isRecordingFlag = false;
            if (!this.recorder) {
                return new Blob([], { type: 'audio/wav' });
            }
            this.recorder.stop();
            await new Promise((resolve) => {
                if (this.writeStream) {
                    this.writeStream.on('finish', () => {
                        resolve();
                    });
                    this.writeStream.end();
                }
                else {
                    resolve();
                }
            });
            const audioBuffer = Buffer.concat(this.audioChunks);
            const blob = new Blob([audioBuffer], { type: 'audio/wav' });
            this.cleanup();
            return blob;
        }
        catch (error) {
            console.error('Failed to stop recording:', error);
            this.cleanup();
            return new Blob([], { type: 'audio/wav' });
        }
    }
    cleanup() {
        this.recorder = null;
        this.writeStream = null;
        this.audioChunks = [];
        if (this.recordingFile && fs.existsSync(this.recordingFile)) {
            fs.unlink(this.recordingFile, (error) => {
                if (error) {
                    console.warn('Failed to delete temporary recording file:', error);
                }
            });
        }
        this.recordingFile = null;
    }
}
exports.NativeRecorder = NativeRecorder;
//# sourceMappingURL=NativeRecorder.js.map