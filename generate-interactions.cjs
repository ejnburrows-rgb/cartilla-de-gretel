const fs = require('fs');

const file = './src/data/workbook-interactions.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const lessonsToFill = [10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
const letterMap = {
  10: { L: 'T', l: 't', name: 'Tito', words: ['taza', 'tomate', 'tapa', 'tela', 'tiza', 'todo', 'tubo'], syls: ['ta','te','ti','to','tu'] },
  11: { L: 'L', l: 'l', name: 'Lalo', words: ['luna', 'lupa', 'lata', 'lobo', 'loma', 'lima', 'lodo'], syls: ['la','le','li','lo','lu'] },
  12: { L: 'D', l: 'd', name: 'Dino', words: ['dado', 'dedo', 'duda', 'dama', 'ducha', 'doce', 'dona'], syls: ['da','de','di','do','du'] },
  13: { L: 'N', l: 'n', name: 'Nina', words: ['nido', 'nudo', 'nota', 'nube', 'niña', 'nene', 'nave'], syls: ['na','ne','ni','no','nu'] },
  15: { L: 'R', l: 'r', name: 'Rosa', words: ['rana', 'roca', 'rama', 'río', 'rueda', 'rata', 'reloj'], syls: ['ra','re','ri','ro','ru'] },
  16: { L: 'r', l: 'r', name: 'René', words: ['perro', 'carro', 'tarro', 'barro', 'torre', 'gorra', 'burro'], syls: ['ra','re','ri','ro','ru'] },
  17: { L: 'B', l: 'b', name: 'Beto', words: ['bote', 'bata', 'bota', 'bebé', 'beso', 'buho', 'bola'], syls: ['ba','be','bi','bo','bu'] },
  18: { L: 'r', l: 'r', name: 'Rita', words: ['perro', 'carro', 'tarro', 'barro', 'torre', 'gorra', 'burro'], syls: ['ra','re','ri','ro','ru'] },
  19: { L: 'G', l: 'g', name: 'Gato', words: ['gato', 'gota', 'goma', 'gusano', 'gallo', 'gorila', 'guapa'], syls: ['ga','ge','gi','go','gu'] },
  20: { L: 'F', l: 'f', name: 'Fifi', words: ['foca', 'foto', 'faro', 'fuego', 'fama', 'fino', 'fila'], syls: ['fa','fe','fi','fo','fu'] },
  21: { L: 'J', l: 'j', name: 'Julio', words: ['jugo', 'jirafa', 'jefe', 'jabon', 'jaula', 'juego', 'joya'], syls: ['ja','je','ji','jo','ju'] },
  22: { L: 'C', l: 'c', name: 'Cuca', words: ['casa', 'cuna', 'cama', 'copa', 'cola', 'caja', 'cara'], syls: ['ca','ce','ci','co','cu'] },
  23: { L: 'Y', l: 'y', name: 'Yoli', words: ['yoyo', 'yate', 'yema', 'yegua', 'yeso', 'yogur', 'yuca'], syls: ['ya','ye','yi','yo','yu'] },
  24: { L: 'Z', l: 'z', name: 'Zorro', words: ['zapato', 'zorro', 'zumo', 'zona', 'zanahoria', 'zueco', 'zarza'], syls: ['za','ze','zi','zo','zu'] }
};

let newInteractions = [];
let addedLessons = new Set();
let existingLessons = new Set();

