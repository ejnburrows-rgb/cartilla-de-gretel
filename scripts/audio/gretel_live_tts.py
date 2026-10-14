#!/usr/bin/env python3
"""Private local dynamic Gretel speech engine, reusing the repo's Chatterbox loader.

This is an inference endpoint, not a model trainer or voice-fidelity test.
The owner's source audio stays outside the public repository and browser.
Never expose this unauthenticated development server directly to the Internet.
"""
from __future__ import annotations

import argparse
import io
import json
import threading
import wave
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Callable

import numpy as np

Synthesize = Callable[[str], tuple[int, np.ndarray]]
MAX_TEXT_CHARS = 320
MAX_BODY_BYTES = 4096


def to_wav_bytes(sample_rate: int, waveform: np.ndarray) -> bytes:
    sound = np.asarray(waveform, dtype=np.float32).squeeze()
    if sample_rate < 8000 or sample_rate > 96000 or sound.ndim != 1 or len(sound) == 0:
        raise ValueError("Invalid speech waveform")
    if not np.all(np.isfinite(sound)):
        raise ValueError("Nonfinite speech waveform")
    raw = (np.clip(sound, -1, 1) * 32767).astype("<i2")
    out = io.BytesIO()
    with wave.open(out, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(raw.tobytes())
    return out.getvalue()


def create_server(host: str, port: int, synthesize: Synthesize, *, allowed_origin: str) -> ThreadingHTTPServer:
    """Injectable synthesizer permits testing without downloading model weights."""
    engine_lock = threading.Lock()

    class Handler(BaseHTTPRequestHandler):
        def respond(self, code: int, data: bytes, kind: str = "application/json") -> None:
            self.send_response(code)
            self.send_header("Content-Type", kind)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            if self.headers.get("Origin") == allowed_origin:
                self.send_header("Access-Control-Allow-Origin", allowed_origin)
                self.send_header("Vary", "Origin")
            self.end_headers()
            self.wfile.write(data)

        def do_OPTIONS(self) -> None:
            if self.path != "/api/gretel/tts":
                self.respond(404, b'{}')
                return
            if self.headers.get("Origin") != allowed_origin:
                self.respond(403, b'{}')
                return
            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", allowed_origin)
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Access-Control-Max-Age", "600")
            self.end_headers()

        def do_POST(self) -> None:
            if self.path != "/api/gretel/tts":
                self.respond(404, b'{"error":"not_found"}')
                return
            if self.headers.get("Origin") not in (None, allowed_origin):
                self.respond(403, b'{"error":"origin_not_allowed"}')
                return
            if self.headers.get_content_type() != "application/json":
                self.respond(415, b'{"error":"json_required"}')
                return
            try:
                length = int(self.headers.get("Content-Length", "0"))
                if not 1 <= length <= MAX_BODY_BYTES:
                    raise ValueError("invalid body length")
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
                text = payload.get("text") if isinstance(payload, dict) else None
                if not isinstance(text, str) or not 1 <= len(text.strip()) <= MAX_TEXT_CHARS:
                    raise ValueError("invalid text")
            except (ValueError, UnicodeError, json.JSONDecodeError):
                self.respond(400, b'{"error":"invalid_text"}')
                return
            try:
                with engine_lock:
                    sample_rate, signal = synthesize(text.strip())
                audio = to_wav_bytes(sample_rate, signal)
            except Exception:
                self.respond(503, b'{"error":"tts_unavailable"}')
                return
            self.respond(200, audio, "audio/wav")

    return ThreadingHTTPServer((host, port), Handler)


def main() -> None:
    parser = argparse.ArgumentParser(description="Private Gretel dynamic Spanish TTS test server")
    parser.add_argument("--reference", type=Path, required=True, help="Private WAV voice reference, never public")
    parser.add_argument("--device", choices=("cpu", "cuda"), default="cpu")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--allowed-origin", default="http://localhost:5173")
    args = parser.parse_args()
    if not args.reference.is_file():
        parser.error("Private voice reference not found")
    from generate_gretel import load_chatterbox
    synthesizer = load_chatterbox(args.reference, args.device)
    server = create_server(args.host, args.port, synthesizer, allowed_origin=args.allowed_origin)
    try:
        print("Gretel speech server listening on " + args.host + ":" + str(server.server_port), flush=True)
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
