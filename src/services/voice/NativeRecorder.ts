/**
 * Native Node.js voice recording implementation
 */

import { VoiceRecorder } from './VoiceRecorder';

export class NativeRecorder extends VoiceRecorder {
  // TODO: Implement native recording using node modules like 'recorder' or 'sox'

  async startRecording(): Promise<void> {
    this.isRecordingFlag = true;
    // TODO: Initialize native recording
  }

  async stopRecording(): Promise<Blob> {
    this.isRecordingFlag = false;
    // TODO: Stop recording and return audio blob
    return new Blob([], { type: 'audio/wav' });
  }
}
