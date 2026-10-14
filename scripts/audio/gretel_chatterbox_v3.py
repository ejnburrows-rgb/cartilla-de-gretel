"""Generative Gretel speech backed by official Chatterbox Multilingual V3.

Load V3 with a PRIVATE Gretel reference, optionally overlay the official
Latin American Spanish T3 safetensors checkpoint. Produces NEW speech from
text: no recorded-word lookup or voice replacement. This reference-conditioned
path does NOT constitute training on the entire 32-minute dataset.
"""
from __future__ import annotations
from pathlib import Path
from typing import Callable
import numpy as np

def load_gretel_voice_model(
    reference: Path,
    device: str = "cpu",
    latam_checkpoint: Path | None = None,
    *,
    model_factory=None,
    checkpoint_loader=None,
) -> Callable[[str], tuple[int,np.ndarray]]:
    reference=Path(reference)
    if not reference.is_file():
        raise FileNotFoundError("Private Gretel voice reference WAV was not found")
    if latam_checkpoint is not None and not Path(latam_checkpoint).is_file():
        raise FileNotFoundError("Requested LatAm Spanish model checkpoint was not found")
    if model_factory is None:
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        model_factory=ChatterboxMultilingualTTS.from_pretrained
    import torch
    if device=="cuda" and not torch.cuda.is_available():
        raise RuntimeError("CUDA requested but is not available")
    model=model_factory(device=device,t3_model="v3")
    if latam_checkpoint is not None:
        if checkpoint_loader is None:
            from safetensors.torch import load_file
            checkpoint_loader=load_file
        checkpoint=checkpoint_loader(str(latam_checkpoint))
        model.t3.load_state_dict(checkpoint,strict=True)
        model.t3.to(device).eval()
    model.prepare_conditionals(str(reference),exaggeration=0.45)

    def synthesize(text: str) -> tuple[int,np.ndarray]:
        if not text.strip():
            raise ValueError("TTS text cannot be empty")
        with torch.inference_mode():
            wav=model.generate(text,language_id="es",exaggeration=0.45,cfg_weight=0.35)
        if hasattr(wav,"detach"):
            wav=wav.detach().cpu().numpy()
        return int(model.sr),np.asarray(wav,dtype=np.float32).squeeze()
    return synthesize
