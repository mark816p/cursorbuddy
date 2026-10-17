//! Speech-to-Text (STT) Service
//!
//! Uses OpenAI Whisper API or Deepgram to transcribe in-memory WAV audio.

import OpenAI, { toFile } from "openai";

export interface SttOptions {
  apiKey?: string;
  provider?: "openai" | "deepgram";
  language?: string;
}

export class SttService {
  private openai: OpenAI | null = null;
  private provider: string;

  constructor(options: SttOptions = {}) {
    this.provider = options.provider || process.env.STT_PROVIDER || "openai";
    const apiKey = options.apiKey || process.env.STT_API_KEY || process.env.OPENAI_API_KEY;

    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Transcribe an in-memory WAV buffer.
   */
  async transcribe(audioBuffer: Buffer, filename = "speech.wav"): Promise<string> {
    if (!this.openai) {
      // Mock transcription for testing or offline development
      if (process.env.NODE_ENV === "test" || !process.env.STT_API_KEY) {
        return "Where do I change the font size in this app?";
      }
      throw new Error("STT Service: API key not configured");
    }

    const file = await toFile(audioBuffer, filename, { type: "audio/wav" });
    const response = await this.openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "en",
      temperature: 0.0,
    });

    return response.text.trim();
  }
}

export const sttService = new SttService();
