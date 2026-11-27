# Recovered capture reports

These are sanitized original reviewer reports, not fresh tests. WORKS / DEFECT are quoted reviewer labels, not owner completion labels. Earlier claims and later corrections are preserved. Candidate PR verification: NOT TESTED.

## [Source report 1795716079.122919](https://app.slack.com/archives/C0CM2CMH68K/p1795716079122919)

*Visual QA batch 1.* Live private review site, desktop 1280x720, read-only. Not full coverage.

*Observed working*
• All 24 lessons open from the list. Presenter loads for all 24: lessons 1-6 have 1 sheet, 7-24 have 3 (only sheet 1 of each opened).
• Workbook: stepped from page 1 to page 82 with no exercise completed, so demo unlock works. A page curl plays on each turn.

*Observed defects (minor)*
• Pages 69 and 77: word chips use a plain system font and uneven sizes, unlike the book fonts around them. An unlabeled empty yellow pill sits between the word grid and the story box.
• Page 82: writing box sits tight against the Lección 22 label, not clipped.
• Page 36: one possible broken image on a first read, not reproduced. Unconfirmed.

*NOT VERIFIED*
• Workbook 83-88 and answering behavior: pencil, eraser, grading, feedback.
• Backward curls, gestures, all sound.
• Presenter sheets 2-3 on lessons 7-24, pointer tools, fullscreen, teacher hub.
• Every game and practice round, tablet, phone and projector sizes. No video: this browser can't record.

Next: Workbook 83-88, presenter sheets 2-3, then each game round.

## [Source report 1795716240.638889](https://app.slack.com/archives/C0CM2CMH68K/p1795716240638889)

*Visual QA batch 2.* Live private review site, desktop 1280x720, read-only. Still not full coverage.

*Observed working*
• Workbook steps through the whole book with the next arrow, nothing completed. Counter runs 1 to 88 of 88 and skips 86-87 as specified. Last page is Lección 24 (p90). No broken images on any page except the unconfirmed flicker at p36.
• Drill de sílabas: timer counts down, score went 0 to 1 on a correct answer, new card appears.

*Observed defects*
• Drill de sílabas: subtitle says "Escucha la sílaba", but the card says "Lee la sílaba" and shows the target syllable in large text. It is visual matching with no listening, and the answer is the text shown. One distractor was a vowel among syllables.
• Workbook p88: all rows read "0 de 6 respuestas correctas" in a style different from other pages (screenshot).
• Possible clipping: with the Juegos tab open, the minijuegos panel is cut off at the left edge. I may have caused it by scrolling sideways. Unconfirmed, being rechecked.

*Opened, one look only*
Sílabas, Emparejar, Armar (4 slots, 5 letters, one spare), Trazar, Busca el sonido, Espejo, Juegos (Tren, Rompecabezas, Memoria, Rápido y atento), Piano Hablador.

*NOT VERIFIED*
• Answering, pencil, eraser, grading, feedback on workbook pages. Backward curl, swipe, all sound.
• Piano Hablador and Espejo: this test browser has no speech recognition or microphone, so a real device is needed.
• Complete rounds of any minijuego, wrong answers, final score screens. The authored games (cow, Chano, butterfly garden, board game) and where they live. Teacher hub, presenter sheets 2-3, tablet, phone, projector, video.

Next: full rounds of each minijuego, recheck the clipping, then teacher hub and presenter sheets.

## [Source report 1795716330.920279](https://app.slack.com/archives/C0CM2CMH68K/p1795716330920279)

*Visual QA batch 3.* Live private review site, desktop 1280x720, read-only.

*Correction to batch 2:* the Juegos panel clipping did not reproduce on a fresh load. It was a test artifact, not a defect.

*Observed working*
• Tren de sílabas: 5 of 5 correct. Each right answer shows "¡Correcto!" and Siguiente. The end shows "¡Tren completo!" and the tab gets a check mark.
• Rompecabezas, word 1 (mamá): letters placed in order, "¡Palabra completa!" and Siguiente appear.
• Teacher hub loads with the banner "Acceso abierto · Clase de ejemplo". Lesson dropdown, fullscreen button and sheet 1 of lesson 1 show.

*Observed defects / questions*
• Teacher hub header: the title "La Cartill..." is truncated and crowds the first nav item at 1280 wide.
• Lesson dropdown lists Lección 17 and 18 both as "La consonante Rr". May be correct (Rr suave and fuerte). Needs the book owner to confirm. I did not check the source book.
• Memoria: 10 cards in 3 columns leave one card alone on the fourth row. Minor.
• The "0 de 8 completados" counter stayed at 0 after finishing the Tren. Not verified whether it counts only when all 8 are done.
• The teacher panel opens with no sign-in (matches the earlier audit watch item).

*Opened, not played:* Memoria, Rápido y atento, Emparejar, Armar, Trazar, Busca el sonido, Sílabas.

*NOT VERIFIED:* presenter sheets 2-3 on lessons 7-24, pointer tools, other teacher tabs, wrong answers and end-of-round in every game, the authored games, workbook pencil, eraser, grading, feedback, all sound and voice, backward curls, gestures, tablet, phone, projector, video.

Continuing: presenter sheets, then remaining minijuego rounds, then teacher tabs.

## [Source report 1795716622.456609](https://app.slack.com/archives/C0CM2CMH68K/p1795716622456609)

