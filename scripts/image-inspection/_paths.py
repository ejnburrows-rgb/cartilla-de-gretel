"""Fixed locations used by the image-inspection scripts.

Paths are constants (never taken from the command line) so the scripts can only
read and write inside this repository.
"""
import os

ROOT = os.path.realpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
PROOF = os.path.join(ROOT, "docs", "proofs", "image-inspection-2026-11-26")
# Raw browser results written by inspect-rendered-images.mjs (git-ignored).
RESULTS = os.path.join(ROOT, "test-results", "image-inspection")
# Per-sheet provenance contact sheets (git-ignored); the proof keeps needs-review.jpg.
PROVENANCE_SCRATCH = os.path.join(ROOT, "test-results", "image-inspection-provenance")
