"""Command-line path guard shared by the image-inspection scripts."""
import os
import sys
import tempfile

ROOT = os.path.realpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
_ALLOWED = (ROOT + os.sep, os.path.realpath(tempfile.gettempdir()) + os.sep)


def safe_dir(arg, default=None):
    """Resolve a directory argument, refusing anything outside the repository or temp dir."""
    raw = arg if arg is not None else default
    if raw is None:
        sys.exit("missing directory argument")
    resolved = os.path.realpath(raw)
    if not (resolved + os.sep).startswith(_ALLOWED):
        sys.exit(f"refusing path outside the repository or temp dir: {raw}")
    return resolved


def arg(i):
    return sys.argv[i] if len(sys.argv) > i else None