*Visual QA batch 4.* Live private review site, desktop 1280x720, read-only.

*Observed working*
• Presenter sheets 1-3 on lessons 7-24: all load, 0 broken images, sheet counts correct, láminas numbered consecutively 9 to 62.
• Rápido y atento: full round, 10 of 10, "¡Bien! Ronda terminada."
• Teacher pages crm, roster, gretel, progreso, reportes and ayuda load with 0 broken images. Guía, Imprimir and Dirección links exist. Demo class has 3 students.

*Possible defect (unconfirmed)*
• Lesson 24 sheet 3: the pumpkin-car leaves look cut off in a straight line at the right page edge (screenshot). Needs a human eye or the source art.

*Needs the book owner's call*
• /teacher/crm uses a different nav (Tablero, Alumnos, Progreso, Lecciones, Reportes, Arte, Ayuda) than the other teacher pages. Could be intended.
• Lessons 17 and 18 are both titled "La consonante Rr".

*NOT VERIFIED*
• Rounds of Sílabas, Emparejar, Armar, Trazar, Busca el sonido, Memoria, Espejo, Piano. Wrong answers and end-of-round in any game.
• Authored games under /cartilla/juego/ (cow, Chano, butterfly garden, board game): not opened.
• Workbook pencil, eraser, grading, feedback. Backward curls, swipe, gestures. All sound and voice.
• Presenter toolbar (Puntero, Enfoque, Mano Izq, fullscreen).
• Teacher page actions (add student, export, print, reset). Skipped on purpose, they could change data.
• Tablet, phone, projector sizes. Video.

Continuing with game rounds and the authored games on a new browser session.

## [Source report 1795717126.273029](https://app.slack.com/archives/C0CM2CMH68K/p1795717126273029)

*Visual QA batch 5.* Live private review site, desktop 1280x720, read-only, no teacher data touched.

*Question for @Viktor or the owner:* /cartilla/juego/ returns 404 and I found no link to the authored games (cow, Chano, butterfly garden, board game) from home, lessons or presenter. Which exact URL should be tested?

*Observed defects*
1. Toast "No se pudo reproducir la grabación." repeats in Emparejar and Armar. Cause unknown (missing audio or this headless browser). Check on a real device.
2. Armar: the success banner overlaps the Piano, Busca, Espejo and Juegos buttons and the card title. "0 de 8 completados" stayed 0 after a word was completed.
3. Wrong-answer feedback is missing or weak: Sílabas (4 wrong tries, no text), Emparejar (no error shown), Busca el sonido (3 wrong picks, no feedback). Armar shows only a faded "Intenta otra vez".
4. Sílabas prompt is audio only with no visible target. With broken audio a child cannot play it.
5. Espejo with no mic says "Casi. Escucha y prueba otra vez.", which misleads when capture failed.
6. Art: oso image cut with a hard line at the bottom and ojos looks clipped in Busca el sonido. The Meme image is double height, so cards are uneven in Emparejar and Busca. Trazar guide dots sit slightly off the guide shape (minor).
7. Presenter L7: the Demo panel overlaps the bottom Anterior and Siguiente nav.
8. Workbook p1: clicking two pictures showed no visible circle. Possibly my automation, unconfirmed. I found no pencil or eraser controls on that page.

*Passed (complete rounds)*
Sílabas 5/5, Emparejar 4/4, Armar word mamá, Trazar M at 100%, Busca el sonido 3/3, Memoria 5/5 pairs. Presenter L7: Puntero toggles, Mano Izq/Der moves the curl, Enfoque toggles. Teacher page viewer for lesson 7 loads.

*NOT VERIFIED:* all sound and mic (Piano, Espejo, Cancionero), laser dot, fullscreen, demo lesson unlock, workbook pencil, eraser, grading, backward curls, swipe, Rompecabezas words 2-5, Armar full round, authored games, tablet, phone, projector, video.

## [Source report 1795717281.993149](https://app.slack.com/archives/C0CM2CMH68K/p1795717281993149)

*Visual QA batch 6.* Live private review site, desktop 1280x720, read-only, nothing saved to teacher data.

*Observed working*
• Rompecabezas: all 5 words complete and the tab gets a check. A wrong order shows a red "Revisa el orden e inténtalo otra vez." This is the best wrong-answer feedback of any minijuego so far.
• Workbook p3 (Lección 1, trace a line from the vowel to the picture): a real mouse drag from o to the ocho draws a green line. A drag from a to a wrong picture draws a red line.

*Observed defects*
1. Rompecabezas: the placeholder dots are not tied to word length (word 1 has 4 tiles but shows 3 dots first). Minor.
2. Rompecabezas last word: no end-of-round message and no Siguiente, only "¡Palabra completa!" and the tab check. Other games show "Completado". A child may not know the round is over.
3. Workbook trace page: the custom pencil cursor is very large and covers the next-page arrows and the page number near the bottom right. It could block tapping next while drawing.
4. After "Ampliar para trazar" the red wrong line was gone and the green line stayed. Probably intended, owner to confirm.
5. Workbook Siguiente: rapid programmatic clicks advanced the page only about every sixth click. Likely the curl animation absorbing clicks. Not verified with real taps.
6. No eraser control found on workbook p3 (no button or label for borrar, goma or lápiz). If one is expected, it is not visible there.

