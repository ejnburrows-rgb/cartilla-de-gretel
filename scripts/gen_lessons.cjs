const fs = require('fs');

const lessons = [
  {
    lessonNumber: 10,
    L: 'L', l: 'l',
    syls: ['la', 'le', 'li', 'lo', 'lu'],
    words: ['pelo', 'lima', 'loma', 'lupa', 'lata', 'loto', 'malo', 'palo', 'tala', 'tela'],
    story: ['Lalo y Lulú.', 'Lalo pela la lima.', 'Lulú pule la lata.', 'El palo de Lalo.'],
    fillInBlank: [
      { fullWord: 'lupa', partial: 'lu___', choices: ['pa', 'ta'], answer: 'pa', correctSyllable: 'pa', hint: 'pa / ta' },
      { fullWord: 'lima', partial: 'li___', choices: ['ma', 'me'], answer: 'ma', correctSyllable: 'ma', hint: 'ma / me' },
      { fullWord: 'pelo', partial: 'pe___', choices: ['lo', 'la'], answer: 'lo', correctSyllable: 'lo', hint: 'lo / la' },
      { fullWord: 'lata', partial: 'la___', choices: ['ta', 'te'], answer: 'ta', correctSyllable: 'ta', hint: 'ta / te' },
      { fullWord: 'malo', partial: 'ma___', choices: ['lo', 'lu'], answer: 'lo', correctSyllable: 'lo', hint: 'lo / lu' },
      { fullWord: 'tela', partial: 'te___', choices: ['la', 'le'], answer: 'la', correctSyllable: 'la', hint: 'la / le' }
    ]
  },
  {
    lessonNumber: 11,
    L: 'D', l: 'd',
    syls: ['da', 'de', 'di', 'do', 'du'],
    words: ['dado', 'dedo', 'duda', 'dama', 'lodo', 'todo', 'mido', 'pido', 'dote', 'ludo'],
    story: ['El dado de papá.', 'Mamá me da el dedo.', 'Dido duda de todo.', 'El lodo de Lalo.'],
    fillInBlank: [
      { fullWord: 'dado', partial: 'da___', choices: ['do', 'da'], answer: 'do', correctSyllable: 'do', hint: 'do / da' },
      { fullWord: 'dedo', partial: 'de___', choices: ['do', 'de'], answer: 'do', correctSyllable: 'do', hint: 'do / de' },
      { fullWord: 'duda', partial: 'du___', choices: ['da', 'do'], answer: 'da', correctSyllable: 'da', hint: 'da / do' },
      { fullWord: 'dama', partial: 'da___', choices: ['ma', 'me'], answer: 'ma', correctSyllable: 'ma', hint: 'ma / me' },
      { fullWord: 'lodo', partial: 'lo___', choices: ['do', 'da'], answer: 'do', correctSyllable: 'do', hint: 'do / da' },
      { fullWord: 'todo', partial: 'to___', choices: ['do', 'du'], answer: 'do', correctSyllable: 'do', hint: 'do / du' }
    ]
  },
  {
    lessonNumber: 12,
    L: 'N', l: 'n',
    syls: ['na', 'ne', 'ni', 'no', 'nu'],
    words: ['nene', 'nido', 'nudo', 'pino', 'mono', 'luna', 'mano', 'nota', 'lana', 'dona'],
    story: ['El mono de Nina.', 'Nina tiene una lana.', 'La luna ilumina el pino.', 'El nene de la mano.'],
    fillInBlank: [
      { fullWord: 'nido', partial: 'ni___', choices: ['do', 'da'], answer: 'do', correctSyllable: 'do', hint: 'do / da' },
      { fullWord: 'luna', partial: 'lu___', choices: ['na', 'no'], answer: 'na', correctSyllable: 'na', hint: 'na / no' },
      { fullWord: 'mano', partial: 'ma___', choices: ['no', 'na'], answer: 'no', correctSyllable: 'no', hint: 'no / na' },
      { fullWord: 'mono', partial: 'mo___', choices: ['no', 'ni'], answer: 'no', correctSyllable: 'no', hint: 'no / ni' },
      { fullWord: 'nene', partial: 'ne___', choices: ['ne', 'na'], answer: 'ne', correctSyllable: 'ne', hint: 'ne / na' },
      { fullWord: 'nudo', partial: 'nu___', choices: ['do', 'da'], answer: 'do', correctSyllable: 'do', hint: 'do / da' }
    ]
  },
  {
    lessonNumber: 13,
    L: 'S', l: 's',
    syls: ['sa', 'se', 'si', 'so', 'su'],
    words: ['sapo', 'sopa', 'suma', 'piso', 'peso', 'paso', 'oso', 'mesa', 'misa', 'seta'],
    story: ['Ese oso pisa la sopa.', 'Susi suma en la mesa.', 'Susi pasea su sapo.', 'La masa en la mesa.'],
    fillInBlank: [
      { fullWord: 'sapo', partial: 'sa___', choices: ['po', 'pa'], answer: 'po', correctSyllable: 'po', hint: 'po / pa' },
      { fullWord: 'sopa', partial: 'so___', choices: ['pa', 'po'], answer: 'pa', correctSyllable: 'pa', hint: 'pa / po' },
      { fullWord: 'mesa', partial: 'me___', choices: ['sa', 'se'], answer: 'sa', correctSyllable: 'sa', hint: 'sa / se' },
      { fullWord: 'oso', partial: 'o___', choices: ['so', 'su'], answer: 'so', correctSyllable: 'so', hint: 'so / su' },
      { fullWord: 'piso', partial: 'pi___', choices: ['so', 'sa'], answer: 'so', correctSyllable: 'so', hint: 'so / sa' },
      { fullWord: 'suma', partial: 'su___', choices: ['ma', 'me'], answer: 'ma', correctSyllable: 'ma', hint: 'ma / me' }
    ]
  },
  {
    lessonNumber: 14,
    L: 'C', l: 'c',
    syls: ['ca', 'co', 'cu'],
    words: ['cama', 'casa', 'coco', 'cuna', 'saco', 'poco', 'pico', 'toca', 'copa', 'cola'],
    story: ['Paco toca el coco.', 'La casa de Paco.', 'Caco saca la copa.', 'La cuna de Cuca.'],
    fillInBlank: [
      { fullWord: 'casa', partial: 'ca___', choices: ['sa', 'so'], answer: 'sa', correctSyllable: 'sa', hint: 'sa / so' },
      { fullWord: 'cuna', partial: 'cu___', choices: ['na', 'no'], answer: 'na', correctSyllable: 'na', hint: 'na / no' },
      { fullWord: 'coco', partial: 'co___', choices: ['co', 'ca'], answer: 'co', correctSyllable: 'co', hint: 'co / ca' },
      { fullWord: 'cama', partial: 'ca___', choices: ['ma', 'me'], answer: 'ma', correctSyllable: 'ma', hint: 'ma / me' },
      { fullWord: 'copa', partial: 'co___', choices: ['pa', 'po'], answer: 'pa', correctSyllable: 'pa', hint: 'pa / po' },
      { fullWord: 'toca', partial: 'to___', choices: ['ca', 'co'], answer: 'ca', correctSyllable: 'ca', hint: 'ca / co' }
    ]
  },
  {
    lessonNumber: 15,
    L: 'R', l: 'r',
    syls: ['ra', 're', 'ri', 'ro', 'ru'],
    words: ['rana', 'rama', 'rosa', 'roto', 'toro', 'cara', 'poro', 'ropa', 'rico', 'muro'],
    story: ['Rita mira la rosa.', 'El toro corre a la rama.', 'La rana pasa a la rama.', 'La ropa de Rita.'],
    fillInBlank: [
      { fullWord: 'rana', partial: 'ra___', choices: ['na', 'no'], answer: 'na', correctSyllable: 'na', hint: 'na / no' },
      { fullWord: 'toro', partial: 'to___', choices: ['ro', 'ra'], answer: 'ro', correctSyllable: 'ro', hint: 'ro / ra' },
      { fullWord: 'cara', partial: 'ca___', choices: ['ra', 'ro'], answer: 'ra', correctSyllable: 'ra', hint: 'ra / ro' },
      { fullWord: 'rosa', partial: 'ro___', choices: ['sa', 'so'], answer: 'sa', correctSyllable: 'sa', hint: 'sa / so' },
      { fullWord: 'ropa', partial: 'ro___', choices: ['pa', 'po'], answer: 'pa', correctSyllable: 'pa', hint: 'pa / po' },
      { fullWord: 'muro', partial: 'mu___', choices: ['ro', 'ra'], answer: 'ro', correctSyllable: 'ro', hint: 'ro / ra' }
    ]
  },
  {
    lessonNumber: 16,
    L: 'F', l: 'f',
    syls: ['fa', 'fe', 'fi', 'fo', 'fu'],
    words: ['foca', 'faro', 'foto', 'fama', 'rifa', 'sofá', 'feo', 'café', 'fila', 'foso'],
    story: ['La foca Fifi.', 'Fifi sale en la foto.', 'El faro ilumina la foca.', 'Fifi toma café en el sofá.'],
    fillInBlank: [
      { fullWord: 'foca', partial: 'fo___', choices: ['ca', 'co'], answer: 'ca', correctSyllable: 'ca', hint: 'ca / co' },
      { fullWord: 'foto', partial: 'fo___', choices: ['to', 'ta'], answer: 'to', correctSyllable: 'to', hint: 'to / ta' },
      { fullWord: 'faro', partial: 'fa___', choices: ['ro', 'ra'], answer: 'ro', correctSyllable: 'ro', hint: 'ro / ra' },
      { fullWord: 'fila', partial: 'fi___', choices: ['la', 'lo'], answer: 'la', correctSyllable: 'la', hint: 'la / lo' },
      { fullWord: 'feo', partial: 'fe___', choices: ['o', 'a'], answer: 'o', correctSyllable: 'o', hint: 'o / a' },
      { fullWord: 'café', partial: 'ca___', choices: ['fé', 'fá'], answer: 'fé', correctSyllable: 'fé', hint: 'fé / fá' }
    ]
  }
];

