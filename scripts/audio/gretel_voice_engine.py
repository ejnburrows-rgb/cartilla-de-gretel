"""Gretel Spanish speech inference with one reusable PRIVATE speaker profile.

No generic browser TTS, prerecorded-word assembly, or paid synthesis API.
Requires downloaded open-weight model weights; does not fine-tune 32 minutes.
"""
from __future__ import annotations
from pathlib import Path
from typing import Callable
import numpy as np

DEFAULT_BASE_MODEL = "Qwen/Qwen3-TTS-12Hz-0.6B-Base"


def load_gretel_voice_model(
    reference: Path,
    device: str = "cpu",
    *,
    model_path: str | None = None,
    model_factory=None,
) -> Callable[[str], tuple[int, np.ndarray]]:
    """Prepare the private speaker once and generate arbitrary NEW Spanish."""
    reference = Path(reference)
    if not reference.is_file():
        raise FileNotFoundError("Private Gretel voice WAV was not found")
    if device not in ("cpu", "cuda"):
        raise ValueError("Choose cpu or cuda")
    import torch
    if device == "cuda" and not torch.cuda.is_available():
        raise RuntimeError("CUDA requested but no CUDA device is available")
    if model_factory is None:
        try:
            from qwen_tts import Qwen3TTSModel
        except ImportError as exc:
            raise RuntimeError(
                "Install qwen-tts and download the free model weights for direct inference"
            ) from exc
        model_factory = Qwen3TTSModel.from_pretrained
    model = model_factory(
        model_path or DEFAULT_BASE_MODEL,
        device_map=device,
        dtype=torch.float32 if device == "cpu" else torch.bfloat16,
        attn_implementation="eager" if device == "cpu" else "sdpa",
    )
    # Transcripts for the 151 individual segments have NOT been verified yet.
    # Never invent a reference transcript to satisfy the synthesis API.
    owner_voice = model.create_voice_clone_prompt(
        ref_audio=str(reference), x_vector_only_mode=True,
    )

    def speak_new_text(text: str) -> tuple[int, np.ndarray]:
        if not isinstance(text, str) or not text.strip():
            raise ValueError("Speech text must not be blank")
        with torch.inference_mode():
            waveforms, rate = model.generate_voice_clone(
                text=text.strip(), language="Spanish", voice_clone_prompt=owner_voice,
            )
        if not waveforms:
            raise RuntimeError("The Gretel voice model returned no audio")
        samples = np.asarray(waveforms[0], dtype=np.float32).squeeze()
        if samples.ndim != 1 or len(samples) < 256 or not np.all(np.isfinite(samples)):
            raise RuntimeError("The Gretel voice model returned an invalid waveform")
        if float(np.sqrt(np.mean(np.square(samples)))) < 0.001:
            raise RuntimeError("The Gretel voice model returned silent audio")
        return int(rate), samples

    return speak_new_text
