//! In-Memory Microphone Capture & 16 kHz PCM Pipeline
//!
//! Privacy Guarantee: Audio is kept exclusively in memory ring buffers and never written to disk.

use std::io::Cursor;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use anyhow::{anyhow, Result};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use parking_lot::Mutex;

pub const TARGET_SAMPLE_RATE: u32 = 16_000;
pub const TARGET_CHANNELS: u16 = 1;

/// In-memory audio buffer accumulator.
#[derive(Clone, Default)]
pub struct AudioBuffer {
    samples: Arc<Mutex<Vec<i16>>>,
}

impl AudioBuffer {
    pub fn new() -> Self {
        Self {
            samples: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn append(&self, chunk: &[i16]) {
        self.samples.lock().extend_from_slice(chunk);
    }

    pub fn clear(&self) {
        self.samples.lock().clear();
    }

    pub fn get_samples(&self) -> Vec<i16> {
        self.samples.lock().clone()
    }

    /// Encodes accumulated 16 kHz mono i16 samples directly into in-memory WAV format.
    pub fn to_wav_bytes(&self) -> Result<Vec<u8>> {
        let samples = self.samples.lock();
        if samples.is_empty() {
            return Err(anyhow!("No audio samples captured in buffer"));
        }

        let spec = hound::WavSpec {
            channels: TARGET_CHANNELS,
            sample_rate: TARGET_SAMPLE_RATE,
            bits_per_sample: 16,
            sample_format: hound::SampleFormat::Int,
        };

        let mut cursor = Cursor::new(Vec::new());
        {
            let mut writer = hound::WavWriter::new(&mut cursor, spec)?;
            for &sample in samples.iter() {
                writer.write_sample(sample)?;
            }
            writer.finalize()?;
        }

        Ok(cursor.into_inner())
    }
}

/// Compute root-mean-square (RMS) energy normalized between 0.0 and 1.0.
pub fn calculate_rms_level(samples: &[i16]) -> f32 {
    if samples.is_empty() {
        return 0.0;
    }

    let mut sum_sq = 0.0f64;
    for &s in samples {
        let norm = (s as f64) / 32768.0;
        sum_sq += norm * norm;
    }

    let rms = (sum_sq / (samples.len() as f64)).sqrt() as f32;
    // Map RMS logarithmically or clamp to [0.0, 1.0]
    (rms * 4.0).clamp(0.0, 1.0)
}

/// Active microphone recording controller.
pub struct AudioRecorder {
    is_recording: Arc<AtomicBool>,
    buffer: AudioBuffer,
    stream: Option<cpal::Stream>,
}

impl AudioRecorder {
    pub fn new() -> Self {
        Self {
            is_recording: Arc::new(AtomicBool::new(false)),
            buffer: AudioBuffer::new(),
            stream: None,
        }
    }

    pub fn is_active(&self) -> bool {
        self.is_recording.load(Ordering::Relaxed)
    }

    /// Starts recording from system default input device.
    pub fn start<F>(&mut self, on_energy: F) -> Result<()>
    where
        F: Fn(f32) + Send + Sync + 'static,
    {
        if self.is_active() {
            return Ok(());
        }

        self.buffer.clear();
        self.is_recording.store(true, Ordering::SeqCst);

        let host = cpal::default_host();
        let device = host
            .default_input_device()
            .ok_or_else(|| anyhow!("No default microphone input device detected"))?;

        let config = device.default_input_config()?;
        let sample_rate = config.sample_rate().0;
        let channels = config.channels();

        let buffer_clone = self.buffer.clone();
        let is_recording_clone = self.is_recording.clone();

        let err_fn = |err| tracing::error!("An error occurred on mic audio stream: {}", err);

        let stream = match config.sample_format() {
            cpal::SampleFormat::I16 => device.build_input_stream(
                &config.into(),
                move |data: &[i16], _: &cpal::InputCallbackInfo| {
                    if !is_recording_clone.load(Ordering::Relaxed) {
                        return;
                    }
                    let mono_16k = downmix_and_resample_i16(data, channels, sample_rate, TARGET_SAMPLE_RATE);
                    let level = calculate_rms_level(&mono_16k);
                    on_energy(level);
                    buffer_clone.append(&mono_16k);
                },
                err_fn,
                None,
            )?,
            cpal::SampleFormat::F32 => device.build_input_stream(
                &config.into(),
                move |data: &[f32], _: &cpal::InputCallbackInfo| {
                    if !is_recording_clone.load(Ordering::Relaxed) {
                        return;
                    }
                    let mono_i16: Vec<i16> = data
                        .iter()
                        .map(|&s| (s.clamp(-1.0, 1.0) * 32767.0) as i16)
                        .collect();
                    let mono_16k = downmix_and_resample_i16(&mono_i16, channels, sample_rate, TARGET_SAMPLE_RATE);
                    let level = calculate_rms_level(&mono_16k);
                    on_energy(level);
                    buffer_clone.append(&mono_16k);
                },
                err_fn,
                None,
            )?,
            _ => return Err(anyhow!("Unsupported sample format for microphone capture")),
        };

        stream.play()?;
        self.stream = Some(stream);

        Ok(())
    }

    /// Stops recording and returns the in-memory WAV byte stream.
    pub fn stop(&mut self) -> Result<Vec<u8>> {
        self.is_recording.store(false, Ordering::SeqCst);
        if let Some(stream) = self.stream.take() {
            drop(stream);
        }
        self.buffer.to_wav_bytes()
    }
}

/// Simple downmixing & linear interpolation resampler for voice audio.
pub fn downmix_and_resample_i16(
    input: &[i16],
    channels: u16,
    input_sample_rate: u32,
    target_sample_rate: u32,
) -> Vec<i16> {
    if input.is_empty() {
        return Vec::new();
    }

    // 1. Downmix multi-channel to mono
    let mono: Vec<i16> = if channels > 1 {
        let ch = channels as usize;
        input
            .chunks_exact(ch)
            .map(|frame| {
                let sum: i32 = frame.iter().map(|&s| s as i32).sum();
                (sum / (ch as i32)) as i16
            })
            .collect()
    } else {
        input.to_vec()
    };

    if input_sample_rate == target_sample_rate {
        return mono;
    }

    // 2. Resample to 16 kHz using linear interpolation
    let ratio = (input_sample_rate as f64) / (target_sample_rate as f64);
    let output_len = ((mono.len() as f64) / ratio).floor() as usize;
    let mut output = Vec::with_capacity(output_len);

    for i in 0..output_len {
        let src_idx = (i as f64) * ratio;
        let idx0 = src_idx.floor() as usize;
        let frac = src_idx - (idx0 as f64);

        if idx0 + 1 < mono.len() {
            let s0 = mono[idx0] as f64;
            let s1 = mono[idx0 + 1] as f64;
            let interpolated = s0 + frac * (s1 - s0);
            output.push(interpolated as i16);
        } else if idx0 < mono.len() {
            output.push(mono[idx0]);
        }
    }

    output
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rms_level_calculation() {
        // Zero samples
        assert_eq!(calculate_rms_level(&[]), 0.0);

        // Silence (zeros)
        let silence = vec![0i16; 1600];
        assert_eq!(calculate_rms_level(&silence), 0.0);

        // Loud signal
        let loud = vec![30000i16; 1600];
        let level = calculate_rms_level(&loud);
        assert!(level > 0.8 && level <= 1.0);
    }

    #[test]
    fn test_wav_in_memory_encoding() {
        let buffer = AudioBuffer::new();
        let samples: Vec<i16> = (0..16000)
            .map(|i| ((i as f32 * 0.1).sin() * 15000.0) as i16)
            .collect();

        buffer.append(&samples);
        let wav_bytes = buffer.to_wav_bytes().expect("WAV encoding failed");

        // Verify standard WAV header
        assert!(wav_bytes.len() > 44);
        assert_eq!(&wav_bytes[0..4], b"RIFF");
        assert_eq!(&wav_bytes[8..12], b"WAVE");
    }

    #[test]
    fn test_downmix_and_resampling() {
        // Stereo 48 kHz to Mono 16 kHz
        let input_sample_rate = 48000;
        let channels = 2;
        let stereo_samples = vec![1000i16, 2000i16, 3000i16, 4000i16, 5000i16, 6000i16];
        let resampled = downmix_and_resample_i16(&stereo_samples, channels, input_sample_rate, 16000);

        // 3 frames downmixed to 3 samples -> 3 / (48000 / 16000) = 1 sample
        assert_eq!(resampled.len(), 1);
        assert_eq!(resampled[0], 1500); // (1000 + 2000) / 2
    }
}