function generateFile(lesson) {
  const ln = lesson.lessonNumber;
  const pageStart = ln * 3 - 1; // Arbitrary offset if needed, but I'll use 26+ for ln=9, so let's use ln*3 - 1
  const sylTapItems = lesson.syls.map(syl => `{ id: "ra-${syl}", label: "${syl}" }`).join(",\n      ");
  
  const content = `export const lesson${ln} = [
  {
    id: "l${ln}-p${pageStart}-letter-tracing",
    lessonNumber: ${ln},
    pageNumber: ${pageStart},
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra — ${lesson.L} ${lesson.l}",
    prompt: "Traza la letra ${lesson.L} mayúscula y la ${lesson.l} minúscula. Luego haz un dibujo de una palabra que comienza con ${lesson.l}.",
    items: [
      {
        id: "letter-${lesson.L}",
        label: "${lesson.L}"
      },
      {
        id: "letter-${lesson.l}",
        label: "${lesson.l}"
      }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Students trace uppercase ${lesson.L} and lowercase ${lesson.l}.",
    sourcePage: ""
  },
  {
    id: "l${ln}-p${pageStart+1}-syllable-circle",
    lessonNumber: ${ln},
    pageNumber: ${pageStart+1},
    kind: "drag-syllable-to-slot",
    title: "Encierra la sílaba — ${lesson.L} ${lesson.l}",
    prompt: "Encierra en un círculo la sílaba que corresponde a cada palabra. Toca la sílaba correcta.",
    items: [
      ${lesson.syls.map(s => `{ id: "syl-${s}", label: "${s}" }`).join(',\n      ')}
    ],
    targets: [
      ${lesson.syls.map(s => `{
        id: "slot-${s}",
        label: "${s}",
        coordinatesVerified: false,
        acceptsItemId: "syl-${s}"
      }`).join(',\n      ')}
    ],
    wordBank: [
      ${lesson.words.map(w => `"${w}"`).join(',\n      ')}
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for ${lesson.L}.",
    sourcePage: ""
  },
  {
    id: "l${ln}-p${pageStart+1}-syllable-tap",
    lessonNumber: ${ln},
    pageNumber: ${pageStart+1},
    kind: "read-aloud",
    title: "Sílabas con ${lesson.L} — página ${lesson.L}${lesson.l}",
    prompt: "Toca cada sílaba para escucharla. Repite en voz alta.",
    items: [
      ${sylTapItems}
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for ${lesson.L}.",
    sourcePage: ""
  },
  {
    id: "l${ln}-p${pageStart+1}-word-bank",
    lessonNumber: ${ln},
    pageNumber: ${pageStart+1},
    kind: "listen-and-tap",
    title: "Palabras con ${lesson.L}",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      ${lesson.words.map(w => `{ id: "w-${w}", label: "${w}" }`).join(',\n      ')}
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for ${lesson.L}.",
    sourcePage: ""
  },
  {
    id: "l${ln}-p${pageStart+1}-mini-story",
    lessonNumber: ${ln},
    pageNumber: ${pageStart+1},
    kind: "mini-story",
    title: "Mini-cuento",
    prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
    items: [
      ${lesson.story.map((s, i) => `{ id: "story-${lesson.l}-${i+1}", label: "${s}" }`).join(',\n      ')}
    ],
    targets: [],
    sightWords: [
      "yo",
      "y",
      "el",
      "la"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded mini-story for ${lesson.L}.",
    sourcePage: ""
  },
  {
    id: "l${ln}-p${pageStart+2}-fill-in-blank",
    lessonNumber: ${ln},
    pageNumber: ${pageStart+2},
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras — ${lesson.L} ${lesson.l}",
    prompt: "Arrastra la sílaba correcta para completar cada palabra.",
    items: [
      ${[...new Set(lesson.fillInBlank.map(f => f.answer))].map(ans => `{ id: "syl-${ans}", label: "${ans}" }`).join(',\n      ')}
    ],
    targets: [
      ${lesson.fillInBlank.map(f => `{
        id: "blank-${f.fullWord}",
        label: "${f.partial}",
        hint: "${f.hint}",
        correctSyllable: "${f.correctSyllable}",
        fullWord: "${f.fullWord}",
        coordinatesVerified: false,
        acceptsItemId: "syl-${f.answer}"
      }`).join(',\n      ')}
    ],
    exercises: [
      ${lesson.fillInBlank.map(f => `{
        partial: "${f.partial}",
        choices: ${JSON.stringify(f.choices)},
        answer: "${f.answer}",
        fullWord: "${f.fullWord}"
      }`).join(',\n      ')}
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for ${lesson.L}.",
    sourcePage: ""
  }
];
`;
  const filename = `c:/Users/EJN/Desktop/La Cartilla/cartilla-de-gretel/src/data/lessons/lesson-${ln}.ts`;
  fs.writeFileSync(filename, content, 'utf8');
}

lessons.forEach(generateFile);
