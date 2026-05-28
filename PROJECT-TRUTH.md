# Project Truth

## Current status

Cartilla de Gretel is a live web classroom CRM at:

https://cartilla-de-gretel.vercel.app

This is not an EPUB project and not a demo. The EPUB direction is closed.

Stack:

- Vite
- React
- TypeScript
- TanStack Router
- Tailwind
- framer-motion
- react-pageflip
- Supabase
- Vercel

## Verified current GitHub state

Repo:

github.com/ejnburrows-rgb/cartilla-de-gretel

Branch:

main

Verified current HEAD on GitHub:

09f08438c2617a65e98bec4e084d7965089df9d3

Commit message:

feat(intro): pastel Cartilla splash + /intro route — Giant Leap P

Note:

The Notion Hub previously listed 13f940e6 as HEAD. That value is stale compared with GitHub main.

## Verified deployment state

GitHub reports the Vercel status check for HEAD 09f08438c2617a65e98bec4e084d7965089df9d3 as success.

The `/intro` route returned HTTP 200 from Vercel during verification.

Unknown / needs confirmation:

A full Comet phone/browser visual check has not been run in this pass.

## Product lanes

There are three permanent lanes:

1. Student workbook
2. Teacher CRM
3. Teacher flipchart

Hard rule:

Never mix two lanes on one screen.

## Student workbook lane

Purpose:

Render official page scans 1:1.

Routes:

- `/cartilla/leccion/$n`
- `/cartilla/lecciones`

Canonical renderer:

`getWorkbookPagesForLesson(n)` in `src/lib/book-faithful.ts`

Canonical source path:

`public/cartilla/images/source/<letter>/<letter>-page-<n>.jpg`

Banned for student routes:

- `public/book/book.pdf`
- `src/routes/book.tsx`
- any Reader/PdfViewer mount on a student route

## Teacher CRM lane

Purpose:

Classes, students, assignments, progress, review.

Routes:

- `/cartilla/teacher/*`

## Teacher flipchart lane

Purpose:

Projected class book and presentation-quality classroom view.

Routes:

- `/cartilla/teacher/flipchart/*`

## Locked pedagogy

Vowel order:

O → A → E → I → U

Consonant order:

M · P · S · T · D · L · N · Ñ · B · V · R · rr · G · F · J · C · Y · Z

Hard rules:

- Keep 24 lessons.
- Keep 92 pages.
- Keep 1 student workbook.
- Keep 1 teacher flipbook.
- Never reorder lessons.
- Never invent poems, lessons, characters, vocabulary, examples, or exercises.
- Empty sight-word boxes on L16, L18, L19, L21, L22, L23, and L24 are intentional and must stay empty.
- Closing exercises are rimas and must render as-is.

## Locked credits

Author:

Leonor Lopetegui

Contributors:

Aída Fernández, Silvia Diez

Illustrator:

Estela de Armas Plasencia

Adaptation:

Emilio José Novo

Imprint:

LANY Books LLC

ISBN:

0-971-8696-8-5

Rules:

- Use LANY Books LLC exactly.
- Do not use legacy publisher/distributor labels.
- Do not add old addresses, old phone numbers, or distributor details.
- Do not invent edition wording.

## Commit identity rule

Every commit must be authored as:

`ejnburrows-rgb <ejnburrows@gmail.com>`

Never use another email or local deploy identity.

Wrong identity = failed work regardless of file content.

## Lane locks

Never modify without explicit approval:

- `src/components/Reader.tsx`
- `src/routes/_authenticated/**`
- `supabase/**`

## Visual rules

- No raw scan JPGs visible to users.
- No visible perforations, spiral binding, page holes, paper texture, or scan artifacts.
- No upside-down or rotated pages.
- No emojis as object hints.
- No generic stock illustrations or clipart fallbacks.
- No dark-navy edtech-style hero.
- Use cream / warm off-white backgrounds and book-sourced color direction.
- 1:1 page correspondence: digital page N = book page N.
- No remixes, merges, or splits.

## Gretel character canon

Gretel is a little girl and recurring protagonist.

She is not the dragonfly, not a generic avatar, and not a corner sticker.

Canon:

- age about 5–7
- golden blonde, slightly wavy hair
- red bow on top
- no freckles
- blue eyes
- pink blush circles on cheeks
- warm smile
- blue jumper or pinafore
- orange floral embroidered hem
- orange and pale-orange striped long-sleeve shirt
- white knee-high socks with red-and-yellow band
- black mary-jane shoes

Existing committed pose assets:

- `public/cartilla/images/gretel/happy.webp`
- `public/cartilla/images/gretel/cheer.webp`
- `public/cartilla/images/gretel/encouraging.webp`
- `public/cartilla/images/gretel/thinking.webp`
- `public/cartilla/images/gretel/idle-1.webp`
- `public/cartilla/images/gretel/idle-2.webp`

## AI image rule

Current working rule:

AI image work is allowed only when all conditions are met:

1. A real source image is provided as reference.
2. It is not text-to-image from scratch.
3. Source palette colors are preserved.
4. Gretel remains recognizably the same character.
5. E reviews the output before commit.
6. Any output that breaks identity or colors is rejected.

## Voice rule

No TTS.

No AI-generated voice.

No synthetic Gretel voice.

Sound FX cues are allowed.

Real voice comes later from E's physical CD workflow:

physical CD → digitize → clone original Gretel voice → approved clips added later

## Current P0 fires

- Replace dark-navy hero with cream + book palette.
- Strip emojis from object hints.
- Surface Gretel on production surfaces.
- Remove fake demo students and ship honest empty states.
- Fix or hide broken Erik/Sofía login until real auth works.
- Rotate or replace upside-down workbook scans.
- Add drag-and-drop where the workbook requires it.
- Add 3D vertical page-flip for student workbook and teacher flipchart.
- Improve HD/colorized illustrations using approved source-faithful pipeline.

## Current active work

Immediate Hub priority:

1. Leap F — code-only UX sweep.
2. Leap G — image fixes.
3. Leap H — demo-data cleanup.

Queued:

- 3D vertical page-flip
- drag-and-drop interactions
- HD colorized illustrations
- optional silent mascot component if E confirms scope

## Unknown / needs confirmation

- Full visual Comet phone check for HEAD 09f08438.
- Whether mascot batch is now canonical work.
- Which coding agent receives mascot work.
- LANY Books sibling site scope.
- Final imprint display wording per UI surface.
- Phrase list for future voice clips.
