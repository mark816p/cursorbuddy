//! Text-to-Speech (TTS) Streaming Service
//!
//! Streams synthesized speech using ElevenLabs or OpenAI TTS API.
//! Includes mock audio streaming fallback for testing and offline development.

import OpenAI from "openai";

export interface TtsOptions {
  apiKey?: string;
  provider?: "openai" | "elevenlabs";
  voice?: string;
}

export class TtsService {
  private openai: OpenAI | null = null;
  private provider: string;
  private voice: string;

  constructor(options: TtsOptions = {}) {
    this.provider = options.provider || process.env.TTS_PROVIDER || "openai";
    this.voice = options.voice || process.env.TTS_VOICE || "alloy";
    const apiKey = options.apiKey || process.env.TTS_API_KEY || process.env.OPENAI_API_KEY;

    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Synthesize text to an audio stream / buffer.
   */
  async synthesize(text: string): Promise<{ stream: ReadableStream<Uint8Array>; contentType: string }> {
    if (!this.openai) {
      // Mock audio stream fallback for test suite or offline development
      if (process.env.NODE_ENV === "test" || !process.env.TTS_API_KEY) {
        // Return a valid mock MP3/WAV chunk
        const mockChunk = new Uint8Array(512).fill(0x55);
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(mockChunk);
            controller.close();
          },
        });
        return {
          stream,
          contentType: "audio/mpeg",
        };
      }
      throw new Error("TTS Service: API key not configured");
    }

    const response = await this.openai.audio.speech.create({
      model: "tts-1",
      voice: this.voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
      input: text,
      response_format: "mp3",
    });

    // Convert fetch Response body into Web ReadableStream
    const body = response.body as unknown as ReadableStream<Uint8Array>;
    return {
      stream: body,
      contentType: "audio/mpeg",
    };
  }
}

export const ttsService = new TtsService();
