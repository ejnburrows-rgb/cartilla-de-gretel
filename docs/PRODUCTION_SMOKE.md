# Production smoke test

Use this checklist after any deployment that changes lesson routing, lesson data, or book-faithful overlays.

## Production URL

https://cartilla-de-gretel.vercel.app

## Commit check

Open:

```text
https://cartilla-de-gretel.vercel.app/robots.txt
```

Confirm the `# commit:` line matches the expected GitHub commit for the deploy under test.

## Lesson 9 check

Open:

```text
https://cartilla-de-gretel.vercel.app/cartilla/leccion/9
```

Expected:

- The page stays on `/cartilla/leccion/9` and does not redirect to the 24-lesson index.
- It shows Lección 9 / Letra S s / páginas 27-30.
- It shows the official Cuaderno layer before the interactive exercises.
- If `/book/book.pdf` is not connected, it shows `Pagina pendiente de conexion al cuaderno oficial` without invented page content.
- Sight-word chips are visible: `es`, `de`, `un`, `está`, `en`, `la`, `el`.
- The DOM includes `aria-label="Palabra de vista: es"`.

## Lesson 17 check

Open:

```text
https://cartilla-de-gretel.vercel.app/cartilla/leccion/17
```

Expected:

- The page stays on `/cartilla/leccion/17` and does not redirect to the 24-lesson index.
- It shows Lección 17 / Letra R r / páginas 59-62.
- It shows the official Cuaderno layer before the interactive exercises.
- If `/book/book.pdf` is not connected, it shows `Pagina pendiente de conexion al cuaderno oficial` without invented page content.
- The banner `Esta lección tiene un mini-cuento.` is visible.

## Last verified production result

2026-05-23:

- Commit served: `3901508f61e620c8b22b9d9683a629168302eea0`.
- Lesson 9: PASS.
- Lesson 17: PASS.
- Console errors: none detected.

## CRM shell checks

Open:

```text
https://cartilla-de-gretel.vercel.app/cartilla/unirse
https://cartilla-de-gretel.vercel.app/cartilla/leccion/9
https://cartilla-de-gretel.vercel.app/cartilla/leccion/17
https://cartilla-de-gretel.vercel.app/cartilla/teacher/presentacion
```

Expected:

- `/cartilla/unirse` loads the student sign-in side.
- `/cartilla/leccion/9` has the workbook shell/background and `aria-label="Palabra de vista: es"`.
- `/cartilla/leccion/17` has the workbook shell/background and the mini-cuento banner.
- `/cartilla/leccion/9` and `/cartilla/leccion/17` show the official workbook source layer; source pages either render from a connected PDF/image or show a clear pending-source state.
- `/cartilla/teacher/presentacion` exists behind auth or redirects appropriately if unauthenticated.
- `/cartilla/teacher/presentacion` shows source-readiness indicators for each lesson, including connected/missing source, verified text count, and image/source count.
