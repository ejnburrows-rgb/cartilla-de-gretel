"""Local evidence CLI boundaries; never trust caller-selected Git refs or paths."""
import re
from pathlib import Path

EVIDENCE_ROOT = Path(__file__).resolve().parent
REPO_ROOT = EVIDENCE_ROOT.parents[3]


def checked_repo(value):
    candidate = Path(value).resolve(strict=True)
    if candidate != REPO_ROOT or not (candidate / '.git').exists():
        raise ValueError('repository must be the checkout containing this helper')
    return candidate


def checked_head(value):
    if not re.fullmatch(r'[0-9a-fA-F]{40}', value):
        raise ValueError('head must be a full 40-character hexadecimal commit')
    return value


def checked_git(value):
    candidate = Path(value)
    if not candidate.is_absolute() or candidate.name.lower() not in ('git', 'git.exe'):
        raise ValueError('Git executable must be an explicitly selected absolute git path')
    resolved = candidate.resolve(strict=True)
    if not resolved.is_file():
        raise ValueError('Git executable must be a file')
    return resolved


def checked_destination(value, root=EVIDENCE_ROOT):
    # Reject redirection outside the assigned boundary, including filesystem links.
    candidate = Path(value).absolute()
    resolved = candidate.resolve()
    if not resolved.is_relative_to(root) or resolved == root:
        raise ValueError('destination escapes the assigned directory')
    if resolved != candidate:
        raise ValueError('redirected destinations are not allowed')
    if not candidate.parent.is_dir():
        raise ValueError('destination parent must already exist')
    return candidate


def write_report(value, text):
    destination = checked_destination(value)
    # Evidence must use a new filename; never overwrite a caller-selected file.
    with destination.open('x', encoding='utf8') as handle:
        handle.write(text)
