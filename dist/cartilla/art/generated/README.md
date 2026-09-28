# Generated scene art

Scene art for the **welcome splash and app chrome only** — never for lesson
content. See the "Generated scene art" section of `AGENTS.md` (owner decision,
2026-07-25).

## The boundary (do not blur it)

| Allowed here | Never here |
| --- | --- |
| The welcome splash (`/`) | Workbook cells |
| Decorative app backgrounds | `page-layouts.json` `illustrationSrc` |
| Celebration / empty states | The flipchart |
| Marketing surfaces | Anything drawn by `FaithfulPageRenderer` |

Lesson art stays faithful-crop-only under the shared art contract and the
Faithful Restoration Standard. Generated art may never stand in for one of
Estela de Armas Plasencia's book illustrations or a labeled vocabulary cell.

## Who makes these

**The owner generates and approves the image.** Agents only wire an approved
file in — they do not generate scene art themselves.

## Adding an approved image

1. Drop the file in this folder (`.webp` preferred, `.jpg`/`.png` fine).
2. Add an entry to `manifest.json` under `scenes`:

```json
{
  "slug": "welcome-splash",
  "purpose": "welcome-splash",
  "src": "/cartilla/art/generated/welcome-splash.webp",
  "tool": "<which image tool made it>",
  "createdAt": "2026-07-25",
  "reviewedBy": "EJN"
}
```

3. That is all. `src/lib/generated-art.ts` reads this manifest, and
   `WelcomeSplash` picks the `welcome-splash` entry up automatically on the
   next build — no component change needed.

Until an entry exists, the splash falls back to the existing painted garden
plate (real book art), so the screen always works.

## Text belongs in HTML, not in the image

Do not bake "¡Bienvenidos!", the book title, or any button label into the
picture. The headline and the Entrar button are real HTML/CSS text so they stay
selectable, translatable, readable by a screen reader, and crisp at every zoom
level. Generate the scene with **room at the top** for the headline to sit over.