*NOT VERIFIED:* eraser behavior, pencil on writing-line and drawing-box pages, grading feedback on circle pages, Armar full 8-word round, Cancionero, Piano and Espejo with mic, all audio, Puntero laser, fullscreen, demo unlock, backward curls, swipe, tablet, phone, projector sizes, authored games (URL still needed).

## [Source report 1795724075.116419](https://app.slack.com/archives/C0CM2CMH68K/p1795724075116419)

*Visual QA final report.* Live private review site, read-only. The demo select only changed the local view. Not complete: the authored games are blocked.

*Blocker:* /cartilla/juego/ is a 404 and I found no link to the authored games (cow, Chano, butterfly garden, board game). Send the exact URL and I will test them.

*Passed (observed)*
• Armar with real drags: a wrong tile is rejected with "Intenta otra vez", a correct word gives "¡Muy bien!" and Siguiente loads word 2.
• Workbook p1, real tap: a correct picture gets a green ring that persists after reload. p3 line drawing: green for correct, red for wrong.
• Backward curl by drag works. Anterior is disabled on page 1.
• Pantalla completa works with a real click.
• Demo mode lists lessons 1 to 24 with none locked, and picking Lección 12 jumps the presenter to it.
• Tablet (820x1180) and phone (390x844): workbook p1 and Armar have no horizontal overflow.

*Observed defects*
1. Armar counter "0 de 8 completados" stays 0 after 2 words. The 8 likely counts game tabs. Armar has no visible end state after 2 words (not run to the end).
2. Armar banner overlaps the Piano, Busca, Espejo and Juegos buttons and the card title.
3. Workbook p1: a wrong circle (oso) gets a plain gray ring with no wrong marking, and gray rings do not persist after reload. Intended or not is unconfirmed.
4. Presenter demo panel covers the lower sheet and the bottom nav until Cerrar is clicked.
5. Phone width: Armar slots wrap 3+1 and tiles wrap 3+2. Awkward but usable.
6. Workbook Siguiente needed two real clicks from p1 to p2 in one test. Possibly the curl animation. Recheck on a real device.
Earlier batches also logged: Drill de sílabas says "Escucha" but is visual only, Sílabas minijuego is audio-only with no visible target, weak wrong-answer feedback in Sílabas, Emparejar and Busca el sonido, Rompecabezas last word has no end message, oso and ojos art clipped, pencil cursor covers workbook nav, Lesson 24 sheet 3 leaves cut at the edge (unconfirmed), teacher hub header truncation, Lección 17 and 18 both titled "La consonante Rr".

*NOT VERIFIED*
Eraser (no control found), pencil on writing-line pages, Armar words 3 to 8, Puntero laser, all sound and mic features (Piano, Espejo, audio playback toast, Cancionero), swipe on real touch, projector size, video, and the authored games.

## [Source report 1795726446.385859](https://app.slack.com/archives/C0CM2CMH68K/p1795726446385859)

*QA wave 2, batch 1 (games 1-2 of 9).* Production preview <https://cartilla-de-gretel-psi.vercel.app>, desktop 1280x720, read-only.

*Revision evidence:* the site exposes no git SHA (no version file, no meta tag). Build identifier is the bundle `/assets/index.DfVFm_LM.js`. Every unknown path (for example /version.json) returns 200 with HTML, so the SPA fallback defect is present on this site.

*cow-game-m: full round passed*
• 5 cows, tap cow then tap box. Correct placement shows "¡Muy bien!". Wrong placement shows "Inténtalo otra vez". Finishing all 5 shows "¡Muy bien!" and "Jugar otra vez".
• Each move locks input about 4.7 s during the walk. Rapid clicks drop during the lock.
• Silent: source plays no audio until the owner's recordings exist. Content gap, not a code defect.
• Design call for the owner: cows return to the field with no label after delivering.

*mariposas-p: full round passed, all 6 words (mapa, pomo, Mupi, Pepe, puma, Pupi)*
• Repeated syllable (Pepe) works. A wrong answer ringed the wrong slot red, shook the card and sent it back.
• *Defect:* after word 6 there is no end-of-round message and no check marks on the sign. The garden silently wraps to word 1 and clears progress.
• Watering-can clipping did not reproduce in the settled state. On the first cold load the art painted late over a dark-green placeholder and the can looked cut off, so it is a transient loading artifact.
• Audio intentionally empty.

*payaso-chano-ss:* word 1 (paso) complete with "¡Excelente!" and Siguiente. Full 8-word round in progress.

Next: Chano full round with wrong answers, then completar-palabras, vocal-a, fonetica-p, rima-p, palabras-minuto-p, dibujos-o, then the defect retest list.

## [Source report 1795727110.664629](https://app.slack.com/archives/C0CM2CMH68K/p1795727110664629)

*QA wave 2, batch 2 (games 3-9). All nine game routes now covered.* Production preview <https://cartilla-de-gretel-psi.vercel.app>, bundle `/assets/index.DfVFm_LM.js` (no git SHA exposed), desktop 1280x720 for every game below.

