# ChatGPT continuation — authentic flip-chart art repair

Read this file immediately after `AGENTS.md`. Do not restart the audit from old backlogs, generated-art folders, crop manifests, issue text, or filenames.

## Repository state

- Repository: `ejnburrows-rgb/cartilla-de-gretel`
- Working branch: `repair/authentic-flipchart-art`
- Draft PR: https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/399
- Base branch: `main`
- Production: untouched
- Authoritative repair record: `docs/AUTHENTIC-FLIPCHART-ART-AUDIT.md`
- Current branch head is authoritative. Do not reset this branch to `main`.
- Last app-changing preview commit verified: `2fefc27adfafa3f25ca2d98d3b009bea438da0d4`
- READY preview deployment for that commit: https://cartilla-de-gretel-jofk8wk64-ejns-projects-1b938dd2.vercel.app

## Proven repairs

| Workbook drawing | Student pages | Teacher source | Final asset | Result |
|---|---|---|---|---|
| iglú | 4, 5, 8, 10, 13, 14 | HD teacher page 7, crop `[960,1530,600,570]` | `public/cartilla/art/faithful/vocal-i/iglu.webp` | Identical drawing, authentic source crop, QA PASS. |
| aro | 1, 8 | HD teacher page 5, crop `[870,2580,780,660]` | `public/cartilla/art/faithful/vocal-a/aro.webp` | Legacy `remolino` name was wrong. Both cells now use the complete authentic `aro` crop. |

The `aro` repair was browser-verified on the READY preview: the 780×660 asset loads completely, renders in lesson 1, and clicking it changes the cell from `fp-ix-cell` to `fp-ix-cell picked`. No application console error, error overlay, or Vercel runtime error was found.

## Remaining source-identification blockers

These five exact workbook drawings account for 14 visible cells. All 62 teacher files and all 62 HD duplicates were checked using the exact workbook crops, full-page visual review, SIFT/RANSAC matching, multi-scale edge matching, and OCR. No identical teacher drawing passed visual confirmation.

| Current name | Student pages | Exact workbook source | Crop box | Important rejected look-alike |
|---|---|---|---|---|
| abrigo | 1, 11 | `public/cartilla/art/restored/workbook/page-003.png` | `[230,800,440,520]` | Teacher page 8 `uniforme` is a different drawing. |
| globo | 2 | `public/cartilla/art/restored/workbook/page-004.png` | `[1740,2985,580,515]` | Teacher page 34 `bola` is a different drawing. |
| abeja | 1, 7, 8, 10, 11, 14, 16 | `public/cartilla/art/restored/workbook/page-009.png` | `[720,1420,580,560]` | Teacher page 60 decorative bees are different drawings. |
| oruga | 7 | `public/cartilla/art/restored/workbook/page-009.png` | `[720,800,580,570]` | Teacher page 7 `insecto` and teacher page 43 `gusano` are different drawings. |
| aguja | 7, 8, 10 | `public/cartilla/art/restored/workbook/page-009.png` | `[1350,2650,575,590]` | No identical needle drawing appears on the 62-page contact sheet. |

These are not permission to color, generate, redraw, vectorize, or substitute. Their neutral pending cells intentionally hide the vocabulary word so the answer is not exposed.

If a future source is supplied, match the exact workbook drawing first, crop the identical authentic color drawing, write it to the existing faithful asset path, add only the required `illustrationSrc` references, update the faithful manifest and QA record, build, and browser-test every affected activity. Do not change layouts, coordinates, interactions, curriculum, auth, database, security, or production.

## ChatGPT GitHub/Vercel continuation setup

1. Use ChatGPT on the web or desktop and turn on **Work**. Plugins are not available in ordinary Chat mode.
2. Open **Plugins**, install **GitHub** and **Vercel**, and complete each connection.
3. In the GitHub connection, grant access to `ejnburrows-rgb/cartilla-de-gretel`.
4. Start a new Work chat after installation so the tools load.
5. Invoke the connected tools explicitly with `@GitHub` and `@Vercel`, then paste the prompt below.

## Paste this into the next ChatGPT Work agent

```text
Use @GitHub and @Vercel. Continue the existing authentic flip-chart art repair in ejnburrows-rgb/cartilla-de-gretel on branch repair/authentic-flipchart-art and draft PR #399. Do not touch main or production.

First read AGENTS.md, then docs/CHATGPT-CONTINUATION-AUTHENTIC-ART.md, then docs/AUTHENTIC-FLIPCHART-ART-AUDIT.md. Treat those as authoritative over every older backlog, manifest, issue, or filename.

Do not regenerate, recolor, redraw, vectorize, or substitute lesson art. The printed workbook drawing identifies the object; only an identical authentic color drawing may fill the existing student slot. Preserve layouts, interactions, answer visibility, curriculum, auth, database, and security.

Verify the current branch head and READY Vercel preview before changing anything. The aro/remolino naming error and iglú are already repaired; do not reopen them. Continue only from the five explicitly documented source-identification blockers. If no new authoritative source exists, do not pretend those five are solved. Keep PR #399 draft, update its evidence, and report the exact blocker.
```

## Usage-limit note

An agent cannot reliably see the user's remaining ChatGPT usage percentage. If a session ends, the branch, PR, this file, and the authoritative audit preserve the exact continuation point. A new Work chat with the GitHub and Vercel plugins can resume without repeating the completed discovery work.
