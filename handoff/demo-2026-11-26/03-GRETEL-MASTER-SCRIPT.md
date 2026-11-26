# A. Gretel Master Script — all recoverable Spanish lines

> **2026-11-26 verification note.** Sections 1–8 come from open PR [#1321](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1321) and were rechecked against `main` `5e1c8378`. All 109 Workbook instruction rows match `src/data/page-layouts.json` word for word (0 differences). All 161 picture-word files exist on disk. The 38 missing Flip Chart names are still missing, and the 6 interface lines and all `AUDIO-MANIFEST.csv` rows were reconciled. **Section 9 is new.** It adds Gretel lines that exist in `main` source but were left out of #1321, and records which of Gretel's voice paths are actually connected (mounted) in the app today.

Source of truth: [#877](https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877). Every spoken line below was **copied word for word from the repository**; nothing was made up. Each row gives the file name, where the line is used, and the exact Spanish to say. Technical notes are kept in their own column, apart from the words to record. Voice: warm, neutral Latin American Spanish (Gretel). No device text-to-speech, cloned voice, `rec_gretel_*`, or the rejected 67-clip ZIP.

**What “Status” means:** RECORDED-MAIN = an approved file is already in `main`. RECORDED-UNMERGED = an owner-supplied recording exists only in an open PR and still needs your listening approval. MISSING = no recording anywhere in GitHub. DRAFT WORDING = an earlier agent proposed the words and you have not approved them, so approve the words before recording. “Proposed path” = the code has no file name yet, so a name following the repo’s pattern is suggested.

## 1. Student Workbook — page instructions (109 instruction regions, all pages 1–90 except 86–87)

Instruction text comes from `src/data/page-layouts.json` on `main`, and it is identical to the 109 rows of the Nov 14 `AUDIO-SCRIPTS-WORKBOOK.csv`. Recordings: [PR #1058](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1058) (open, not merged) has **40 owner-supplied instruction recordings**, cut from your Oct 19 WhatsApp master `audio-b10640b9.mp3`. They cover all 109 regions because the same sentences repeat across pages. Lesson 3 also has 5 recordings of its own.

| File(s) | Page | Region | Exact Spanish | Status |
|---|---|---|---|---|
| `/audio/instrucciones/line-01.mp3` | 1 | p1-instr | Circula los dibujos de las palabras en cada línea horizontal que comienzan con el mismo sonido. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-02.mp3` | 2 | p2-instr | Circula el dibujo que comienza con la vocal del recuadro. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-03.mp3` | 3 | p3-instr | Traza una línea de la vocal al dibujo que le corresponde. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-04.mp3` | 4 | p4-instr | Marca con una x los dibujos que comienzan con O o. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-05.mp3` | 5 | p5-instr | Traza una línea desde la vocal Oo hasta el dibujo de la palabra que comienza con Oo. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 6 | p6-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-19.mp3` | 6 | p6-instr2 | Haz un dibujo que represente una palabra que comienza con o. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/leccion3/p7-instr.mp3` | 7 | p7-instr | Marca con una x los dibujos de las palabras que comienzan con A a. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/leccion3/p8-instr.mp3` | 8 | p8-instr | Traza una línea desde la vocal Aa hasta el dibujo de la palabra que comienza con Aa. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 9 | p9-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-20.mp3` | 9 | p9-instr2 | Haz un dibujo que represente una palabra que comienza con a. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-08.mp3` | 10 | p10-instr | Marca con una x los dibujos de las palabras que comienzan con E e. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-09.mp3` | 11 | p11-instr | Traza una línea desde la vocal Ee hasta el dibujo de la palabra que comienza con Ee. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 12 | p12-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-21.mp3` | 12 | p12-instr2 | Haz un dibujo que represente una palabra que comienza con e. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-10.mp3` | 13 | p13-instr | Marca con una x los dibujos de las palabras que comienzan con I i. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-11.mp3` | 14 | p14-instr | Traza una línea desde la vocal Ii hasta el dibujo de la palabra que comienza con Ii. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 15 | p15-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-22.mp3` | 15 | p15-instr2 | Haz un dibujo que represente una palabra que comienza con i. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-12.mp3` | 16 | p16-instr | Marca con una x los dibujos de las palabras que comienzan con U u. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-13.mp3` | 17 | p17-instr | Traza una línea desde la vocal Uu hasta el dibujo de la palabra que comienza con Uu. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 18 | p18-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-23.mp3` | 18 | p18-instr2 | Haz un dibujo que represente una palabra que comienza con u. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 19 | p19-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-24.mp3` | 19 | p19-instr2 | Haz un dibujo que represente una palabra que comienza con m. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-15.mp3` | 20 | p20-instr | Encierra en un círculo la sílaba correspondiente. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-16.mp3` | 22 | p22-instr | Completa las palabras con la sílaba correcta. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-17.mp3`, `/audio/instrucciones/line-18.mp3` | 22 | p22-instr2 | Escribe oraciones. Usa las sílabas que aprendiste. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 23 | p23-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-25.mp3` | 23 | p23-instr2 | Haz un dibujo que represente una palabra que comienza con p. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-15.mp3` | 24 | p24-instr | Encierra en un círculo la sílaba correspondiente. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-16.mp3` | 26 | p26-instr | Completa las palabras con la sílaba correcta. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-17.mp3`, `/audio/instrucciones/line-18.mp3` | 26 | p26-instr2 | Escribe oraciones. Usa las sílabas que aprendiste. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 27 | p27-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-26.mp3` | 27 | p27-instr2 | Haz un dibujo que represente una palabra que comienza con s. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-15.mp3` | 28 | p28-instr | Encierra en un círculo la sílaba correspondiente. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-16.mp3` | 30 | p30-instr | Completa las palabras con la sílaba correcta. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-17.mp3`, `/audio/instrucciones/line-18.mp3` | 30 | p30-instr2 | Escribe oraciones. Usa las sílabas que aprendiste. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 31 | p31-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-27.mp3` | 31 | p31-instr2 | Haz un dibujo que represente una palabra que comienza con t. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-15.mp3` | 32 | p32-instr | Encierra en un círculo la sílaba correspondiente. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-16.mp3` | 34 | p34-instr | Completa las palabras con la sílaba correcta. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-17.mp3`, `/audio/instrucciones/line-18.mp3` | 34 | p34-instr2 | Escribe oraciones. Usa las sílabas que aprendiste. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 35 | p35-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-28.mp3` | 35 | p35-instr2 | Haz un dibujo que represente una palabra que comienza con d. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-15.mp3` | 36 | p36-instr | Encierra en un círculo la sílaba correspondiente. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-16.mp3` | 38 | p38-instr | Completa las palabras con la sílaba correcta. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-17.mp3`, `/audio/instrucciones/line-18.mp3` | 38 | p38-instr2 | Escribe oraciones. Usa las sílabas que aprendiste. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 39 | p39-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-29.mp3` | 39 | p39-instr2 | Haz un dibujo que represente una palabra que comienza con l. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-15.mp3` | 40 | p40-instr | Encierra en un círculo la sílaba correspondiente. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-16.mp3` | 42 | p42-instr | Completa las palabras con la sílaba correcta. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-17.mp3`, `/audio/instrucciones/line-18.mp3` | 42 | p42-instr2 | Escribe oraciones. Usa las sílabas que aprendiste. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 43 | p43-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-30.mp3` | 43 | p43-instr2 | Haz un dibujo que represente una palabra que comienza con n. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-15.mp3` | 44 | p44-instr | Encierra en un círculo la sílaba correspondiente. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-16.mp3` | 46 | p46-instr | Completa las palabras con la sílaba correcta. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-17.mp3`, `/audio/instrucciones/line-18.mp3` | 46 | p46-instr2 | Escribe oraciones. Usa las sílabas que aprendiste. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 47 | p47-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-31.mp3` | 47 | p47-instr2 | Haz un dibujo que represente una palabra que comienza con ñ. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-15.mp3` | 48 | p48-instr | Encierra en un círculo la sílaba correspondiente. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-16.mp3` | 50 | p50-instr | Completa las palabras con la sílaba correcta. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-17.mp3`, `/audio/instrucciones/line-18.mp3` | 50 | p50-instr2 | Escribe oraciones. Usa las sílabas que aprendiste. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 51 | p51-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-32.mp3` | 51 | p51-instr2 | Haz un dibujo que represente una palabra que comienza con b. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-15.mp3` | 52 | p52-instr | Encierra en un círculo la sílaba correspondiente. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-16.mp3` | 54 | p54-instr | Completa las palabras con la sílaba correcta. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-17.mp3`, `/audio/instrucciones/line-18.mp3` | 54 | p54-instr2 | Escribe oraciones. Usa las sílabas que aprendiste. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 55 | p55-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-33.mp3` | 55 | p55-instr2 | Haz un dibujo que represente una palabra que comienza con v. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-15.mp3` | 56 | p56-instr | Encierra en un círculo la sílaba correspondiente. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-16.mp3` | 58 | p58-instr | Completa las palabras con la sílaba correcta. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-17.mp3`, `/audio/instrucciones/line-18.mp3` | 58 | p58-instr2 | Escribe oraciones. Usa las sílabas que aprendiste. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 59 | p59-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-34.mp3` | 59 | p59-instr2 | Haz un dibujo que represente una palabra que comienza con r. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-15.mp3` | 60 | p60-instr | Encierra en un círculo la sílaba correspondiente. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-16.mp3` | 62 | p62-instr | Completa las palabras con la sílaba correcta. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-17.mp3`, `/audio/instrucciones/line-18.mp3` | 62 | p62-instr2 | Escribe oraciones. Usa las sílabas que aprendiste. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 63 | p63-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-35.mp3` | 63 | p63-instr2 | Haz un dibujo que represente una palabra que contenga la letra rr. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-15.mp3` | 64 | p64-instr | Encierra en un círculo la sílaba correspondiente. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-16.mp3` | 66 | p66-instr | Completa las palabras con la sílaba correcta. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-17.mp3`, `/audio/instrucciones/line-18.mp3` | 66 | p66-instr2 | Escribe oraciones. Usa las sílabas que aprendiste. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 67 | p67-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-36.mp3` | 67 | p67-instr2 | Haz un dibujo que represente una palabra que comienza con g. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-15.mp3` | 68 | p68-instr | Encierra en un círculo la sílaba correspondiente. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-16.mp3` | 70 | p70-instr | Completa las palabras con la sílaba correcta. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-17.mp3`, `/audio/instrucciones/line-18.mp3` | 70 | p70-instr2 | Escribe oraciones. Usa las sílabas que aprendiste. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 71 | p71-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-37.mp3` | 71 | p71-instr2 | Haz un dibujo que represente una palabra que comienza con f. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-15.mp3` | 72 | p72-instr | Encierra en un círculo la sílaba correspondiente. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-16.mp3` | 74 | p74-instr | Completa las palabras con la sílaba correcta. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-17.mp3`, `/audio/instrucciones/line-18.mp3` | 74 | p74-instr2 | Escribe oraciones. Usa las sílabas que aprendiste. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 75 | p75-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-38.mp3` | 75 | p75-instr2 | Haz un dibujo que represente una palabra que comienza con j. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-15.mp3` | 76 | p76-instr | Encierra en un círculo la sílaba correspondiente. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-16.mp3` | 78 | p78-instr | Completa las palabras con la sílaba correcta. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-17.mp3`, `/audio/instrucciones/line-18.mp3` | 78 | p78-instr2 | Escribe oraciones. Usa las sílabas que aprendiste. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 79 | p79-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-39.mp3` | 79 | p79-instr2 | Haz un dibujo que represente una palabra que comienza con c. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-15.mp3` | 80 | p80-instr | Encierra en un círculo la sílaba correspondiente. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-16.mp3` | 82 | p82-instr | Completa las palabras con la sílaba correcta. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-17.mp3`, `/audio/instrucciones/line-18.mp3` | 82 | p82-instr2 | Escribe oraciones. Usa las sílabas que aprendiste. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-14.mp3` | 83 | p83-instr1 | Escribe con tu mejor letra. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-40.mp3` | 83 | p83-instr2 | Haz un dibujo que represente una palabra que comienza con y. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-15.mp3` | 84 | p84-instr | Encierra en un círculo la sílaba correspondiente. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-15.mp3` | 88 | p88-instr | Encierra en un círculo la sílaba correspondiente. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-16.mp3` | 90 | p90-instr | Completa las palabras con la sílaba correcta. | RECORDED-UNMERGED (#1058) — owner listening approval needed |
| `/audio/instrucciones/line-17.mp3`, `/audio/instrucciones/line-18.mp3` | 90 | p90-instr2 | Escribe oraciones. Usa las sílabas que aprendiste. | RECORDED-UNMERGED (#1058) — owner listening approval needed |

**The 40 unique recorded instruction sentences** (`public/audio/instrucciones/line-NN.mp3` on the #1058 branch):

| File | Exact Spanish | Pages | Source cut (s) |
|---|---|---|---|
| `/audio/instrucciones/line-01.mp3` | Circula los dibujos de las palabras en cada línea horizontal que comienzan con el mismo sonido. | 1 | 4.639–11.293 |
| `/audio/instrucciones/line-02.mp3` | Circula el dibujo que comienza con la vocal del recuadro. | 2 | 13.362–17.238 |
| `/audio/instrucciones/line-03.mp3` | Traza una línea de la vocal al dibujo que le corresponde. | 3 | 19.185–23.572 |
| `/audio/instrucciones/line-04.mp3` | Marca con una X los dibujos que comienzan con O o. | 4 | 26.202–31.493 |
| `/audio/instrucciones/line-05.mp3` | Traza una línea desde la vocal O hasta el dibujo de la palabra que comienza con O. | 5 | 34.066–41.111 |
| `/audio/instrucciones/line-06.mp3` | Marca con una X los dibujos de las palabras que comienzan con A a. | 7 | 43.6–49.761 |
| `/audio/instrucciones/line-07.mp3` | Traza una línea desde la vocal A hasta el dibujo de la palabra que comienza con A. | 8 | 52.161–59.204 |
| `/audio/instrucciones/line-08.mp3` | Marca con una X los dibujos de las palabras que comienzan con E e. | 10 | 61.471–67.593 |
| `/audio/instrucciones/line-09.mp3` | Traza una línea desde la vocal E hasta el dibujo de la palabra que comienza con E. | 11 | 69.876–76.978 |
| `/audio/instrucciones/line-10.mp3` | Marca con una X los dibujos de las palabras que comienzan con I i. | 13 | 78.837–84.889 |
| `/audio/instrucciones/line-11.mp3` | Traza una línea desde la vocal I hasta el dibujo de la palabra que comienza con I. | 14 | 86.788–93.697 |
| `/audio/instrucciones/line-12.mp3` | Marca con una X los dibujos de las palabras que comienzan con U u. | 16 | 95.602–101.62 |
| `/audio/instrucciones/line-13.mp3` | Traza una línea desde la vocal U hasta el dibujo de la palabra que comienza con U. | 17 | 103.512–110.366 |
| `/audio/instrucciones/line-14.mp3` | Escribe con tu mejor letra. | 6, 9, 12, 15, 18, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63, 67, 71, 75, 79, 83 | 112.431–114.704 |
| `/audio/instrucciones/line-15.mp3` | Encierra en un círculo la sílaba correspondiente. | 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88 | 116.605–120.187 |
| `/audio/instrucciones/line-16.mp3` | Completa las palabras con la sílaba correcta. | 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62, 66, 70, 74, 78, 82, 90 | 122.389–125.566 |
| `/audio/instrucciones/line-17.mp3` | Escribe oraciones. | 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62, 66, 70, 74, 78, 82, 90 | 127.771–129.575 |
| `/audio/instrucciones/line-18.mp3` | Usa las sílabas que aprendiste. | 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62, 66, 70, 74, 78, 82, 90 | 131.721–133.968 |
| `/audio/instrucciones/line-19.mp3` | Haz un dibujo que represente una palabra que comienza con O. | 6 | 136.121–140.682 |
| `/audio/instrucciones/line-20.mp3` | Haz un dibujo que represente una palabra que comienza con A. | 9 | 142.649–147.093 |
| `/audio/instrucciones/line-21.mp3` | Haz un dibujo que represente una palabra que comienza con E. | 12 | 149.538–154.066 |
| `/audio/instrucciones/line-22.mp3` | Haz un dibujo que represente una palabra que comienza con I. | 15 | 156.557–161.077 |
| `/audio/instrucciones/line-23.mp3` | Haz un dibujo que represente una palabra que comienza con U. | 18 | 163.66–168.153 |
| `/audio/instrucciones/line-24.mp3` | Haz un dibujo que represente una palabra que comienza con M. | 19 | 170.708–175.341 |
| `/audio/instrucciones/line-25.mp3` | Haz un dibujo que represente una palabra que comienza con P. | 23 | 177.914–182.393 |
| `/audio/instrucciones/line-26.mp3` | Haz un dibujo que represente una palabra que comienza con S. | 27 | 184.985–189.645 |
| `/audio/instrucciones/line-27.mp3` | Haz un dibujo que represente una palabra que comienza con T. | 31 | 192.201–196.668 |
| `/audio/instrucciones/line-28.mp3` | Haz un dibujo que represente una palabra que comienza con D. | 35 | 199.164–203.604 |
| `/audio/instrucciones/line-29.mp3` | Haz un dibujo que represente una palabra que comienza con L. | 39 | 206.159–210.759 |
| `/audio/instrucciones/line-30.mp3` | Haz un dibujo que represente una palabra que comienza con N. | 43 | 212.91–217.542 |
| `/audio/instrucciones/line-31.mp3` | Haz un dibujo que represente una palabra que comienza con Ñ. | 47 | 219.797–224.632 |
| `/audio/instrucciones/line-32.mp3` | Haz un dibujo que represente una palabra que comienza con B. | 51 | 226.65–231.243 |
| `/audio/instrucciones/line-33.mp3` | Haz un dibujo que represente una palabra que comienza con V. | 55 | 233.308–238.059 |
| `/audio/instrucciones/line-34.mp3` | Haz un dibujo que represente una palabra que comienza con R. | 59 | 240.056–244.861 |
| `/audio/instrucciones/line-35.mp3` | Haz un dibujo que represente una palabra que contenga la letra RR. | 63 | 246.907–252.629 |
| `/audio/instrucciones/line-36.mp3` | Haz un dibujo que represente una palabra que comienza con G. | 67 | 254.646–259.214 |
| `/audio/instrucciones/line-37.mp3` | Haz un dibujo que represente una palabra que comienza con F. | 71 | 261.203–265.959 |
| `/audio/instrucciones/line-38.mp3` | Haz un dibujo que represente una palabra que comienza con J. | 75 | 267.914–272.696 |
| `/audio/instrucciones/line-39.mp3` | Haz un dibujo que represente una palabra que comienza con C. | 79 | 274.612–279.171 |
| `/audio/instrucciones/line-40.mp3` | Haz un dibujo que represente una palabra que comienza con Y. | 83 | 280.895–285.966 |

Lesson 3 own cuts on #1058 (source `audio-cfcac090.mp3`): `/audio/leccion3/p7-instr.mp3`, `/audio/leccion3/p8-instr.mp3`, `/audio/leccion3/p9-instr1.mp3`, `/audio/leccion3/p9-instr2.mp3`, `/audio/leccion3/muy-bien.mp3` (“¡Muy bien!”).

## 2. Teacher Flip Chart — picture names Gretel says when a picture is tapped

The Flip Chart does not script any other Gretel narration. The teacher reads the sheets aloud, and the teacher-guide text in `src/content/guia/lesson-*.json` is the teacher’s own script, not Gretel’s. Picture names come from `docs/audio/MISSING_PICTURE_RECORDINGS.csv` (generated from the verified catalog). Keys marked “scene” or with a trailing letter tag are spoken as **the picture name only**. The tag is a catalog label.

| File | Flip Chart sheet | Catalog key | Spoken text to confirm | Status |
|---|---|---|---|---|
| `/audio/voz/vocabulario/a-la-fiesta-scene.mp3` | Flip Chart 50 / production content | a la fiesta scene | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/abejas-z.mp3` | Flip Chart 60 / production content | abejas z | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/burro-b.mp3` | Flip Chart 33 / production content | burro b | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/campana-d.mp3` | Flip Chart 21 / production content | campana d | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/carro-calabaza-scene.mp3` | Flip Chart 62 / production content | carro calabaza scene | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/carro-rr.mp3` | Flip Chart 42 / production content | carro rr | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/flor-abeja-f.mp3` | Flip Chart 48 / production content | flor abeja f | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/gallina-c.mp3` | Flip Chart 54 / production content | gallina c | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/gato-enamorado-scene.mp3` | Flip Chart 47 / production content | gato enamorado scene | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/jicotea-jabela-scene.mp3` | Flip Chart 53 / production content | jicotea jabela scene | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/jirafa-j.mp3` | Flip Chart 51 / production content | jirafa j | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/leo-lee-gretel-scene.mp3` | Flip Chart 26 / production content | leo lee gretel scene | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/los-caramelos-scene.mp3` | Flip Chart 56 / production content | los caramelos scene | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/made-y-papa-scene.mp3` | Flip Chart 23 / production content | made y papa scene | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/mi-bote-de-vela-scene.mp3` | Flip Chart 38 / production content | mi bote de vela scene | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/mi-mama-scene.mp3` | Flip Chart 11 / production content | mi mama scene | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/mi-papa-scene.mp3` | Flip Chart 14 / production content | mi papa scene | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/nina-enmarcada-ny.mp3` | Flip Chart 30 / production content | nina enmarcada ny | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/nina-l.mp3` | Flip Chart 24 / production content | nina l | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/nina-suena-scene.mp3` | Flip Chart 32 / production content | nina suena scene | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/nino-nada-scene.mp3` | Flip Chart 29 / production content | nino nada scene | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/nino-tambor-t.mp3` | Flip Chart 18 / production content | nino tambor t | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/nino-yoyo-y.mp3` | Flip Chart 57 / production content | nino yoyo y | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/niña-distraída.mp3` | Flip Chart 6 / production content | niña distraída | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/oso-parpadeo.mp3` | Verified faithful-art content | oso (parpadeo) | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/pollito-p.mp3` | Flip Chart 12 / production content | pollito p | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/rapido-arriba-scene.mp3` | Flip Chart 44 / production content | rapido arriba scene | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/raton-r.mp3` | Flip Chart 39 / production content | raton r | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/rosca-manolo-scene.mp3` | Flip Chart 41 / production content | rosca manolo scene | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/saltamontes-g.mp3` | Flip Chart 45 / production content | saltamontes g | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/sapo-samapo-scene.mp3` | Flip Chart 17 / production content | sapo samapo scene | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/serpiente-s.mp3` | Flip Chart 15 / production content | serpiente s | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/sopa-de-pato-scene.mp3` | Flip Chart 20 / production content | sopa de pato scene | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/sube-la-bola-scene.mp3` | Flip Chart 35 / production content | sube la bola scene | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/ternero-n.mp3` | Flip Chart 27 / production content | ternero n | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/toro-m.mp3` | Flip Chart 9 / production content | toro m | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/viento-v.mp3` | Flip Chart 36 / production content | viento v | **Owner to confirm exact spoken name** — catalog key only | MISSING |
| `/audio/voz/vocabulario/yate-de-yayo-scene.mp3` | Flip Chart 59 / production content | yate de yayo scene | **Owner to confirm exact spoken name** — catalog key only | MISSING |

> I did not invent the spoken wording for these 38 Flip Chart keys. The catalog stores labels like `toro m` or `mi mama scene`, not the sentence to say. The owner (or the printed sheet) must confirm the exact name to record, for example “toro” or “Mi mamá”. `niña distraída`: the old recording said “sordita” and was retired on 2026-10-22 when you renamed her.

## 3. Picture vocabulary — 161 approved recordings already in `main` (no action)

Approval: owner Candidate B voice, 2026-10-04, merged in #503. Source: `src/content/picture-name-recordings.json`. Files are approved in the manifest; nobody has listened to them in this session.

| File | Spoken word | Status |
|---|---|---|
| `/audio/voz/vocabulario/abanico.mp3` | abanico | RECORDED-MAIN |
| `/audio/voz/vocabulario/abeja.mp3` | abeja | RECORDED-MAIN |
| `/audio/voz/vocabulario/abrigo.mp3` | abrigo | RECORDED-MAIN |
| `/audio/voz/vocabulario/aguja.mp3` | aguja | RECORDED-MAIN |
| `/audio/voz/vocabulario/ajo.mp3` | ajo | RECORDED-MAIN |
| `/audio/voz/vocabulario/ala.mp3` | ala | RECORDED-MAIN |
| `/audio/voz/vocabulario/alas.mp3` | alas | RECORDED-MAIN |
| `/audio/voz/vocabulario/amo.mp3` | amo | RECORDED-MAIN |
| `/audio/voz/vocabulario/ana.mp3` | ana | RECORDED-MAIN |
| `/audio/voz/vocabulario/anillo.mp3` | anillo | RECORDED-MAIN |
| `/audio/voz/vocabulario/araña.mp3` | araña | RECORDED-MAIN |
| `/audio/voz/vocabulario/ardilla.mp3` | ardilla | RECORDED-MAIN |
| `/audio/voz/vocabulario/aro.mp3` | aro | RECORDED-MAIN |
| `/audio/voz/vocabulario/arre-caballito.mp3` | arre caballito | RECORDED-MAIN |
| `/audio/voz/vocabulario/avión.mp3` | avión | RECORDED-MAIN |
| `/audio/voz/vocabulario/barril.mp3` | barril | RECORDED-MAIN |
| `/audio/voz/vocabulario/bate.mp3` | bate | RECORDED-MAIN |
| `/audio/voz/vocabulario/beba.mp3` | beba | RECORDED-MAIN |
| `/audio/voz/vocabulario/bebita.mp3` | bebita | RECORDED-MAIN |
| `/audio/voz/vocabulario/bebé.mp3` | bebé | RECORDED-MAIN |
| `/audio/voz/vocabulario/bota.mp3` | bota | RECORDED-MAIN |
| `/audio/voz/vocabulario/brujita.mp3` | brujita | RECORDED-MAIN |
| `/audio/voz/vocabulario/bubi.mp3` | bubi | RECORDED-MAIN |
| `/audio/voz/vocabulario/burro.mp3` | burro | RECORDED-MAIN |
| `/audio/voz/vocabulario/carro.mp3` | carro | RECORDED-MAIN |
| `/audio/voz/vocabulario/carrusel.mp3` | carrusel | RECORDED-MAIN |
| `/audio/voz/vocabulario/casa.mp3` | casa | RECORDED-MAIN |
| `/audio/voz/vocabulario/catalina.mp3` | catalina | RECORDED-MAIN |
| `/audio/voz/vocabulario/conejo.mp3` | conejo | RECORDED-MAIN |
| `/audio/voz/vocabulario/cubo.mp3` | cubo | RECORDED-MAIN |
| `/audio/voz/vocabulario/cuna.mp3` | cuna | RECORDED-MAIN |
| `/audio/voz/vocabulario/dado.mp3` | dado | RECORDED-MAIN |
| `/audio/voz/vocabulario/dados.mp3` | dados | RECORDED-MAIN |
| `/audio/voz/vocabulario/dedo.mp3` | dedo | RECORDED-MAIN |
| `/audio/voz/vocabulario/didi.mp3` | didi | RECORDED-MAIN |
| `/audio/voz/vocabulario/doce.mp3` | doce | RECORDED-MAIN |
| `/audio/voz/vocabulario/dulce.mp3` | dulce | RECORDED-MAIN |
| `/audio/voz/vocabulario/dunia.mp3` | dunia | RECORDED-MAIN |
| `/audio/voz/vocabulario/elefante.mp3` | elefante | RECORDED-MAIN |
| `/audio/voz/vocabulario/ema.mp3` | ema | RECORDED-MAIN |
| `/audio/voz/vocabulario/erizo.mp3` | erizo | RECORDED-MAIN |
| `/audio/voz/vocabulario/escalera.mp3` | escalera | RECORDED-MAIN |
| `/audio/voz/vocabulario/escoba.mp3` | escoba | RECORDED-MAIN |
| `/audio/voz/vocabulario/escuela.mp3` | escuela | RECORDED-MAIN |
| `/audio/voz/vocabulario/espejo.mp3` | espejo | RECORDED-MAIN |
| `/audio/voz/vocabulario/estrella.mp3` | estrella | RECORDED-MAIN |
| `/audio/voz/vocabulario/familia.mp3` | familia | RECORDED-MAIN |
| `/audio/voz/vocabulario/felo.mp3` | felo | RECORDED-MAIN |
| `/audio/voz/vocabulario/fideos.mp3` | fideos | RECORDED-MAIN |
| `/audio/voz/vocabulario/fiesta.mp3` | fiesta | RECORDED-MAIN |
| `/audio/voz/vocabulario/foto.mp3` | foto | RECORDED-MAIN |
| `/audio/voz/vocabulario/funda.mp3` | funda | RECORDED-MAIN |
| `/audio/voz/vocabulario/gato.mp3` | gato | RECORDED-MAIN |
| `/audio/voz/vocabulario/gaveta.mp3` | gaveta | RECORDED-MAIN |
| `/audio/voz/vocabulario/globo.mp3` | globo | RECORDED-MAIN |
| `/audio/voz/vocabulario/goloso.mp3` | goloso | RECORDED-MAIN |
| `/audio/voz/vocabulario/gorra.mp3` | gorra | RECORDED-MAIN |
| `/audio/voz/vocabulario/gusano.mp3` | gusano | RECORDED-MAIN |
| `/audio/voz/vocabulario/hermanitas-vocales.mp3` | hermanitas vocales | RECORDED-MAIN |
| `/audio/voz/vocabulario/iglesia.mp3` | iglesia | RECORDED-MAIN |
| `/audio/voz/vocabulario/iglú.mp3` | iglú | RECORDED-MAIN |
| `/audio/voz/vocabulario/igual.mp3` | igual | RECORDED-MAIN |
| `/audio/voz/vocabulario/iguana.mp3` | iguana | RECORDED-MAIN |
| `/audio/voz/vocabulario/imán.mp3` | imán | RECORDED-MAIN |
| `/audio/voz/vocabulario/indio.mp3` | indio | RECORDED-MAIN |
| `/audio/voz/vocabulario/insecto.mp3` | insecto | RECORDED-MAIN |
| `/audio/voz/vocabulario/invierno.mp3` | invierno | RECORDED-MAIN |
| `/audio/voz/vocabulario/irma.mp3` | irma | RECORDED-MAIN |
| `/audio/voz/vocabulario/isla.mp3` | isla | RECORDED-MAIN |
| `/audio/voz/vocabulario/jarra.mp3` | jarra | RECORDED-MAIN |
| `/audio/voz/vocabulario/jesús.mp3` | jesús | RECORDED-MAIN |
| `/audio/voz/vocabulario/jicotea.mp3` | jicotea | RECORDED-MAIN |
| `/audio/voz/vocabulario/jirafa.mp3` | jirafa | RECORDED-MAIN |
| `/audio/voz/vocabulario/jugo.mp3` | jugo | RECORDED-MAIN |
| `/audio/voz/vocabulario/lala.mp3` | lala | RECORDED-MAIN |
| `/audio/voz/vocabulario/lata.mp3` | lata | RECORDED-MAIN |
| `/audio/voz/vocabulario/libro.mp3` | libro | RECORDED-MAIN |
| `/audio/voz/vocabulario/loma.mp3` | loma | RECORDED-MAIN |
| `/audio/voz/vocabulario/luli.mp3` | luli | RECORDED-MAIN |
| `/audio/voz/vocabulario/mago.mp3` | mago | RECORDED-MAIN |
| `/audio/voz/vocabulario/maleta.mp3` | maleta | RECORDED-MAIN |
| `/audio/voz/vocabulario/mamá.mp3` | mamá | RECORDED-MAIN |
| `/audio/voz/vocabulario/manzana.mp3` | manzana | RECORDED-MAIN |
| `/audio/voz/vocabulario/mayúscula.mp3` | mayúscula | RECORDED-MAIN |
| `/audio/voz/vocabulario/maíz.mp3` | maíz | RECORDED-MAIN |
| `/audio/voz/vocabulario/meme.mp3` | meme | RECORDED-MAIN |
| `/audio/voz/vocabulario/meñe.mp3` | meñe | RECORDED-MAIN |
| `/audio/voz/vocabulario/mima.mp3` | mima | RECORDED-MAIN |
| `/audio/voz/vocabulario/mono.mp3` | mono | RECORDED-MAIN |
| `/audio/voz/vocabulario/moño.mp3` | moño | RECORDED-MAIN |
| `/audio/voz/vocabulario/mumi.mp3` | mumi | RECORDED-MAIN |
| `/audio/voz/vocabulario/napi.mp3` | napi | RECORDED-MAIN |
| `/audio/voz/vocabulario/nido.mp3` | nido | RECORDED-MAIN |
| `/audio/voz/vocabulario/nina-enfermita.mp3` | nina enfermita | RECORDED-MAIN |
| `/audio/voz/vocabulario/nina-llorona.mp3` | nina llorona | RECORDED-MAIN |
| `/audio/voz/vocabulario/niñito.mp3` | niñito | RECORDED-MAIN |
| `/audio/voz/vocabulario/niño.mp3` | niño | RECORDED-MAIN |
| `/audio/voz/vocabulario/nudo.mp3` | nudo | RECORDED-MAIN |
| `/audio/voz/vocabulario/ocho.mp3` | ocho | RECORDED-MAIN |
| `/audio/voz/vocabulario/ojos.mp3` | ojos | RECORDED-MAIN |
| `/audio/voz/vocabulario/ola.mp3` | ola | RECORDED-MAIN |
| `/audio/voz/vocabulario/olla.mp3` | olla | RECORDED-MAIN |
| `/audio/voz/vocabulario/oreja.mp3` | oreja | RECORDED-MAIN |
| `/audio/voz/vocabulario/oruga.mp3` | oruga | RECORDED-MAIN |
| `/audio/voz/vocabulario/oso.mp3` | oso | RECORDED-MAIN |
| `/audio/voz/vocabulario/oto.mp3` | oto | RECORDED-MAIN |
| `/audio/voz/vocabulario/oveja.mp3` | oveja | RECORDED-MAIN |
| `/audio/voz/vocabulario/papá.mp3` | papá | RECORDED-MAIN |
| `/audio/voz/vocabulario/pavo.mp3` | pavo | RECORDED-MAIN |
| `/audio/voz/vocabulario/pepe.mp3` | pepe | RECORDED-MAIN |
| `/audio/voz/vocabulario/pera.mp3` | pera | RECORDED-MAIN |
| `/audio/voz/vocabulario/perro.mp3` | perro | RECORDED-MAIN |
| `/audio/voz/vocabulario/pie.mp3` | pie | RECORDED-MAIN |
| `/audio/voz/vocabulario/pisa.mp3` | pisa | RECORDED-MAIN |
| `/audio/voz/vocabulario/piñata.mp3` | piñata | RECORDED-MAIN |
| `/audio/voz/vocabulario/pomo.mp3` | pomo | RECORDED-MAIN |
| `/audio/voz/vocabulario/puma.mp3` | puma | RECORDED-MAIN |
| `/audio/voz/vocabulario/pájaro.mp3` | pájaro | RECORDED-MAIN |
| `/audio/voz/vocabulario/rana.mp3` | rana | RECORDED-MAIN |
| `/audio/voz/vocabulario/remo.mp3` | remo | RECORDED-MAIN |
| `/audio/voz/vocabulario/remos.mp3` | remos | RECORDED-MAIN |
| `/audio/voz/vocabulario/rita.mp3` | rita | RECORDED-MAIN |
| `/audio/voz/vocabulario/rosa.mp3` | rosa | RECORDED-MAIN |
| `/audio/voz/vocabulario/rueda.mp3` | rueda | RECORDED-MAIN |
| `/audio/voz/vocabulario/sapo.mp3` | sapo | RECORDED-MAIN |
| `/audio/voz/vocabulario/sesi.mp3` | sesi | RECORDED-MAIN |
| `/audio/voz/vocabulario/sopa.mp3` | sopa | RECORDED-MAIN |
| `/audio/voz/vocabulario/susi.mp3` | susi | RECORDED-MAIN |
| `/audio/voz/vocabulario/tapa.mp3` | tapa | RECORDED-MAIN |
| `/audio/voz/vocabulario/taza.mp3` | taza | RECORDED-MAIN |
| `/audio/voz/vocabulario/tenedor.mp3` | tenedor | RECORDED-MAIN |
| `/audio/voz/vocabulario/tierra.mp3` | tierra | RECORDED-MAIN |
| `/audio/voz/vocabulario/tipi.mp3` | tipi | RECORDED-MAIN |
| `/audio/voz/vocabulario/tomate.mp3` | tomate | RECORDED-MAIN |
| `/audio/voz/vocabulario/topo.mp3` | topo | RECORDED-MAIN |
| `/audio/voz/vocabulario/torre.mp3` | torre | RECORDED-MAIN |
| `/audio/voz/vocabulario/tuto.mp3` | tuto | RECORDED-MAIN |
| `/audio/voz/vocabulario/ulises.mp3` | ulises | RECORDED-MAIN |
| `/audio/voz/vocabulario/unicornio.mp3` | unicornio | RECORDED-MAIN |
| `/audio/voz/vocabulario/uniforme.mp3` | uniforme | RECORDED-MAIN |
| `/audio/voz/vocabulario/uno.mp3` | uno | RECORDED-MAIN |
| `/audio/voz/vocabulario/urraca.mp3` | urraca | RECORDED-MAIN |
| `/audio/voz/vocabulario/uva.mp3` | uva | RECORDED-MAIN |
| `/audio/voz/vocabulario/uvas.mp3` | uvas | RECORDED-MAIN |
| `/audio/voz/vocabulario/uña.mp3` | uña | RECORDED-MAIN |
| `/audio/voz/vocabulario/vaso.mp3` | vaso | RECORDED-MAIN |
| `/audio/voz/vocabulario/vela.mp3` | vela | RECORDED-MAIN |
| `/audio/voz/vocabulario/vita.mp3` | vita | RECORDED-MAIN |
| `/audio/voz/vocabulario/vuli.mp3` | vuli | RECORDED-MAIN |
| `/audio/voz/vocabulario/yate.mp3` | yate | RECORDED-MAIN |
| `/audio/voz/vocabulario/yayita.mp3` | yayita | RECORDED-MAIN |
| `/audio/voz/vocabulario/yema.mp3` | yema | RECORDED-MAIN |
| `/audio/voz/vocabulario/yoyo.mp3` | yoyo | RECORDED-MAIN |
| `/audio/voz/vocabulario/zapato.mp3` | zapato | RECORDED-MAIN |
| `/audio/voz/vocabulario/zepelín.mp3` | zepelín | RECORDED-MAIN |
| `/audio/voz/vocabulario/zig-zag.mp3` | zig-zag | RECORDED-MAIN |
| `/audio/voz/vocabulario/zorro.mp3` | zorro | RECORDED-MAIN |
| `/audio/voz/vocabulario/zulema.mp3` | zulema | RECORDED-MAIN |
| `/audio/voz/vocabulario/águila.mp3` | águila | RECORDED-MAIN |
| `/audio/voz/vocabulario/árbol.mp3` | árbol | RECORDED-MAIN |
| `/audio/voz/vocabulario/ñuno.mp3` | ñuno | RECORDED-MAIN |

## 4. Games and activities

### Mariposas (Butterfly Garden) — p (`mariposas-p`) — source `src/content/games/core-games.ts`

| File | Function | Exact Spanish | Status |
|---|---|---|---|
| `/audio/games/mariposas-p/instruction-01.mp3` (proposed path) | Instruction 1 | Escucha la palabra. | MISSING |
| `/audio/games/mariposas-p/instruction-02.mp3` (proposed path) | Instruction 2 | Presiona la primera sílaba que necesitas para formar la palabra. | MISSING |
| `/audio/games/mariposas-p/instruction-03.mp3` (proposed path) | Instruction 3 | Presiona la otra sílaba o las otras sílabas que forman la palabra. | MISSING |
| `/audio/games/mariposas-p/instruction-04.mp3` (proposed path) | Instruction 4 | Completa la palabra para que las mariposas regresen al jardín. | MISSING |
| `/audio/voz/vocabulario/papi.mp3` | Word | papi | MISSING |
| `/audio/voz/vocabulario/papá.mp3` | Word | papá | RECORDED-MAIN |
| `/audio/voz/vocabulario/pomo.mp3` | Word | pomo | RECORDED-MAIN |

### Juego de la vocal A (`vocal-a`) — source `src/content/games/core-games.ts`

| File | Function | Exact Spanish | Status |
|---|---|---|---|
| `/audio/games/vocal-a/instruction-01.mp3` (proposed path) | Instruction 1 | Presiona cada dibujo y observa la palabra. | MISSING |
| `/audio/games/vocal-a/instruction-02.mp3` (proposed path) | Instruction 2 | Elige si la palabra comienza con Aa. | MISSING |
| `/audio/games/vocal-a/instruction-03.mp3` (proposed path) | Instruction 3 | El cuadro se marca en verde si está correcto y en rojo si está incorrecto. | MISSING |
| `/audio/voz/vocabulario/abeja.mp3` | Word | abeja | RECORDED-MAIN |
| `/audio/voz/vocabulario/aguja.mp3` | Word | aguja | RECORDED-MAIN |
| `/audio/voz/vocabulario/oso.mp3` | Word | oso | RECORDED-MAIN |
| `/audio/voz/vocabulario/ola.mp3` | Word | ola | RECORDED-MAIN |
| `/audio/voz/vocabulario/oveja.mp3` | Word | oveja | RECORDED-MAIN |

### Fonética — p (`fonetica-p`) — source `src/content/games/core-games.ts`

| File | Function | Exact Spanish | Status |
|---|---|---|---|
| `/audio/games/fonetica-p/instruction-01.mp3` (proposed path) | Instruction 1 | ¡A completar las palabras! | MISSING |
| `/audio/games/fonetica-p/instruction-02.mp3` (proposed path) | Instruction 2 | Observa la palabra incompleta. | MISSING |
| `/audio/games/fonetica-p/instruction-03.mp3` (proposed path) | Instruction 3 | Presiona la sílaba correcta para completar la palabra. | MISSING |
| `/audio/voz/vocabulario/papi.mp3` | Word | papi | MISSING |
| `/audio/voz/vocabulario/papá.mp3` | Word | papá | RECORDED-MAIN |
| `/audio/voz/vocabulario/pomo.mp3` | Word | pomo | RECORDED-MAIN |

### Rima — p (`rima-p`) — source `src/content/games/core-games.ts`

| File | Function | Exact Spanish | Status |
|---|---|---|---|
| `/audio/games/rima-p/instruction-01.mp3` (proposed path) | Instruction 1 | Lee la palabra modelo. | MISSING |
| `/audio/games/rima-p/instruction-02.mp3` (proposed path) | Instruction 2 | Busca otra palabra que termine con la misma sílaba. | MISSING |
| `/audio/games/rima-p/instruction-03.mp3` (proposed path) | Instruction 3 | Presiona la palabra que rima. | MISSING |
| `/audio/voz/vocabulario/papi.mp3` | Word | papi | MISSING |
| `/audio/voz/vocabulario/pepi.mp3` | Word | Pepi | MISSING |
| `/audio/voz/vocabulario/pipo.mp3` | Word | Pipo | MISSING |
| `/audio/voz/vocabulario/mapo.mp3` | Word | mapo | MISSING |

### Palabras por minuto — p (`palabras-minuto-p`) — source `src/content/games/core-games.ts`

| File | Function | Exact Spanish | Status |
|---|---|---|---|
| `/audio/games/palabras-minuto-p/instruction-01.mp3` (proposed path) | Instruction 1 | ¿Cuántas palabras puedo leer por minuto? | MISSING |
| `/audio/games/palabras-minuto-p/instruction-02.mp3` (proposed path) | Instruction 2 | Lee cada palabra. | MISSING |
| `/audio/games/palabras-minuto-p/instruction-03.mp3` (proposed path) | Instruction 3 | Antes de comenzar, ajusta el cronómetro y presiona Empezar. | MISSING |
| `/audio/voz/vocabulario/papá.mp3` | Word | papá | RECORDED-MAIN |
| `/audio/voz/vocabulario/pepi.mp3` | Word | Pepi | MISSING |
| `/audio/voz/vocabulario/pomo.mp3` | Word | pomo | RECORDED-MAIN |
| `/audio/voz/vocabulario/papi.mp3` | Word | papi | MISSING |
| `/audio/voz/vocabulario/puma.mp3` | Word | puma | RECORDED-MAIN |
| `/audio/voz/vocabulario/yo.mp3` | Word | yo | MISSING |
| `/audio/voz/vocabulario/pepe.mp3` | Word | Pepe | RECORDED-MAIN |
| `/audio/voz/vocabulario/mupi.mp3` | Word | Mupi | MISSING |
| `/audio/voz/vocabulario/pipa.mp3` | Word | pipa | MISSING |
| `/audio/voz/vocabulario/pipo.mp3` | Word | Pipo | MISSING |
| `/audio/voz/vocabulario/mapa.mp3` | Word | mapa | MISSING |
| `/audio/voz/vocabulario/púa.mp3` | Word | púa | MISSING |
| `/audio/voz/vocabulario/pupi.mp3` | Word | Pupi | MISSING |
| `/audio/voz/vocabulario/upa.mp3` | Word | ¡upa! | MISSING |
| `/audio/voz/vocabulario/popi.mp3` | Word | Popi | MISSING |
| `/audio/voz/vocabulario/mapi.mp3` | Word | Mapi | MISSING |
| `/audio/voz/vocabulario/pie.mp3` | Word | pie | RECORDED-MAIN |
| `/audio/voz/vocabulario/mapo.mp3` | Word | mapo | MISSING |

### Dibujos — o (`dibujos-o`) — source `src/content/games/core-games.ts`

| File | Function | Exact Spanish | Status |
|---|---|---|---|
| `/audio/games/dibujos-o/instruction-01.mp3` (proposed path) | Instruction 1 | Lee la palabra. | MISSING |
| `/audio/games/dibujos-o/instruction-02.mp3` (proposed path) | Instruction 2 | Presiona el dibujo que representa esa palabra. | MISSING |
| `/audio/games/dibujos-o/instruction-03.mp3` (proposed path) | Instruction 3 | Continúa hasta completar todos los dibujos. | MISSING |
| `/audio/voz/vocabulario/oso.mp3` | Word | oso | RECORDED-MAIN |
| `/audio/voz/vocabulario/ola.mp3` | Word | ola | RECORDED-MAIN |
| `/audio/voz/vocabulario/oveja.mp3` | Word | oveja | RECORDED-MAIN |

### Payaso Chano — s/m/p (`payaso-chano-ss`) — source `src/content/games/payaso-chano-ss.ts`

| File | Function | Exact Spanish | Status |
|---|---|---|---|
| `/audio/games/payaso-chano-ss/instruction-01.mp3` (proposed path) | Instruction 1 | Presiona el símbolo de audio para escuchar la palabra. | MISSING |
| `/audio/games/payaso-chano-ss/instruction-02.mp3` (proposed path) | Instruction 2 | Arrastra la sílaba que necesitas para comenzar a formar la palabra. | MISSING |
| `/audio/games/payaso-chano-ss/instruction-03.mp3` (proposed path) | Instruction 3 | Colócala en la pizarra de Chano el payaso maestro. | MISSING |
| `/audio/games/payaso-chano-ss/instruction-04.mp3` (proposed path) | Instruction 4 | Arrastra y coloca las sílabas que necesitas para completar la palabra. | MISSING |
| `/audio/games/payaso-chano-ss/instruction-05.mp3` (proposed path) | Instruction 5 | Presiona la sombrilla para comprobar la palabra. | MISSING |
| `/audio/games/payaso-chano-ss/instruction-06.mp3` (proposed path) | Instruction 6 | Presiona el resorte para colocar las sílabas en su lugar otra vez. | MISSING |
| `/audio/games/payaso-chano-ss/instruction-07.mp3` (proposed path) | Instruction 7 | Presiona a Chano el payaso maestro para escuchar la próxima palabra. | MISSING |
| `/audio/voz/vocabulario/paso.mp3` | Word | paso | MISSING |
| `/audio/voz/vocabulario/mesa.mp3` | Word | mesa | MISSING |
| `/audio/voz/vocabulario/supo.mp3` | Word | supo | MISSING |
| `/audio/voz/vocabulario/asoma.mp3` | Word | asoma | MISSING |
| `/audio/voz/vocabulario/sopa.mp3` | Word | sopa | RECORDED-MAIN |
| `/audio/voz/vocabulario/suma.mp3` | Word | suma | MISSING |
| `/audio/voz/vocabulario/sapo.mp3` | Word | sapo | RECORDED-MAIN |
| `/audio/voz/vocabulario/puso.mp3` | Word | puso | MISSING |

### Vacas (Cow Game) — m (`cow-game-m`) — source `src/content/games/cow-game.ts`

| File | Function | Exact Spanish | Status |
|---|---|---|---|
| `/audio/games/cow-game-m/instruction.mp3` | Instruction 1 | Coloca cada vaca en su sílaba | MISSING |
| `/audio/games/cow-game-m/correct.mp3` | correct | ma ma | MISSING |
| `/audio/games/cow-game-m/wrong.mp3` | wrong — technical: a cow sound effect, not Gretel speech; leave it out of the voice session | moo (cow sound) | MISSING |
| `/audio/games/cow-game-m/mo.mp3` | syllable-mo | mo | MISSING |
| `/audio/games/cow-game-m/mu.mp3` | syllable-mu | mu | MISSING |
| `/audio/games/cow-game-m/ma.mp3` | syllable-ma | ma | MISSING |
| `/audio/games/cow-game-m/mi.mp3` | syllable-mi | mi | MISSING |
| `/audio/games/cow-game-m/me.mp3` | syllable-me | me | MISSING |
| `/audio/games/cow-game-m/ma-accent.mp3` | syllable-ma-accent | má | MISSING |

### Completar palabras — Mm (`completar-palabras`) — source `src/content/games/completar-palabras.ts`

| File | Function | Exact Spanish | Status |
|---|---|---|---|
| `/audio/games/completar-palabras/instruction-01.mp3` (proposed path) | Instruction 1 | Presiona el símbolo de audio para escuchar las instrucciones. | MISSING |
| `/audio/games/completar-palabras/instruction-02.mp3` (proposed path) | Instruction 2 | ¡A completar las palabras! | MISSING |
| `/audio/games/completar-palabras/instruction-03.mp3` (proposed path) | Instruction 3 | Presiona cada caja para escuchar la palabra. | MISSING |
| `/audio/games/completar-palabras/instruction-04.mp3` (proposed path) | Instruction 4 | Arrastra la sílaba correcta para completar la palabra. | MISSING |
| `/audio/voz/vocabulario/momi.mp3` | Word | Momi | MISSING |
| `/audio/voz/vocabulario/memo.mp3` | Word | Memo | MISSING |
| `/audio/voz/vocabulario/amo.mp3` | Word | amo | RECORDED-MAIN |
| `/audio/voz/vocabulario/mumi.mp3` | Word | Mumi | RECORDED-MAIN |
| `/audio/voz/vocabulario/mima.mp3` | Word | mima | RECORDED-MAIN |
| `/audio/voz/vocabulario/mamá.mp3` | Word | mamá | RECORDED-MAIN |

### Sílabas — o (`silabas-o`) — source `src/content/games/syllable-builder-pilot.ts`

| File | Function | Exact Spanish | Status |
|---|---|---|---|
| `/audio/games/silabas-o/instruction-01.mp3` (proposed path) | Instruction 1 | Mira el dibujo y escucha la palabra. | MISSING |
| `/audio/games/silabas-o/instruction-02.mp3` (proposed path) | Instruction 2 | Arrastra las sílabas hasta las casillas, en orden. | MISSING |
| `/audio/games/silabas-o/instruction-03.mp3` (proposed path) | Instruction 3 | Cuando la palabra esté completa, toca Comprobar. | MISSING |
| `/audio/voz/vocabulario/oso.mp3` | Word | oso | RECORDED-MAIN |
| `/audio/voz/vocabulario/ola.mp3` | Word | ola | RECORDED-MAIN |
| `/audio/voz/vocabulario/oveja.mp3` | Word | oveja | RECORDED-MAIN |

### Sílabas — m (`silabas-m`) — source `src/content/games/syllable-builder-pilot.ts`

| File | Function | Exact Spanish | Status |
|---|---|---|---|
| `/audio/games/silabas-m/instruction-01.mp3` (proposed path) | Instruction 1 | Mira el dibujo y escucha la palabra. | MISSING |
| `/audio/games/silabas-m/instruction-02.mp3` (proposed path) | Instruction 2 | Arrastra las sílabas hasta las casillas, en orden. | MISSING |
| `/audio/games/silabas-m/instruction-03.mp3` (proposed path) | Instruction 3 | Cuando la palabra esté completa, toca Comprobar. | MISSING |
| `/audio/voz/vocabulario/mamá.mp3` | Word | mamá | RECORDED-MAIN |
| `/audio/voz/vocabulario/mono.mp3` | Word | mono | RECORDED-MAIN |

### Sílabas — p (`silabas-p`) — source `src/content/games/syllable-builder-pilot.ts`

| File | Function | Exact Spanish | Status |
|---|---|---|---|
| `/audio/games/silabas-p/instruction-01.mp3` (proposed path) | Instruction 1 | Mira el dibujo y escucha la palabra. | MISSING |
| `/audio/games/silabas-p/instruction-02.mp3` (proposed path) | Instruction 2 | Arrastra las sílabas hasta las casillas, en orden. | MISSING |
| `/audio/games/silabas-p/instruction-03.mp3` (proposed path) | Instruction 3 | Cuando la palabra esté completa, toca Comprobar. | MISSING |
| `/audio/voz/vocabulario/papá.mp3` | Word | papá | RECORDED-MAIN |
| `/audio/voz/vocabulario/sopa.mp3` | Word | sopa | RECORDED-MAIN |

## 5. Gretel feedback and interface lines (Workbook, games, Tutor)

Main uses `src/content/gretel-feedback.ts` phrases through `useGretelEvents.ts` → `speakGretelPhrase` → `speakAsGretel`. The provider is `recorded-audio`, and no phrase has a recording mapped to it, so **all of these are silent today** (correct, per policy).

| File (proposed path) | Event | Exact Spanish | Status |
|---|---|---|---|
| `/audio/voz/feedback/correct-01.mp3` | correct | ¡Muy bien! | RECORDED-UNMERGED candidate: `/audio/leccion3/muy-bien.mp3` (#1058) |
| `/audio/voz/feedback/correct-02.mp3` | correct | ¡Así es! | MISSING |
| `/audio/voz/feedback/correct-03.mp3` | correct | ¡Perfecto! | MISSING |
| `/audio/voz/feedback/correct-04.mp3` | correct | ¡Excelente! | MISSING |
| `/audio/voz/feedback/correct-05.mp3` | correct | ¡Lo lograste! | MISSING |
| `/audio/voz/feedback/close-01.mp3` | close | Casi, intenta de nuevo. | MISSING |
| `/audio/voz/feedback/close-02.mp3` | close | Ya casi. Una vez más. | MISSING |
| `/audio/voz/feedback/close-03.mp3` | close | Estás cerca. Vuelve a probar. | MISSING |
| `/audio/voz/feedback/try-again-01.mp3` | try-again | Intentémoslo otra vez. | MISSING |
| `/audio/voz/feedback/try-again-02.mp3` | try-again | Sin prisa. Vuelve a intentarlo. | MISSING |
| `/audio/voz/feedback/try-again-03.mp3` | try-again | Con calma. Vuelve a intentarlo. | MISSING |
| `/audio/voz/feedback/streak-01.mp3` | streak | ¡Vas en racha! | MISSING |
| `/audio/voz/feedback/streak-02.mp3` | streak | ¡Sigue así! | MISSING |
| `/audio/voz/feedback/streak-03.mp3` | streak | ¡Imparable! | MISSING |
| `/audio/voz/feedback/lesson-complete-01.mp3` | lesson-complete | ¡Terminaste la lección! | MISSING |
| `/audio/voz/feedback/lesson-complete-02.mp3` | lesson-complete | ¡Gran trabajo en toda la lección! | MISSING |
| `/audio/voz/feedback/lesson-complete-03.mp3` | lesson-complete | ¡Lo lograste! A la siguiente. | MISSING |
| `/audio/voz/feedback/start-01.mp3` | start | ¡Hola! Soy Gretel. | MISSING |
| `/audio/voz/feedback/start-02.mp3` | start | Empecemos juntos. | MISSING |
| `/audio/voz/feedback/start-03.mp3` | start | Vamos a leer. | MISSING |

Interface lines from the Nov 14 handoff (`AUDIO-SCRIPTS-INTERFACE.csv`):

| File (proposed path) | ID / event | Exact Spanish | Wording basis | Status |
|---|---|---|---|---|
| `/audio/voz/interfaz/ui-001.mp3` | UI-001 · Correct answer | Buen trabajo. | Existing STUDENT_INTERACTION_STANDARD wording | MISSING |
| `/audio/voz/interfaz/ui-002.mp3` | UI-002 · Wrong answer/retry | Vamos a intentarlo otra vez. | Owner-requested wording from session context; latest owner preference | MISSING |
| `/audio/voz/interfaz/ui-003.mp3` | UI-003 · Legacy wrong-answer reference | Inténtalo otra vez. | Current repository standard; differs from requested UI-002 | MISSING |
| `/audio/voz/interfaz/ui-004.mp3` | UI-004 · Page complete | Muy bien. Terminaste esta página. | PROPOSED interface line; not book text or approved recording | DRAFT WORDING — approve first |
| `/audio/voz/interfaz/ui-005.mp3` | UI-005 · Before turn | Vamos a pasar la página. | PROPOSED interface line; optional, not mandatory narration | DRAFT WORDING — approve first |
| `/audio/voz/interfaz/ui-006.mp3` | UI-006 · Try again after erasure | Puedes intentarlo otra vez. | PROPOSED optional alternative; avoid duplicate retry speech | DRAFT WORDING — approve first |

> **Owner decision (wording conflict):** for retry, main uses “Intentémoslo otra vez.”, the standard says “Inténtalo otra vez.” (UI-003), and the Nov 14 request was “Vamos a intentarlo otra vez.” (UI-002). Choose one before recording.

## 6. Offline Gretel Tutor (Lessons 1–3) — from [PR #1073](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1073) `src/content/tutor-lines.json` (draft, frozen)

There are 43 word-model lines already approved; they reuse the picture recordings in section 3. The table lists the 77 **pending** lines, word for word. Lines tagged `[DRAFT — owner to approve]` were written by the Tutor agent and still need your wording approval. Remove the tag before recording.

| File (proposed path) | Line ID | Lesson | Role | Exact Spanish | Status |
|---|---|---|---|---|---|
| `/audio/voz/tutor/leccion-1/l1-greeting-first-01.mp3` | l1-greeting-first-01 | 1 | greeting-first | ¡Hola! Vamos a conocer las vocales. | MISSING |
| `/audio/voz/tutor/leccion-1/l1-greeting-first-02.mp3` | l1-greeting-first-02 | 1 | greeting-first | ¡Hola! Soy Gretel. Vamos a aprender las vocales: a, e, i, o, u. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/leccion-1/l1-greeting-first-03.mp3` | l1-greeting-first-03 | 1 | greeting-first | ¡Hola, amiguito! Hoy empezamos con las vocales. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/leccion-2/l2-greeting-first-01.mp3` | l2-greeting-first-01 | 2 | greeting-first | ¡Hola! Vamos a la lección de la vocal O. | MISSING |
| `/audio/voz/tutor/leccion-2/l2-greeting-first-02.mp3` | l2-greeting-first-02 | 2 | greeting-first | ¡Hola! Hoy practicamos la vocal O. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/leccion-2/l2-greeting-first-03.mp3` | l2-greeting-first-03 | 2 | greeting-first | ¡Qué bueno verte! Vamos a seguir con la vocal O. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/leccion-3/l3-greeting-first-01.mp3` | l3-greeting-first-01 | 3 | greeting-first | ¡Hola! Vamos a la lección de la vocal A. | MISSING |
| `/audio/voz/tutor/leccion-3/l3-greeting-first-02.mp3` | l3-greeting-first-02 | 3 | greeting-first | ¡Hola! Hoy practicamos la vocal A. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/leccion-3/l3-greeting-first-03.mp3` | l3-greeting-first-03 | 3 | greeting-first | ¡Qué bueno verte! Vamos a seguir con la vocal A. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-greeting-return-01.mp3` | l0-greeting-return-01 | shared | greeting-return | Bienvenidos a la Cartilla de Gretel. Vamos a aprender a leer juntos. | MISSING |
| `/audio/voz/tutor/compartido/l0-greeting-return-02.mp3` | l0-greeting-return-02 | shared | greeting-return | ¡Hola otra vez! Seguimos aprendiendo a leer juntos. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-greeting-return-03.mp3` | l0-greeting-return-03 | shared | greeting-return | ¡Qué bueno verte de nuevo! Vamos a continuar. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-praise-01.mp3` | l0-praise-01 | shared | praise | ¡Muy bien! | MISSING |
| `/audio/voz/tutor/compartido/l0-praise-02.mp3` | l0-praise-02 | shared | praise | ¡Excelente! | MISSING |
| `/audio/voz/tutor/compartido/l0-praise-03.mp3` | l0-praise-03 | shared | praise | ¡Lo lograste! | MISSING |
| `/audio/voz/tutor/compartido/l0-praise-04.mp3` | l0-praise-04 | shared | praise | ¡Qué bien! | MISSING |
| `/audio/voz/tutor/compartido/l0-praise-05.mp3` | l0-praise-05 | shared | praise | Buen trabajo. | MISSING |
| `/audio/voz/tutor/compartido/l0-praise-06.mp3` | l0-praise-06 | shared | praise | ¡Perfecto! | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-praise-07.mp3` | l0-praise-07 | shared | praise | ¡Eso es! | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-praise-08.mp3` | l0-praise-08 | shared | praise | ¡Muy bien hecho! | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-praise-09.mp3` | l0-praise-09 | shared | praise | ¡Sigue así! | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-praise-10.mp3` | l0-praise-10 | shared | praise | ¡Genial! | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-praise-11.mp3` | l0-praise-11 | shared | praise | ¡Correcto! | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-praise-12.mp3` | l0-praise-12 | shared | praise | ¡Tú sí puedes! | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-praise-streak-01.mp3` | l0-praise-streak-01 | shared | praise-streak | ¡Vas volando! | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-praise-streak-02.mp3` | l0-praise-streak-02 | shared | praise-streak | ¡Qué racha tan buena! | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-praise-streak-03.mp3` | l0-praise-streak-03 | shared | praise-streak | ¡Muchas correctas seguidas! | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-praise-streak-04.mp3` | l0-praise-streak-04 | shared | praise-streak | ¡Eres una estrella! | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-praise-after-retry-01.mp3` | l0-praise-after-retry-01 | shared | praise-after-retry | ¡Lo lograste! Lo intentaste otra vez y pudiste. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-praise-after-retry-02.mp3` | l0-praise-after-retry-02 | shared | praise-after-retry | ¡Eso es! No te rendiste. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-praise-after-retry-03.mp3` | l0-praise-after-retry-03 | shared | praise-after-retry | ¡Muy bien! Te costó, pero lo conseguiste. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-praise-after-retry-04.mp3` | l0-praise-after-retry-04 | shared | praise-after-retry | ¡Bien por ti! Cada vez te sale mejor. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-close-miss-01.mp3` | l0-close-miss-01 | shared | close-miss | Casi casi. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-close-miss-02.mp3` | l0-close-miss-02 | shared | close-miss | Uy, casi. Un poquito más. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-close-miss-03.mp3` | l0-close-miss-03 | shared | close-miss | Tan cerquita. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-close-miss-04.mp3` | l0-close-miss-04 | shared | close-miss | Por poquito. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-try-again-01.mp3` | l0-try-again-01 | shared | try-again | Inténtalo otra vez. | MISSING |
| `/audio/voz/tutor/compartido/l0-try-again-02.mp3` | l0-try-again-02 | shared | try-again | Casi. Prueba otra vez. | MISSING |
| `/audio/voz/tutor/compartido/l0-try-again-03.mp3` | l0-try-again-03 | shared | try-again | Tú puedes. | MISSING |
| `/audio/voz/tutor/compartido/l0-try-again-04.mp3` | l0-try-again-04 | shared | try-again | No pasa nada. Inténtalo de nuevo. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-try-again-05.mp3` | l0-try-again-05 | shared | try-again | Otra vez, con calma. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-try-again-06.mp3` | l0-try-again-06 | shared | try-again | Una vez más, tú puedes. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-confusion-a.mp3` | l0-confusion-a | shared | confusion | Esa es la A. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-confusion-e.mp3` | l0-confusion-e | shared | confusion | Esa es la E. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-confusion-i.mp3` | l0-confusion-i | shared | confusion | Esa es la I. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-confusion-o.mp3` | l0-confusion-o | shared | confusion | Esa es la O. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-confusion-u.mp3` | l0-confusion-u | shared | confusion | Esa es la U. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-wrong-word-01.mp3` | l0-wrong-word-01 | shared | wrong-word | Ese no es. Escucha otra vez. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-wrong-word-02.mp3` | l0-wrong-word-02 | shared | wrong-word | Uy, no es esa palabra. Intenta de nuevo. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-wrong-word-03.mp3` | l0-wrong-word-03 | shared | wrong-word | Casi, pero no es esa. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-repeat-ack-01.mp3` | l0-repeat-ack-01 | shared | repeat-ack | Muy bien dicho. Ahora otra vez. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-repeat-ack-02.mp3` | l0-repeat-ack-02 | shared | repeat-ack | ¡Otra vez, más fuerte! | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-dont-know-01.mp3` | l0-dont-know-01 | shared | dont-know | No pasa nada. Escucha y repite conmigo. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-dont-know-02.mp3` | l0-dont-know-02 | shared | dont-know | Tranquilo. Primero escucha la palabra. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-dont-know-03.mp3` | l0-dont-know-03 | shared | dont-know | No te preocupes. La hacemos juntos. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-help-01.mp3` | l0-help-01 | shared | help | Escucha bien el sonido y repite. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-help-02.mp3` | l0-help-02 | shared | help | Mírame. Di la palabra conmigo. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-help-03.mp3` | l0-help-03 | shared | help | Primero escucha, luego repite despacio. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-silence-nudge-01.mp3` | l0-silence-nudge-01 | shared | silence-nudge | No te oigo. Acércate al micrófono. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-silence-nudge-02.mp3` | l0-silence-nudge-02 | shared | silence-nudge | Habla un poquito más fuerte. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-silence-nudge-03.mp3` | l0-silence-nudge-03 | shared | silence-nudge | ¿Estás ahí? Dime la palabra cuando quieras. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-noise-01.mp3` | l0-noise-01 | shared | noise | Hay mucho ruido. Busquemos un lugar tranquilo. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-noise-02.mp3` | l0-noise-02 | shared | noise | Escucho ruido. Vamos a un lugar más callado. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-redirect-01.mp3` | l0-redirect-01 | shared | redirect | Vamos a seguir con la siguiente palabra. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-redirect-02.mp3` | l0-redirect-02 | shared | redirect | Sigue con la siguiente. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-redirect-03.mp3` | l0-redirect-03 | shared | redirect | Dejemos esa y seguimos aprendiendo. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-review-intro-01.mp3` | l0-review-intro-01 | shared | review-intro | Vamos a repasar lo que aprendimos. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-review-intro-02.mp3` | l0-review-intro-02 | shared | review-intro | Ahora repasamos juntos. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-closing-01.mp3` | l0-closing-01 | shared | closing | ¡Muy bien! Terminamos por hoy. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-closing-02.mp3` | l0-closing-02 | shared | closing | ¡Gran trabajo! Nos vemos en la próxima lección. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-closing-03.mp3` | l0-closing-03 | shared | closing | Adiós. ¡Hasta pronto! | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-idle-end-01.mp3` | l0-idle-end-01 | shared | idle-end | Descansa un poco. Nos vemos pronto. | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-vowel-model-a.mp3` | l0-vowel-model-a | shared | vowel-model | a | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-vowel-model-e.mp3` | l0-vowel-model-e | shared | vowel-model | e | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-vowel-model-i.mp3` | l0-vowel-model-i | shared | vowel-model | i | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-vowel-model-o.mp3` | l0-vowel-model-o | shared | vowel-model | o | DRAFT WORDING — approve first |
| `/audio/voz/tutor/compartido/l0-vowel-model-u.mp3` | l0-vowel-model-u | shared | vowel-model | u | DRAFT WORDING — approve first |

## 7. Website, opening and lesson cinematics — `src/content/gretel-cinematics.ts`

`src/data/gretel-approved-clips.json` is empty (`{}`), so no cinematic has an approved recording or video. The Gretel welcome MP4 (0 of 1 produced) is a silent video. Its spoken line is `master-welcome`.

| File (proposed path) | Where it plays | Exact Spanish | Status |
|---|---|---|---|
| `/audio/voz/gretel/master-welcome.mp3` | Bienvenida (sitio / inicio) | ¡Hola! Soy Gretel. Vamos a aprender juntos. Mira con atención, escucha y ahora inténtalo tú. | MISSING |
| `/audio/voz/gretel/how-to.mp3` | Cómo usar la cartilla | En cada lección vamos a mirar, escuchar, trazar, leer y practicar. Puedes repetir una actividad cuando lo necesites. | MISSING |
| `/audio/voz/gretel/lesson-01-intro.mp3` | Lección 1 — entrada | Hoy vamos a conocer las cinco vocales. Mira con atención, escucha sus sonidos y después inténtalo tú. | MISSING |
| `/audio/voz/gretel/lesson-02-intro.mp3` | Lección 2 — entrada | Hoy trabajaremos con la vocal O. Escucha su sonido, observa las palabras y practica conmigo. | MISSING |
| `/audio/voz/gretel/lesson-03-intro.mp3` | Lección 3 — entrada | Hoy trabajaremos con la vocal A. Escucha su sonido, observa las palabras y practica conmigo. | MISSING |
| `/audio/voz/gretel/lesson-04-intro.mp3` | Lección 4 — entrada | Hoy trabajaremos con la vocal E. Escucha su sonido, observa las palabras y practica conmigo. | MISSING |
| `/audio/voz/gretel/lesson-05-intro.mp3` | Lección 5 — entrada | Hoy trabajaremos con la vocal I. Escucha su sonido, observa las palabras y practica conmigo. | MISSING |
| `/audio/voz/gretel/lesson-06-intro.mp3` | Lección 6 — entrada | Hoy trabajaremos con la vocal U. Escucha su sonido, observa las palabras y practica conmigo. | MISSING |
| `/audio/voz/gretel/lesson-07-intro.mp3` | Lección 7 — entrada | Hoy trabajaremos con la letra M y sus sílabas: ma, me, mi, mo, mu. Mira, escucha y después inténtalo tú. | MISSING |
| `/audio/voz/gretel/lesson-08-intro.mp3` | Lección 8 — entrada | Hoy trabajaremos con la letra P y sus sílabas: pa, pe, pi, po, pu. Mira, escucha y después inténtalo tú. | MISSING |
| `/audio/voz/gretel/lesson-09-intro.mp3` | Lección 9 — entrada | Hoy trabajaremos con la letra S y sus sílabas: sa, se, si, so, su. Mira, escucha y después inténtalo tú. | MISSING |
| `/audio/voz/gretel/lesson-10-intro.mp3` | Lección 10 — entrada | Hoy trabajaremos con la letra T y sus sílabas: ta, te, ti, to, tu. Mira, escucha y después inténtalo tú. | MISSING |
| `/audio/voz/gretel/lesson-11-intro.mp3` | Lección 11 — entrada | Hoy trabajaremos con la letra D y sus sílabas: da, de, di, do, du. Mira, escucha y después inténtalo tú. | MISSING |
| `/audio/voz/gretel/lesson-12-intro.mp3` | Lección 12 — entrada | Hoy trabajaremos con la letra L y sus sílabas: la, le, li, lo, lu. Mira, escucha y después inténtalo tú. | MISSING |
| `/audio/voz/gretel/lesson-13-intro.mp3` | Lección 13 — entrada | Hoy trabajaremos con la letra N y sus sílabas: na, ne, ni, no, nu. Mira, escucha y después inténtalo tú. | MISSING |
| `/audio/voz/gretel/lesson-14-intro.mp3` | Lección 14 — entrada | Hoy trabajaremos con la letra Ñ y sus sílabas: ña, ñe, ñi, ño, ñu. Mira, escucha y después inténtalo tú. | MISSING |
| `/audio/voz/gretel/lesson-15-intro.mp3` | Lección 15 — entrada | Hoy trabajaremos con la letra B y sus sílabas: ba, be, bi, bo, bu. Mira, escucha y después inténtalo tú. | MISSING |
| `/audio/voz/gretel/lesson-16-intro.mp3` | Lección 16 — entrada | Hoy trabajaremos con la letra V y sus sílabas: va, ve, vi, vo, vu. Mira, escucha y después inténtalo tú. | MISSING |
| `/audio/voz/gretel/lesson-17-intro.mp3` | Lección 17 — entrada | Hoy trabajaremos con la letra R y sus sílabas: ra, re, ri, ro, ru. Mira, escucha y después inténtalo tú. | MISSING |
| `/audio/voz/gretel/lesson-18-intro.mp3` | Lección 18 — entrada | Hoy trabajaremos con la letra RR y sus sílabas: rra, rre, rri, rro, rru. Mira, escucha y después inténtalo tú. | MISSING |
| `/audio/voz/gretel/lesson-19-intro.mp3` | Lección 19 — entrada | Hoy trabajaremos con la letra G y sus sílabas: ga, go, gu. Mira, escucha y después inténtalo tú. | MISSING |
| `/audio/voz/gretel/lesson-20-intro.mp3` | Lección 20 — entrada | Hoy trabajaremos con la letra F y sus sílabas: fa, fe, fi, fo, fu. Mira, escucha y después inténtalo tú. | MISSING |
| `/audio/voz/gretel/lesson-21-intro.mp3` | Lección 21 — entrada | Hoy trabajaremos con la letra J y sus sílabas: ja, je, ji, jo, ju. Mira, escucha y después inténtalo tú. | MISSING |
| `/audio/voz/gretel/lesson-22-intro.mp3` | Lección 22 — entrada | Hoy trabajaremos con la letra C y sus sílabas: ca, co, cu. Mira, escucha y después inténtalo tú. | MISSING |
| `/audio/voz/gretel/lesson-23-intro.mp3` | Lección 23 — entrada | Hoy trabajaremos con la letra Y y sus sílabas: ya, ye, yi, yo, yu. Mira, escucha y después inténtalo tú. | MISSING |
| `/audio/voz/gretel/lesson-24-intro.mp3` | Lección 24 — entrada | Hoy trabajaremos con la letra Z y sus sílabas: za, ze, zi, zo, zu. Mira, escucha y después inténtalo tú. | MISSING |
| `/audio/voz/gretel/milestone-6.mp3` | Logro — lección 6 | ¡Muy bien! Ya llegaste a la lección 6. Has trabajado mucho. Sigamos aprendiendo. | MISSING |
| `/audio/voz/gretel/milestone-12.mp3` | Logro — lección 12 | ¡Muy bien! Ya llegaste a la lección 12. Has trabajado mucho. Sigamos aprendiendo. | MISSING |
| `/audio/voz/gretel/milestone-18.mp3` | Logro — lección 18 | ¡Muy bien! Ya llegaste a la lección 18. Has trabajado mucho. Sigamos aprendiendo. | MISSING |
| `/audio/voz/gretel/milestone-24.mp3` | Logro — lección 24 | ¡Terminaste las veinticuatro lecciones! Mira todo lo que has aprendido. Celebremos tu esfuerzo. | MISSING |
| `/audio/voz/gretel/cartilla-final.mp3` | Final de la cartilla | ¡Lo lograste! Terminaste La Cartilla de Gretel. Sigue leyendo, practicando y descubriendo nuevas palabras cada día. | MISSING |

## 8. Teacher Platform

No Gretel speech is called from any `src/routes/cartilla/teacher/*` route or teacher component on `main`. The `/cartilla/teacher/gretel` page is a teacher view of Gretel and has no scripted voice lines. **There is nothing to record for the Teacher Platform.** Teacher-guide content in `src/content/guia/` is read by the teacher.



## 9. Supplement (2026-11-26): Gretel lines in `main` source that #1321 left out, and which speech paths are actually connected

**Important finding (source only):** the Workbook lesson route (`src/routes/cartilla/-leccion-view.tsx` → `NativeLessonViewer.tsx`) mounts **no** Gretel feedback voice. The only Gretel speech on that route is `GretelCinematic` (section 7). `useGretelEvents()` is defined but **never called** anywhere in `src/`. `GretelPresence` is mounted only on the intro splash, with `autoIntro={false}`. So even after you approve feedback clips, a coding agent must connect a voice listener on the lesson route before Gretel can say “Buen trabajo.” or the retry line. See `05-MOTION-INSPECTION.md`, row “Audio”.

### 9a. Workbook support and hint lines (`src/components/gretel/GretelActivity.tsx`, lines 54–69): agent-written wording, currently silent
These lines are emitted on Workbook pages as `support:delivered` events. They would only be spoken by `GretelPresence`, which is not mounted on the lesson route. **The wording was written by an agent, so approve it before recording.**

| File (proposed path) | Function | Exact Spanish | Status |
|---|---|---|---|
| `/audio/voz/apoyo/option-check.mp3` | Gretel highlights one option after a wrong attempt | Mira esta opción y comprueba si cumple la consigna. | DRAFT WORDING — approve first |
| `/audio/voz/apoyo/picture-grid.mp3` | Hint · picture grid | Di el nombre de cada dibujo y escucha el sonido que pide la consigna. | DRAFT WORDING — approve first |
| `/audio/voz/apoyo/vowel-line-match.mp3` | Hint · vowel line match | Di el nombre de cada dibujo y escucha si empieza con la vocal de la consigna. | DRAFT WORDING — approve first |
| `/audio/voz/apoyo/vowel-match-all.mp3` | Hint · match all to vowel | Di el nombre de cada dibujo y escucha su vocal inicial antes de unirlo. | DRAFT WORDING — approve first |
| `/audio/voz/apoyo/vowel-pick-one.mp3` | Hint · pick one by vowel | Di los nombres de los dibujos y escucha con qué vocal empiezan. | DRAFT WORDING — approve first |
| `/audio/voz/apoyo/syllable-match.mp3` | Hint · syllable match | Lee la sílaba de la consigna. Busca ese sonido dentro de cada palabra. | DRAFT WORDING — approve first |
| `/audio/voz/apoyo/fill-in-blank.mp3` | Hint · fill in the blank | Prueba cada sílaba en el espacio y lee la palabra completa. | DRAFT WORDING — approve first |
| `/audio/voz/apoyo/draw-box.mp3` | Hint · drawing box | Dibuja lo que pide la consigna. Cuando termines, toca Listo. | DRAFT WORDING — approve first |
| `/audio/voz/apoyo/writing-line.mp3` | Hint · tracing line | Sigue los puntos en orden y continúa el trazo de la letra. Tu escritura se conserva. | DRAFT WORDING — approve first |
| `/audio/voz/apoyo/writing-response.mp3` | Hint · written answer | Escribe tu respuesta a la consigna. Cuando termines, toca Listo. | DRAFT WORDING — approve first |
| `/audio/voz/apoyo/connect.mp3` | Hint · connect with a line | Di el nombre del dibujo y escucha el sonido inicial antes de unirlo. | DRAFT WORDING — approve first |

### 9b. Gretel presence lines (`src/components/gretel/GretelPresence.tsx`, lines 47, 72, 104, 110): not mounted on any lesson route
| File (proposed path) | Function | Exact Spanish | Status |
|---|---|---|---|
| `/audio/voz/gretel/home-hello.mp3` | Website home greeting (variant `home`; mounted with `autoIntro={false}`, so silent today) | ¡Hola! Soy Gretel. Vamos a aprender juntos. | MISSING (differs from the longer `master-welcome` line) |
| `/audio/voz/gretel/presence-fallback.mp3` | Lesson fallback when a page has no instruction | Estoy aquí para ayudarte. | DRAFT WORDING — approve first |
| `/audio/voz/gretel/page-explore.mp3` | Page revealed, no instruction text | Vamos a explorar esta página. | DRAFT WORDING — approve first |
| `/audio/voz/gretel/activity-done.mp3` | Activity completed | Terminaste la actividad. | DRAFT WORDING — approve first |
| `/audio/voz/gretel/idle-45s.mp3` | After 45 s with no activity | Si necesitas una pista, toca Ayuda. | DRAFT WORDING — approve first |

### 9c. Event reactions (`src/components/gretel/useGretelEvents.ts`; hook not called anywhere on `main`)
| File (proposed path) | Event | Exact Spanish | Same words already in this script? |
|---|---|---|---|
| `/audio/voz/gretel/event-start.mp3` | `lesson:start` | ¡Empecemos! | No, new line. DRAFT WORDING — approve first |
| (reuse `/audio/voz/interfaz/ui-001.mp3`) | `answer:correct` | Buen trabajo. | Yes, UI-001 and Tutor l0-praise-05 |
| (reuse `/audio/voz/interfaz/ui-003.mp3`) | `answer:wrong` | Inténtalo otra vez. | Yes, UI-003 and Tutor l0-try-again-01 (retry wording still needs your choice) |
| `/audio/voz/gretel/event-hint.mp3` | `hint:show` | ¡Mira aquí! | No, new line. DRAFT WORDING — approve first |
| (reuse `/audio/voz/feedback/correct-05.mp3`) | `lesson:complete` | ¡Lo lograste! | Yes, feedback correct-05 |

`GretelLiveAvatar.tsx` (line 52) celebration and encouragement pools use “Buen trabajo.”, “¡Muy bien!”, “¡Excelente!”, “¡Lo lograste!” and “Inténtalo otra vez.”. These are the same words as rows already listed above, so the same clips can be reused.

### 9d. Not scripted on purpose (owner decision or not spoken)
- `src/components/cartilla/SoundSearch.tsx` line 60 speaks the **target sound itself** (a letter or syllable, for example “m” or “ma”). Whether Gretel should say the letter name or the letter’s sound is a teaching decision for you. I wrote no text for it.
- `src/components/cartilla/GretelMirror.tsx` speaks the practice word. Those words are covered by the 161 picture-word recordings (section 3).
- Games: `useGameReactions.ts` shows the `gretel-feedback.ts` phrases (section 5) **as on-screen text only**. They are not spoken.
- Maestra suplente (`/cartilla/suplente`, merged in #1295): all of its text is on screen and it has no voice (`audioRecognition: "NOT_CONFIGURED"`). Nothing to record.
- `gretel-voice.ts` `buildLessonIntroLines` / `buildSuccessLine` / `buildMissLine` are exported but not called on `main`. Their words match the Tutor rows in section 6.