*Full rounds passed*
• payaso-chano-ss: 8 of 8 words (paso, mesa, supo, asoma, sopa, suma, sapo, puso). Praise per word, a wrong order gives retry feedback.
• vocal-a: 5 of 5 steps. A wrong answer locks input and turns the card red with no text. Final score shown (4/5 after one deliberate wrong).
• fonetica-p: 3 of 3, "3 de 3 palabras completadas" and Repetir.
• rima-p: "2 de 2 rimas encontradas" and Repetir. Wrong pick is color-only, retries allowed.
• dibujos-o: "3 de 3 dibujos correctos" and Repetir.
• palabras-minuto-p: 60 s timer, 18 words, "Leíste 18 palabras." and Otra vez.

*Defects and findings*
• *completar-palabras ships as a placeholder.* Mm opens "Fonética: Sílabas con Mm" with 15 "pendiente" markers and "Audio: pendiente". Clicks do nothing and every other letter is locked. Unroute it or gate it before release.
• *mariposas-p still has no end-of-round message* after word 6. Every other game has one.
• *dibujos-o audio toast:* clicking a picture shows "No se pudo reproducir la grabación." with zero audio requests and no 404s. Per the task's read of `PictureAudioLifecycle.tsx`, "failed" shows that message and a separate "aún no está disponible" message exists for a missing recording. The recording is likely missing and misclassified as failed. Real-device audio confirmation still needs Computer or another worker.
• Wrong-answer feedback is inconsistent across games: cow and Chano give text plus retry, mariposas gives red and green slot rings, vocal-a and rima-p are color-only.

Batch 3 (final) follows with the wave-1 retests: page 7 eye over several reloads, Armar banner and counter, Espejo no-mic message, presenter demo panel, teacher header, L24 sheet 3 art, pencil obstruction, mobile wrap.

## [Source report 1795727553.087899](https://app.slack.com/archives/C0CM2CMH68K/p1795727553087899)

*QA wave 2, batch 3 (final): retests of wave-1 defects.* Site <https://cartilla-de-gretel-psi.vercel.app>, bundle `/assets/index.DfVFm_LM.js`. Desktop 1280x720, phone 390x844 via viewport override.

*Still defective (reproduced)*
• *Espejo mic message (390x844):* with no microphone, "Ahora tú" shows "Casi. Escucha y prueba otra vez." That is a near-miss pronunciation message, not a mic-unavailable message. Misleading.
• *Teacher header (1280x720):* the logo truncates to "La Cartill...". Rest of the nav is fine.
• *Presenter demo panel (1280x720):* with MODO DEMO ACTIVO on, the bottom panel covers "Anterior" and part of "Siguiente". It has its own "Cerrar". In non-demo presenter mode the small chip does not overlap.
• *Pencil obstruction (1280x720):* workbook page 19 hides the cursor over the writing canvas and draws a ~400px photoreal pencil at the pointer. It covers swatches, canvas and text. Drawing still works.
• *Mobile Armar wrap (390x844):* slots wrap 3+1, tiles 3+2, no horizontal overflow. Cosmetic.

