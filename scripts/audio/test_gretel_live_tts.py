"""Boundary tests: fake waveform tests protocol, NOT Gretel's speaker fidelity."""
import io
import json
import threading
import unittest
import urllib.error
import urllib.request
import wave
import numpy as np
from gretel_live_tts import create_server


class LiveTTSTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.seen = []
        def fake_synth(text):
            cls.seen.append(text)
            return 24000, np.zeros(4800, dtype=np.float32)
        cls.server = create_server("127.0.0.1", 0, fake_synth, allowed_origin="http://localhost:5173")
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = "http://127.0.0.1:" + str(cls.server.server_port) + "/api/gretel/tts"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def call(self, text, origin="http://localhost:5173"):
        data = json.dumps({"text": text}).encode()
        req = urllib.request.Request(self.url, data, headers={"Content-Type": "application/json", "Origin": origin}, method="POST")
        return urllib.request.urlopen(req)

    def test_new_spanish_text_is_passed_unmodified_to_synth(self):
        text = "Mañana el pingüino leerá un cuento extraordinario."
        with self.call(text) as response:
            self.assertEqual(response.headers.get_content_type(), "audio/wav")
            audio = io.BytesIO(response.read())
            with wave.open(audio, "rb") as f:
                self.assertEqual(f.getframerate(), 24000)
                self.assertEqual(f.getnchannels(), 1)
        self.assertEqual(self.seen[-1], text)

    def test_rejects_unauthorized_web_origin(self):
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            self.call("Una oración.", origin="https://unexpected.example")
        self.assertEqual(ctx.exception.code, 403)

    def test_rejects_empty_or_oversized_text(self):
        for text in ["", "ñ" * 321]:
            with self.assertRaises(urllib.error.HTTPError) as ctx:
                self.call(text)
            self.assertEqual(ctx.exception.code, 400)

    def test_rejects_wrong_path(self):
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(urllib.request.Request(
                self.url.replace("/tts", "/wrong"), data=b"{}", headers={"Origin": "http://localhost:5173"}, method="POST"))
        self.assertEqual(ctx.exception.code, 404)


if __name__ == "__main__":
    unittest.main()
