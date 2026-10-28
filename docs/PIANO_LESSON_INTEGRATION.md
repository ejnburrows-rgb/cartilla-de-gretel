# Piano Hablador — existing implementation and held placement decision

**Status:** Existing Piano work continues for microphone/acoustic correctness; exact lesson insertion remains an explicit curriculum-placement hold.  
**Historical October 14 discussion order:** Do not let a past discussion request pause existing Piano's permission, acoustic, pitch/recognition and cleanup verification. Exact unapproved insertion into specific printed lessons is still held; complete other authorized work.
**Decided:** 2026-10-14 by the owner (EJN)  
**Owner will update:** which lessons, where in the lesson, and any other activities.

## Decision

The Piano Hablador belongs **inside the lessons**, not only behind a teacher's
assignment link. The owner will choose the lessons and the exact place in the
lesson later. Until then, do **not** add a Piano entry point, move the Piano,
or pick lessons on the owner's behalf.

## Facts today (main, 2026-10-14)

- **How students reach it now:** only from a teacher's practice link,
  `/cartilla/practica?family=1&lesson=N&activity=piano`. There is no student
  button for it in the lessons, the Cuaderno, or *Mis lecciones*.
- **Two looks, same behavior:** "Piano" (wooden piano, tablets/laptops) and
  "Cancionero" (Gretel's songbook, five big keys, phones). A switch lets the
  child or teacher change it; the choice is remembered on the device.
- **What the child does:** says each syllable; the key turns from red to green
  one at a time; one celebration when the word is finished.
- **Content:** verified Student Workbook words from `src/lib/piano-words.ts`
  (five words each for Lessons 8–17 and 19–24). Lessons with no such words
  (vowel lessons 1–6, Lesson 7 Mm, Lesson 18 RRrr) use the lesson's own
  syllables, e.g. *ma · me · mi · mo · mu*.
- **Microphone:** PR #758 (open, owner review) makes the Piano microphone-only,
  per the owner's correction of 2026-10-14. Recognition is word-based (what was
  heard), not pitch. Verified: tsc, 203 piano unit tests, 9/9 piano browser tests.
- **Other practice activities that exist** (same practice page):
  Sílabas, Emparejar, Armar, Trazar, Piano, Busca el sonido, Espejo.
- **Games that exist** (`/cartilla/juego/<id>`): payaso-chano-ss,
  silabas-o (syllable builder pilot), mariposas-p, vocal-a, fonetica-p, rima-p,
  palabras-minuto-p, dibujos-o.

## Open questions for the owner

1. Which lessons get the Piano (all, some, or only lessons with verified words)?
2. Where in the lesson: after the last Workbook page, as a reward page, as a
   button on a specific page, or in the Flip Chart for the whole class?
3. Does finishing the Piano count toward lesson completion, or is it optional?
4. Should other practice activities or games also move into lessons?

## Rules that still apply

- Words and syllables come only from the verified book transcription; never
  invent words, art or Teacher Guide text.
- Approved visuals stay as they are; owner approves any new placement.
- Microphone use needs permission and must never fake progress.
- No paid services, no production deploy, no live student data.

## Brainstorm handoff prompt

Copy this into a new chat to brainstorm before updating this file:

> I'm the owner of *La Cartilla de Gretel*, a Spanish early-reading app built
> from a printed workbook (24 lessons: Lesson 1 introduces the vowels; Lessons
> 2–6 are o, a, e, i, u; Lessons 7–24 are m, p, s, t, d, l, n, ñ, b, v, r, rr,
> g, f, j, c, y, z). Each lesson has Student Workbook pages (circle pictures,
> match vowels, circle syllables, fill in syllables, trace, write, draw) and
> Teacher Flip Chart sheets.
>
> I've decided the **Piano Hablador** should live inside the lessons. Today
> it's only reachable from a teacher's assignment link. The child says each
> syllable of a word into the microphone and each key turns green; on phones
> it looks like a five-key songbook. It uses five verified workbook words per
> lesson for Lessons 8–17 and 19–24 (e.g. Lesson 9: sapo, puso, masa, así,
> supo) and the lesson's syllables elsewhere (e.g. Lesson 7: ma me mi mo mu).
>
> Other activities already built: Sílabas, Emparejar, Armar, Trazar, Busca el
> sonido, Espejo, plus games (payaso, syllable builder, mariposas, vocal,
> fonética, rima, palabras por minuto, dibujos).
>
> Help me decide, with pros and cons for 5–7-year-old learners and their
> teacher:
> 1. Which lessons should include the Piano, and why (where does saying whole
>    words add the most: early consonants, harder sounds like rr/ñ/g/c, or
>    review points)?
> 2. Where in a lesson it fits best (end-of-lesson reward, after a specific
>    activity, whole-class on the projector, or at home).
> 3. Whether it should count toward finishing a lesson.
> 4. Which other existing activities or games would also fit inside lessons,
>    and where.
> 5. Any risks (noisy classrooms, shy speakers, no microphone, accents) and
>    simple ways to handle them without faking progress.
>
> Keep to the book's own words and pictures; don't invent new content. End
> with a short recommended plan I can paste into my project notes.
