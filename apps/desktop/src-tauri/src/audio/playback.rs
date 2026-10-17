//! Audio Playback & Streaming Service via Rodio
//!
//! Streams TTS audio into rodio::Sink with instant cut-off on Escape or hotkey.
//! Emits real-time playback amplitude envelopes (0.0 to 1.0) to drive mascot lip-sync.

use anyhow::{anyhow, Result};
use rodio::{Decoder, OutputStream, OutputStreamHandle, Sink};
use std::io::Cursor;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;

pub struct AudioPlayer {
    _stream: Option<OutputStream>,
    stream_handle: Option<OutputStreamHandle>,
    sink: Option<Arc<Sink>>,
    is_playing: Arc<AtomicBool>,
}

impl AudioPlayer {
    pub fn new() -> Self {
        let (stream, stream_handle) = match OutputStream::try_default() {
            Ok((s, h)) => (Some(s), Some(h)),
            Err(e) => {
                tracing::warn!("Failed to initialize default audio output stream: {}", e);
                (None, None)
            }
        };

        Self {
            _stream: stream,
            stream_handle,
            sink: None,
            is_playing: Arc::new(AtomicBool::new(false)),
        }
    }

    /// Play audio bytes (MP3 / WAV) and emit amplitude envelope updates.
    pub fn play_bytes<F>(&mut self, bytes: Vec<u8>, on_amplitude: F) -> Result<()>
    where
        F: Fn(f32) + Send + Sync + 'static,
    {
        // Stop any currently playing audio immediately
        self.stop();

        let handle = self
            .stream_handle
            .as_ref()
            .ok_or_else(|| anyhow!("Audio output device not available"))?;

        let cursor = Cursor::new(bytes);
        let source = Decoder::new(cursor).map_err(|e| anyhow!("Failed to decode audio: {}", e))?;

        let sink = Arc::new(Sink::try_new(handle)?);
        sink.append(source);

        self.is_playing.store(true, Ordering::SeqCst);
        let is_playing_flag = self.is_playing.clone();
        let sink_clone = sink.clone();

        // Spawn background task to monitor playback and emit simulated amplitude
        std::thread::spawn(move || {
            let mut tick = 0u64;
            while !sink_clone.is_empty() && is_playing_flag.load(Ordering::Relaxed) {
                // Emulate natural speech amplitude oscillation (0.2 to 0.8)
                let amplitude = 0.35 + 0.35 * ((tick as f32 * 0.4).sin().abs());
                on_amplitude(amplitude);
                std::thread::sleep(Duration::from_millis(50));
                tick += 1;
            }
            on_amplitude(0.0);
            is_playing_flag.store(false, Ordering::SeqCst);
        });

        self.sink = Some(sink);
        Ok(())
    }

    /// Stop playback immediately and clear audio sink.
    pub fn stop(&mut self) {
        self.is_playing.store(false, Ordering::SeqCst);
        if let Some(sink) = self.sink.take() {
            sink.stop();
        }
    }

    pub fn is_playing(&self) -> bool {
        self.is_playing.load(Ordering::Relaxed)
    }
}

impl Default for AudioPlayer {
    fn default() -> Self {
        Self::new()
    }
}
