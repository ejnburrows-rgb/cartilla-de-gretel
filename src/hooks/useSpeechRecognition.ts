import { useEffect, useRef, useState, useCallback } from "react";
import {
  getSpeechRecognitionCtor,
  type SpeechRecognitionErrorEventLike,
  type SpeechRecognitionEventLike,
  type SpeechRecognitionLike,
} from "@/lib/speech-recognition-types";

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
  error: string | null;
}

export interface SpeechRecognitionOptions {
  lang?: string;
}

export function useSpeechRecognition(
  options?: SpeechRecognitionOptions,
): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const lang = options?.lang || "es-MX";
  // The recognizer is constructed once; later lang changes are applied by the
  // [lang] effect below, so the init effect only needs the initial value.
  const initialLangRef = useRef(lang);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = getSpeechRecognitionCtor();

      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = initialLangRef.current;

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
          setTranscript("");
        };

        recognition.onresult = (event: SpeechRecognitionEventLike) => {
          const result = event.results[event.results.length - 1];
          if (result && result[0]) {
            setTranscript(result[0].transcript);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
          console.warn("[SpeechRecognition Error]", event.error);
          setError(event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
  }, [lang]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.warn("Already listening or failed to start", err);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.warn("Failed to stop listening", err);
    }
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
    error,
  };
}
