import { useCallback, useEffect, useRef, useState } from "react";

export type AudioRecorderError = "unsupported" | "denied" | "busy" | "empty" | "unknown";

type RecorderState = {
  isRecording: boolean;
  level: number;
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
  lastBlob: Blob | null;
  error: AudioRecorderError | null;
};

const MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm"];

function preferredMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

async function getMonoStream() {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: { ideal: 1 },
      sampleRate: { ideal: 16000 },
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });
}

export function useAudioRecorder(): RecorderState {
  const [isRecording, setIsRecording] = useState(false);
  const [level, setLevel] = useState(0);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<AudioRecorderError | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopMeter = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setLevel(0);
  }, []);

  const closeStream = useCallback(() => {
    stopMeter();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
    analyserRef.current = null;
  }, [stopMeter]);

  const tickLevel = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    let peak = 0;
    for (const value of data) peak = Math.max(peak, Math.abs(value - 128));
    setLevel(Math.min(1, peak / 128));
    rafRef.current = requestAnimationFrame(tickLevel);
  }, []);

  const start = useCallback(async () => {
    if (typeof window === "undefined" || !("MediaRecorder" in window) || !navigator.mediaDevices?.getUserMedia) {
      setError("unsupported");
      return;
    }
    if (recorderRef.current?.state === "recording") {
      setError("busy");
      return;
    }
    try {
      setError(null);
      chunksRef.current = [];
      const stream = await getMonoStream();
      streamRef.current = stream;
      const mimeType = preferredMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const audioContext = new AudioContextClass({ sampleRate: 16000 });
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        tickLevel();
      }

      recorder.start(250);
      setIsRecording(true);
    } catch (err) {
      closeStream();
      const name = err instanceof DOMException ? err.name : "";
      setError(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unknown");
    }
  }, [closeStream, tickLevel]);

  const stop = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return lastBlob;
    return new Promise<Blob | null>((resolve) => {
      recorder.onstop = () => {
        const type = recorder.mimeType || preferredMimeType() || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        closeStream();
        recorderRef.current = null;
        chunksRef.current = [];
        setIsRecording(false);
        if (blob.size === 0) {
          setError("empty");
          resolve(null);
          return;
        }
        setLastBlob(blob);
        resolve(blob);
      };
      recorder.stop();
    });
  }, [closeStream, lastBlob]);

  useEffect(() => closeStream, [closeStream]);

  return { isRecording, level, start, stop, lastBlob, error };
}
