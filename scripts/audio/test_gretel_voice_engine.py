"""Contract tests use an injected fake model, never claim actual Gretel speech."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock
import numpy as np
from gretel_voice_engine import load_gretel_voice_model


class GretelEngineTests(unittest.TestCase):
    def test_uses_one_private_speaker_profile_for_new_spanish_sentences(self):
        with tempfile.TemporaryDirectory() as td:
            wav = Path(td) / "owner.wav"
            wav.write_bytes(b"RIFFexample")
            fake = Mock()
            fake.create_voice_clone_prompt.return_value = ["one-speaker-profile"]
            fake.generate_voice_clone.return_value = (
                [np.resize(np.array([.02, .1, -.04], dtype="float32"), 1024)],
                24000,
            )
            factory = Mock(return_value=fake)
            speak = load_gretel_voice_model(wav, device="cpu", model_factory=factory)
            self.assertEqual(factory.call_args.kwargs["device_map"], "cpu")
            self.assertEqual(factory.call_args.kwargs["attn_implementation"], "eager")
            fake.create_voice_clone_prompt.assert_called_once_with(
                ref_audio=str(wav), x_vector_only_mode=True
            )
            a_sr, a_audio = speak("Mañana el pingüino soñará con una montaña.")
            b_sr, b_audio = speak("La niña sonríe cuando lee la letra eñe.")
            self.assertEqual((a_sr, b_sr), (24000, 24000))
            self.assertEqual(fake.create_voice_clone_prompt.call_count, 1)
            self.assertEqual(fake.generate_voice_clone.call_count, 2)
            self.assertEqual(fake.generate_voice_clone.call_args.kwargs["language"], "Spanish")
            self.assertEqual(fake.generate_voice_clone.call_args.kwargs["voice_clone_prompt"],
                             ["one-speaker-profile"])
            self.assertEqual(len(a_audio), 1024)

    def test_missing_reference_is_not_silently_replaced(self):
        factory = Mock()
        with self.assertRaises(FileNotFoundError):
            load_gretel_voice_model(Path("/no/such/recording.wav"), model_factory=factory)
        factory.assert_not_called()

    def test_missing_weights_are_not_replaced_by_browser_or_prerecorded_audio(self):
        with tempfile.TemporaryDirectory() as td:
            wav = Path(td) / "owner.wav"
            wav.write_bytes(b"RIFFexample")
            factory = Mock(side_effect=RuntimeError("model weights unavailable"))
            with self.assertRaisesRegex(RuntimeError, "model weights unavailable"):
                load_gretel_voice_model(wav, model_factory=factory)

    def test_empty_text_and_silence_cannot_count_as_voice_proof(self):
        with tempfile.TemporaryDirectory() as td:
            wav = Path(td) / "owner.wav"
            wav.write_bytes(b"RIFFexample")
            fake = Mock()
            fake.create_voice_clone_prompt.return_value = ["speaker"]
            fake.generate_voice_clone.return_value = ([np.zeros(10000, dtype="float32")], 24000)
            speak = load_gretel_voice_model(wav, model_factory=Mock(return_value=fake))
            with self.assertRaises(ValueError):
                speak(" ")
            with self.assertRaisesRegex(RuntimeError, "silent"):
                speak("Es una nueva oración.")


if __name__ == "__main__":
    unittest.main()