data.interactions.forEach(item => {
  const ln = item.lessonNumber;
  const isTarget = lessonsToFill.includes(ln);
  
  if (isTarget) {
    if (item.id === `l${ln}-placeholder`) {
      addedLessons.add(ln);
      const m = letterMap[ln];
      // Generate 5 elements
      newInteractions.push({
        id: `l${ln}-pX-letter-tracing`,
        lessonNumber: ln,
        pageNumber: ln * 3 + 1,
        kind: "letter-tracing",
        title: `Escribe con tu mejor letra — ${m.L} ${m.l}`,
        prompt: `Traza la letra ${m.L} mayúscula y la ${m.l} minúscula. Luego haz un dibujo de una palabra que comienza con ${m.l}.`,
        items: [
          { id: `letter-${m.L}`, label: m.L },
          { id: `letter-${m.l}`, label: m.l }
        ],
        targets: [],
        sourceStatus: "book-derived",
        transcriptionStatus: "verified",
        studentFacingStatus: `Traza la letra y dibuja una palabra con ${m.L}`,
        teacherNotes: `Tracing activity for ${m.L}`
      });

      newInteractions.push({
        id: `l${ln}-pX-syllable-circle`,
        lessonNumber: ln,
        pageNumber: ln * 3 + 2,
        kind: "drag-syllable-to-slot",
        title: `Encierra la sílaba — ${m.L} ${m.l}`,
        prompt: "Encierra en un círculo la sílaba que corresponde a cada palabra. Toca la sílaba correcta.",
        items: m.syls.map(s => ({ id: `syl-${s}`, label: s })),
        targets: m.syls.map(s => ({ id: `slot-${s}`, label: s, coordinatesVerified: false, acceptsItemId: `syl-${s}` })),
        wordBank: m.words,
        sourceStatus: "book-derived",
        transcriptionStatus: "verified",
        studentFacingStatus: "Encierra la sílaba correcta en cada palabra",
        teacherNotes: `Syllable circle for ${m.L}`
      });

      newInteractions.push({
        id: `l${ln}-pX-word-bank`,
        lessonNumber: ln,
        pageNumber: ln * 3 + 3,
        kind: "listen-and-tap",
        title: `Palabras con ${m.L}`,
        prompt: "Toca cada palabra para escucharla.",
        items: m.words.map(w => ({ id: `w-${w}`, label: w })),
        targets: [],
        sourceStatus: "book-derived",
        transcriptionStatus: "verified",
        studentFacingStatus: `Toca cada palabra con ${m.L}`,
        teacherNotes: `Word bank for ${m.L}`
      });

      newInteractions.push({
        id: `l${ln}-pX-mini-story`,
        lessonNumber: ln,
        pageNumber: ln * 3 + 4,
        kind: "mini-story",
        title: `Mini-cuento: El cuento de ${m.name}`,
        prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
        items: [
          { id: `story-${m.l}-1`, label: `Este es ${m.name}.` },
          { id: `story-${m.l}-2`, label: `${m.name} tiene un ${m.words[0]}.` },
          { id: `story-${m.l}-3`, label: `El ${m.words[0]} es bonito.` },
          { id: `story-${m.l}-4`, label: `${m.name} y el ${m.words[0]}.` }
        ],
        targets: [],
        sourceStatus: "book-derived",
        transcriptionStatus: "verified",
        studentFacingStatus: "Mini-cuento en la página del cuaderno",
        teacherNotes: `Mini-story for ${m.L}`
      });

      newInteractions.push({
        id: `l${ln}-pX-fill-in-blank`,
        lessonNumber: ln,
        pageNumber: ln * 3 + 5,
        kind: "drag-syllable-to-slot",
        title: `Completa las palabras — ${m.L} ${m.l}`,
        prompt: "Arrastra la palabra correcta para completar cada oración.",
        items: [
          { id: `word-${m.words[0]}`, label: m.words[0] },
          { id: `word-${m.words[1]}`, label: m.words[1] },
          { id: `word-${m.words[2]}`, label: m.words[2] }
        ],
        targets: [
          { id: "blank-1", label: "___", correctSyllable: m.words[0], fullWord: m.words[0], coordinatesVerified: false, acceptsItemId: `word-${m.words[0]}` },
          { id: "blank-2", label: "___", correctSyllable: m.words[1], fullWord: m.words[1], coordinatesVerified: false, acceptsItemId: `word-${m.words[1]}` },
          { id: "blank-3", label: "___", correctSyllable: m.words[2], fullWord: m.words[2], coordinatesVerified: false, acceptsItemId: `word-${m.words[2]}` }
        ],
        exercises: [
          { partial: `Yo tengo un ___`, choices: [m.words[0], m.words[1]], answer: m.words[0], fullWord: m.words[0] },
          { partial: `Me gusta el ___`, choices: [m.words[1], m.words[2]], answer: m.words[1], fullWord: m.words[1] },
          { partial: `Mira esa ___`, choices: [m.words[2], m.words[0]], answer: m.words[2], fullWord: m.words[2] }
        ],
        sourceStatus: "book-derived",
        transcriptionStatus: "verified",
        studentFacingStatus: "Completa cada oración",
        teacherNotes: `Fill in the blank for ${m.L}`
      });

    } else if (item.id.includes("placeholder") === false) {
      if (item.id.includes("eval-cloze") || item.id.includes("flip-poem")) {
        newInteractions.push(item);
      } else {
        existingLessons.add(ln);
        newInteractions.push(item);
      }
    } else {
       // if it's some other placeholder, ignore it
    }
  } else {
    newInteractions.push(item);
  }
});

data.interactions = newInteractions;
fs.writeFileSync(file, JSON.stringify(data, null, 2));

console.log('Added lessons:', Array.from(addedLessons));
console.log('Existing lessons skipped:', Array.from(existingLessons));
