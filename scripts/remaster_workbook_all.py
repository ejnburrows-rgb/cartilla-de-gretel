"""Deprecated workbook colourizer.

This script previously assigned colours to contours by hashing their shape into
an arbitrary palette. That output was not derived from the teacher flipchart and
therefore is not a faithful restoration source.

La Cartilla's artwork rule is now strict: student colour must come from an
explicit source-backed mapping to the teacher flipchart (or another verified
source copy of the exact drawing). When no verified colour donor exists, retain
the authentic printed workbook artwork, including intentional monochrome or
duotone art.

The old generator is intentionally disabled so fabricated colours cannot be
regenerated and accidentally reintroduced.
"""


def main() -> None:
    raise SystemExit(
        "Disabled: automatic contour/hash-palette colourization is not source-faithful. "
        "Use teacher-flipchart-backed restoration assets only."
    )


if __name__ == "__main__":
    main()
