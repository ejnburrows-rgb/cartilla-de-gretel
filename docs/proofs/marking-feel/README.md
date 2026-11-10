# Proof: One-Book Marking Feel Across Workbook Interaction Kit

- **Target Commit SHA**: `c35a2d10539a0bf87b8521f733df3eb00fa0f63c`
- **Recorded Date**: 2026-10-21
- **Branch**: `draft/one-book-marking-feel`

## Matrix Summary

| Interaction | phone-portrait (390x844) | phone-landscape (844x390) | desktop (1280x800) |
|---|---|---|---|
| **Marca con una X** (Page 4) | PASS | DIFFERS (scales to 10px cells in landscape frame) | PASS |
| **Tap-to-select** (Page 2) | PASS | DIFFERS (scales to 10px cells in landscape frame) | PASS |
| **Line-matching** (Page 3) | PASS | DIFFERS (container flex collapses to height 0) | PASS |
| **Syllable-circle** (Page 20) | PASS | PASS | PASS |

## Videos (`videos/`)
1. `mark-x_phone-portrait.webm`
2. `mark-x_phone-landscape.webm`
3. `mark-x_desktop.webm`
4. `tap-select_phone-portrait.webm`
5. `tap-select_phone-landscape.webm`
6. `tap-select_desktop.webm`
7. `line-match_phone-portrait.webm`
8. `line-match_phone-landscape.webm`
9. `line-match_desktop.webm`
10. `syllable-circle_phone-portrait.webm`
11. `syllable-circle_phone-landscape.webm`
12. `syllable-circle_desktop.webm`

## Screenshots (`screenshots/`)
For each interaction and viewport:
- `*_ash.png`: Ash-pencil first state (`#46464d`)
- `*_mid_erase.png`: Mid-erase state (pencil rotated 180° to pink eraser scrubbing with falling crumbs)
- `*_green.png`: Green resolve state (`#16a34a`, stays)