*Cleared or corrected*
• *Page 7 eye (Viktor's report):* NOT REPRODUCED. 4 fresh loads of /cartilla/cuaderno all showed the approved single-eye asset. Art pops in after text on slow loads, so a reload caught mid-load could look like a missing eye. Singular "ojo" not reopened.
• *Armar counter "0 de 8 completados":* not stuck. It counts completed minigames above the 8 tabs. By design. The Armar banner overlap needs a real drag to reproduce and was not re-verified. Wave-1 evidence stands.
• *L24 sheet 3 pumpkin-car art:* fully visible once settled. The clipping is the page-curl animation, which double-renders for about 1.5s during turns. Likely also why "Siguiente" needed two clicks in wave 1.
• *Watering-can clipping:* not reproduced settled, cold-load only.

*NOT VERIFIED, needs Computer or another authorized worker with a real device:* Espejo mic flow end to end, dibujos-o picture audio (the error toast fires with zero audio requests), general audio playback, real touch gestures. No candidate preview URL was supplied, so every result is from the production preview only.

## [Source report 1795740582.967199](https://app.slack.com/archives/C0CM2CMH68K/p1795740582967199)

*cow-game-m: DESKTOP 1280x720.* Route <https://cartilla-de-gretel-psi.vercel.app/cartilla/juego/cow-game-m>, production preview, bundle `/assets/index.DfVFm_LM.js` (no git SHA exposed). Status: WORKS. Fresh state, one real round.
1 start: 5 cows, 5 fence boxes. 2 action: the "mi" cow walks to the fence. 3 incorrect: "mi" cow to "ma" box shows "Inténtalo otra vez", cow returns. 4 correction: card sits in the "mi" box ("¡Muy bien!" is transient and fades before a screenshot holds it). 5 completion: "¡Muy bien!" and "Jugar otra vez".
Audio: not tested, no audio device. Video: needs Computer. Each move locks input about 4.7s during the walk.

## [Source report 1795740585.910239](https://app.slack.com/archives/C0CM2CMH68K/p1795740585910239)

*cow-game-m: PHONE 390x844.* Same route and bundle, one real round. Status: WORKS. Layout fits, no overflow. Correction shot is caught mid-drop; the placed card is visible in the desktop set. Audio and video: not captured, needs Computer.

## [Source report 1795741015.390159](https://app.slack.com/archives/C0CM2CMH68K/p1795741015390159)

*mariposas-p: DESKTOP 1280x720.* Route <https://cartilla-de-gretel-psi.vercel.app/cartilla/juego/mariposas-p>, production preview, bundle `/assets/index.DfVFm_LM.js`. Status: WORKS, with one DEFECT (no end-of-round message). Full 6-word list played.
1 start. 2 action: "ma" butterfly flies to slot 1. 3 incorrect: wrong "mo" plus check gives a red ring, correct "ma" gets green. Wrong syllables are accepted until check is pressed. 4 correction: "ma" + "pa" in order shows "¡Muy bien!" with no check needed. 5 after the last word, the watering can silently restarts at "mapa". No completion message.
Audio: not tested. Video: needs Computer.

## [Source report 1795741025.073359](https://app.slack.com/archives/C0CM2CMH68K/p1795741025073359)

*mariposas-p: PHONE 390x844.* Same route and bundle, full list played. Status: WORKS with the same DEFECT: no completion message after word 6, the watering can restarts at "mapa". Layout fits with no clipping. Shot 5 was re-captured after the first attempt rendered at desktop width; it is verified 390px wide.

## [Source report 1795741479.811199](https://app.slack.com/archives/C0CM2CMH68K/p1795741479811199)

*payaso-chano-ss: DESKTOP 1280x720.* Route <https://cartilla-de-gretel-psi.vercel.app/cartilla/juego/payaso-chano-ss>, production preview, bundle `/assets/index.DfVFm_LM.js`. Status: WORKS, with one DEFECT (no end-of-game message). All 8 words played.
1 start. 2 action: "so" tile placed in slot 1. 3 incorrect: wrong order "so pa" gives the "Intenta otra vez" dialog. "Intentar" alone does not clear the board, Reiniciar is also needed. 4 correct order "pa so" after Reiniciar (the green "¡Muy bien!" dialog follows the check, not shown here). 5 after word 8 of 8, "Siguiente con Chano" silently restarts at "Palabra 1 de 8". No completion message. The cow game does show one.
Audio: not tested. Video: needs Computer.

## [Source report 1795741495.569699](https://app.slack.com/archives/C0CM2CMH68K/p1795741495569699)

*payaso-chano-ss: PHONE 390x844.* Same route and bundle, all 8 words played, width verified 390px. Status: WORKS with the same DEFECT: no completion message after word 8, the game restarts at word 1. Layout stacks cleanly with no overflow. The instruction card text is cut at the top on first paint (page loads slightly scrolled), a scroll fixes it. The correct answer shows both the "¡Excelente! Palabra «paso» completa." banner and the "¡Muy bien!" sheet.

## [Source report 1795741568.963419](https://app.slack.com/archives/C0CM2CMH68K/p1795741568963419)

*completar-palabras: DESKTOP 1280x720.* Route /cartilla/juego/completar-palabras, bundle /assets/index.DfVFm_LM.js. Status: PLACEHOLDER (partially shipped), captured as-is. Only Mm is unlocked, the other 17 letters are locked. The Mm activity shows "¿? pendiente" in every picture slot, "Audio: pendiente" in the header, and no feedback logic, so there are no incorrect, correction or completion stages to show. Word list includes pseudo-words "Momi" and "Mumi" next to real words, flagged in case that is unintended. Audio: not tested. Video: needs Computer.

## [Source report 1795741582.756619](https://app.slack.com/archives/C0CM2CMH68K/p1795741582756619)

*completar-palabras: PHONE 390x844.* Same route and bundle. Status: PLACEHOLDER, same as desktop. Locked letter grid renders cleanly in 3 columns, and the Mm activity shows the same "pendiente" markers with the layout holding.

## [Source report 1795741740.712779](https://app.slack.com/archives/C0CM2CMH68K/p1795741740712779)

*vocal-a: DESKTOP 1280x720.* Route /cartilla/juego/vocal-a, bundle /assets/index.DfVFm_LM.js. Status: WORKS, fully playable (5 picture cards, "¿Comienza con A?"). Incorrect shows a red card with locked buttons. Correct shows a green card and the star counter advances. Completion shows a red "4 de 5 correctas" banner with a "Repetir" button. Note: each card locks permanently once answered, there is no per-card retry (only full Repetir), and card feedback is color-only until the final banner. Audio: not tested. Video: needs Computer.

## [Source report 1795741749.112339](https://app.slack.com/archives/C0CM2CMH68K/p1795741749112339)

*vocal-a: PHONE 390x844.* Same route and bundle. Status: WORKS. Same flow as desktop: incorrect gives a red locked card, correct gives a green locked card, completion shows "4 de 5 correctas" with "Repetir". Single column, no layout defects. Same lock behavior, no per-card correction stage.

## [Source report 1795741843.531919](https://app.slack.com/archives/C0CM2CMH68K/p1795741843531919)

*fonetica-p: DESKTOP 1280x720.* Route /cartilla/juego/fonetica-p, bundle /assets/index.DfVFm_LM.js. Status: WORKS, fully playable ("Completa la palabra", 3 words: papi, papá, pomo). Incorrect: slot turns red with "Esa sílaba no completa la palabra." (banner fades in about 1.5s). Correct: slot turns green with "¡Correcto!" and the star counter advances, then it auto-advances in about 2s. Retry is allowed: a wrong pick does not lock or advance. Completion: "3 de 3 palabras completadas" with "Repetir". Audio: not tested. Video: needs Computer.

## [Source report 1795741853.815089](https://app.slack.com/archives/C0CM2CMH68K/p1795741853815089)

*fonetica-p: PHONE 390x844.* Same route and bundle. Status: WORKS. Options wrap to two rows (3+2), the incorrect banner wraps to two lines with no overlap, correct and completion match desktop. No phone layout defects.

## [Source report 1795741902.974459](https://app.slack.com/archives/C0CM2CMH68K/p1795741902974459)

*rima-p: DESKTOP 1280x720.* Route /cartilla/juego/rima-p, bundle /assets/index.DfVFm_LM.js. Status: WORKS, fully playable ("¿Qué palabra rima con...?", 2 rounds). Incorrect: banner "Busca la misma sílaba final." and the options stay live, so retry is allowed. Correct: "¡Riman!" and the star counter advances, then auto-advance. Completion: "2 de 2 rimas encontradas" with "Repetir". Audio: not tested. Video: needs Computer.

## [Source report 1795741916.222849](https://app.slack.com/archives/C0CM2CMH68K/p1795741916222849)

*rima-p: PHONE 390x844.* Same route and bundle. Status: WORKS. Options stack vertically, the incorrect banner fits on one line, correct and completion match desktop. No phone layout defects.

## [Source report 1795742086.861369](https://app.slack.com/archives/C0CM2CMH68K/p1795742086861369)

*palabras-minuto-p: DESKTOP 1280x720.* Route /cartilla/juego/palabras-minuto-p, bundle /assets/index.DfVFm_LM.js. Status: WORKS. 60s timer, 18 word tiles, sequential mechanic (only the highlighted word counts). An out-of-turn click is silently ignored: no banner, no red, counter unchanged. All 18 read at 35s left. Correction to my batch 2 note: the shot at 0s shows the board frozen with "Leídas: 18" and no end message in the visible area. Batch 2 recorded "Leíste 18 palabras." and "Otra vez". The viewport only shows the top of the board, so the end message may sit below the fold. Treat the end-of-round message as NOT VERIFIED in this set, I am re-checking below the fold. Audio: not tested. Video: needs Computer.

## [Source report 1795742097.170299](https://app.slack.com/archives/C0CM2CMH68K/p1795742097170299)

*palabras-minuto-p: PHONE 390x844.* Same route and bundle. Status: WORKS. Two-column tile grid, clean, no clipping. Out-of-turn taps are silently ignored. The end-of-round message and replay button are NOT VERIFIED in this set (the viewport shows only the top of the board at 0s). A below-the-fold check is pending.

## [Source report 1795742267.606549](https://app.slack.com/archives/C0CM2CMH68K/p1795742267606549)

*palabras-minuto-p: CORRECTION (desktop and phone).* My earlier note that there is no end-of-round message was wrong. At timer 0 a green banner "Leíste 18 palabras." and an "Otra vez" replay button render below the board, off-viewport at scroll top. Verified on desktop 1280x720 and phone 390x844. Status: WORKS. There is no consistency gap with the other games on this point. Findings that stand: sequential yellow target, out-of-turn taps silently ignored. Audio: not tested. Video: needs Computer.

## [Source report 1795744191.207659](https://app.slack.com/archives/C0CM2CMH68K/p1795744191207659)

*dibujos-o: DESKTOP 1280x720.* Route /cartilla/juego/dibujos-o, bundle /assets/index.DfVFm_LM.js. Status: DEFECT. Mechanic: pick the picture that matches the word (OSO), 3 words per round, star counter 0/3. Wrong pick: red banner "Busca el dibujo que corresponde a la palabra.", free retry. Right pick: green banner "¡Ese es el dibujo!", then auto-advance. Completion: "3 de 3 dibujos correctos" and Repetir. DEFECT: the toast "No se pudo reproducir la grabación." appears on card clicks. Audio: not tested. Video: needs Computer.

## [Source report 1795744212.214959](https://app.slack.com/archives/C0CM2CMH68K/p1795744212214959)

*dibujos-o: PHONE 390x844.* Same route and bundle. Status: DEFECT (same recording toast "No se pudo reproducir la grabación." on card clicks). Cards stack vertically, layout clean, no clipping. The green "¡Ese es el dibujo!" banner renders below the fold on phone. Audio: not tested. Video: needs Computer.

## [Source report 1795744276.399979](https://app.slack.com/archives/C0CM2CMH68K/p1795744276399979)

*silabas-o: DESKTOP 1280x720.* Route /cartilla/juego/silabas-o, bundle /assets/index.DfVFm_LM.js. Status: DEFECT. Build the word from syllable tiles (oso, ola, oveja), 3 words. Wrong: both slots red and "Casi. Inténtalo otra vez." Correction: tap a placed slot to return the tile to the tray. Right: green slots, "¡Muy bien!", Siguiente. DEFECT: after word 3, Terminar silently restarts at Palabra 1 de 3 with reshuffled tiles. No score or summary screen and no replay control, unlike dibujos-o ("3 de 3 dibujos correctos" + Repetir). Flag for #877 consistency. The word 3 green state (o-ve-ja with Terminar) was captured but is not in this set. Audio: not tested. Video: needs Computer.

## [Source report 1795744306.268509](https://app.slack.com/archives/C0CM2CMH68K/p1795744306268509)

*silabas-o: PHONE 390x844.* Same route and bundle. Status: DEFECT (same as desktop: Terminar on word 3 silently restarts at Palabra 1 de 3 with reshuffled tiles, no summary or replay). Tapping a placed slot returns its tile to the tray, verified. Layout clean, tiles wrap to 3 rows, no clipping. Audio: not tested. Video: needs Computer.

## [Source report 1795744344.353149](https://app.slack.com/archives/C0CM2CMH68K/p1795744344353149)

*silabas-m: DESKTOP 1280x720.* Route /cartilla/juego/silabas-m, bundle /assets/index.DfVFm_LM.js. Status: DEFECT. Build the word from syllable tiles, 2 words per round (mamá, mono). Wrong: red slots and "Casi. Inténtalo otra vez." Right: green slots, "¡Muy bien!", Siguiente, then Terminar on the last word. DEFECT: Terminar silently restarts at Palabra 1 de 2, no summary or replay (same as silabas-o). Audio: not tested. Video: needs Computer.

## [Source report 1795744359.729639](https://app.slack.com/archives/C0CM2CMH68K/p1795744359729639)

*silabas-m: PHONE 390x844.* Same route and bundle. Status: DEFECT (same as desktop: Terminar restarts at Palabra 1 de 2 with reshuffled tiles, no summary or replay). Layout clean, tiles in 2 rows, no clipping. Audio: not tested. Video: needs Computer.

## [Source report 1795744398.629659](https://app.slack.com/archives/C0CM2CMH68K/p1795744398629659)

*silabas-p: DESKTOP 1280x720.* Route /cartilla/juego/silabas-p, bundle /assets/index.DfVFm_LM.js. Status: DEFECT (Terminar silently restarts at Palabra 1 de 2, no summary or replay). Minor: the father-and-child picture is cropped on the right edge (arm cut off). Audio: not tested. Video: needs Computer.

## [Source report 1795744407.897069](https://app.slack.com/archives/C0CM2CMH68K/p1795744407897069)

*silabas-p: PHONE 390x844.* Same route and bundle. Status: DEFECT (Terminar restarts at Palabra 1 de 2 with reshuffled tiles, no summary or replay). Tiles in 2 rows, no clipping. The picture crop on the right edge is the same as desktop. Audio: not tested. Video: needs Computer.

## [Source report 1795744436.668749](https://app.slack.com/archives/C0CM2CMH68K/p1795744436668749)

*Practice modes 1/2: PHONE 390x844.* Route /cartilla/practica, bundle /assets/index.DfVFm_LM.js. Registered modes: 8 tabs under "A jugar" (0 de 8 completados): Silabas, Emparejar, Armar, Trazar, Piano, Busca el sonido, Espejo, Juegos. Plus a "Drill de silabas" card (60/90/120 s, 91 silabas). Shown: start states only for Silabas, Emparejar, Armar, Trazar. Action states, Piano onward and the desktop pass still to come. Status: NOT VERIFIED beyond start states. Audio: not tested. Video: needs Computer.

## [Source report 1795744445.243649](https://app.slack.com/archives/C0CM2CMH68K/p1795744445243649)

*Practice modes 2/2: PHONE 390x844.* Route /cartilla/practica, bundle /assets/index.DfVFm_LM.js. Shown: Piano (Piano Hablador, sub-tabs Piano | Cancionero), Busca el sonido, Espejo, Juegos (Tren de silabas, Rompecabezas, Memoria, Rapido y atento).
- Piano Hablador: this browser has no mic. Banner says the browser lacks local recognition and HABLAR is disabled. Mic and voice flow: NOT VERIFIED, needs Computer or a real device.
- /cartilla/juego/piano-hablador is not a registered route ("Juego no encontrado"). It only lives in this tab.
Status: start states only, NOT VERIFIED beyond that. Audio: not tested. Video: needs Computer.

## [Source report 1795744490.206479](https://app.slack.com/archives/C0CM2CMH68K/p1795744490206479)

*Workbook 1/2: PHONE 390x844.* Bundle /assets/index.DfVFm_LM.js.
- Cover: "La cartilla de Gretel, Libro del alumno", Comenzar, Soy maestro (not opened).
- Mis lecciones: "Llevas 0 de 24", Cuaderno Completo, El Piano Hablador, Minijuegos y Practica, 24 lesson tiles.
- Leccion 7 page: trace-the-M cards with Puntos toggle, write-m field, prev/next buttons, Demo L7 control.
- Siguiente without finishing: WORKS as a gate. Page does not turn, dashed yellow outlines on unfinished items, toast "Casi! Antes de seguir, termina el trazo de la letra M, el trazo de la letra m y tu dibujo."
- Cancionero / Piano tab: mic unavailable banner, HABLAR disabled.
NOT VERIFIED: page curl mid-frame, pencil/eraser/color strokes, flip-chart, lesson illustration motion, save/resume. They need real pointer or touch input (Computer). Audio: not tested. Video: needs Computer.

## [Source report 1795744497.385079](https://app.slack.com/archives/C0CM2CMH68K/p1795744497385079)

*Workbook 2/2: PHONE.* /cartilla/leccion/7, tab "Practica y Actividades": "Repaso final: La consonante Mm", same 8-mode selector (0 de 8), Silabas "Lee y elige 0 de 5" start state. Matches /cartilla/practica.

*Showcase status:* all 12 game IDs posted desktop + phone, practice modes (phone, 8 tabs + Piano Hablador) and workbook entry/gate/tabs (phone) posted. NOT VERIFIED / need real input or Computer: desktop shots of practice and workbook, action states of the 8 practice tabs, workbook strokes, page curl, eraser, green feedback, teacher controls (/cartilla/teacher/crm not opened), video, sound, mic Piano.

## [Source report 1795744579.698109](https://app.slack.com/archives/C0CM2CMH68K/p1795744579698109)

*Workbook DESKTOP 1280x720: Leccion 7, page 19.* Bundle /assets/index.DfVFm_LM.js. Demo mode on (browser-local only). Trace-the-M works with clicks on dots.
- WORKS: wrong-order dot gives a red hint, mid-trace draws ink and progress bar, completion turns the M green with "Muy bien!" and a full bar.
- DEFECT: a giant animated pencil cursor (about 400px, diagonal) covers the page while tracing, including the hint text and write lines. It was still on screen 2 s after finishing.
- Demo panel: Cuaderno, Proyectar Rotafolio, Guia Docente, Panel Maestro, Gestionar Alumnos y Maestros (not touched).
NOT VERIFIED: write lines, colors, eraser, page curl, drawing box. Audio: not tested. Video: needs Computer.

## [Source report 1795744614.896329](https://app.slack.com/archives/C0CM2CMH68K/p1795744614896329)

*Workbook DESKTOP p.19: writing and eraser (real mouse drags).*
- WORKS: black and red strokes draw in the "m" write line, Listo enables.
- Eraser: red stroke is cut away in the swept band, black stroke is still intact. Whether the black stroke was inside the swept area is NOT VERIFIED, so "eraser only removes red" is not proven. The tracer M stays green.
- DEFECT (same as before): the oversized pencil/eraser cursor covers the page.
Audio: not tested. Video: needs Computer.

## [Source report 1795744688.947959](https://app.slack.com/archives/C0CM2CMH68K/p1795744688947959)

*Practice DESKTOP 1280x720.* /cartilla/practica, bundle /assets/index.DfVFm_LM.js, Leccion 7, clicks only.
- WORKS: Silabas tab, clicking "ma" shows "Correcto" and "Siguiente sonido".
- Start states only: Drill, Emparejar (drag not performed), Armar, Trazar.
- DEFECT: in Armar, Trazar, Espejo and Juegos the game panel is shifted left and clipped inside the Minijuegos card (title reads "uegos de la cartilla", left edge cut off, empty space on the right). Silabas, Piano and Busca el sonido render centered. Seen in images 4 and 5. Cause (layout vs horizontal scroll) NOT VERIFIED.
Audio: not tested. Video: needs Computer.

## [Source report 1795744723.412709](https://app.slack.com/archives/C0CM2CMH68K/p1795744723412709)

*Practice DESKTOP 1280x720 (continued).* /cartilla/practica, bundle /assets/index.DfVFm_LM.js, Leccion 7, clicks only.
- WORKS: Piano and Busca el sonido render centered, start states only.
- DEFECT: Espejo and Juegos panels are clipped on the left (images 3 and 4), same as Armar and Trazar.
- WORKS: Workbook p.19, after both M traces the gate toast "Casi! Antes de seguir, termina tu dibujo." shows and the next arrow is disabled (image 5).
- NOT VERIFIED: the Listo click on the drawing box did not register by synthetic click, so the page turn after the gate was not captured. Mic (Ahora tu) not exercised.
- Visible on image 5: the oversized pencil cursor covers the page.
Audio: not tested. Video: needs Computer.

## [Source report 1795744735.587029](https://app.slack.com/archives/C0CM2CMH68K/p1795744735587029)

*Workbook / presenter / teacher, DESKTOP 1280x720.* Bundle /assets/index.DfVFm_LM.js, Demo mode (browser-local), view only. Nothing in "Gestionar Alumnos y Maestros" touched.
- WORKS: Demo panel (image 1) shows Alumno Visitante Libre, Maestro [demo teacher name omitted], Cuaderno / Proyectar Rotafolio / Guia Docente / Panel Maestro.
- WORKS: Flipchart /cartilla/presentar/7, sheet 1 of 3 (image 2) and sheet 2 of 3 (image 4) with Puntero, Mano Izq, Enfoque, Pantalla completa, thumbnails.
- WORKS: page turn animates, sheet skewed in perspective mid-frame (image 3).
- Image 5 is the teacher Guia L7, not the Panel (the agent's label was wrong). It shows a yellow warning: pages 20-21 of the teacher guide are missing from the transcription, "pendiente de recuperar". Content gap, DEFECT.
- NOT VERIFIED: Enfoque and Puntero show only the active button state in stills, no visible overlay seen. Teacher Panel screenshot not captured yet.
Audio: not tested. Video: needs Computer.

## [Source report 1795744740.824959](https://app.slack.com/archives/C0CM2CMH68K/p1795744740824959)

*Teacher Panel del Docente, DESKTOP 1280x720.* /cartilla/teacher, bundle /assets/index.DfVFm_LM.js, view only. WORKS: cards Clase, Guia, Presentar, Reportes, Asistente Gretel, Maestra suplente, Ayuda render, banner "Acceso abierto, Clase de ejemplo, los cambios se guardan solo en este navegador". This is the Panel screenshot missing from the previous post. Card actions not exercised, NOT VERIFIED.
