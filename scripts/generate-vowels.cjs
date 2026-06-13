const fs = require('fs');

function createLesson1() {
  const content = `import { getBookPageImage } from "@/lib/bookImages";

export const lesson01 = [
  {
    id: "l1-p7-circle",
    lessonNumber: 1,
    pageNumber: 7,
    kind: "listen-and-tap",
    title: "Instrucciones:",
    prompt: "Circula los dibujos de las palabras en cada línea horizontal que comienzan con el mismo sonido.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded exercise for Lesson 1.",
    sourcePage: getBookPageImage(7)
  },
  {
    id: "l1-p8-circle-vowel",
    lessonNumber: 1,
    pageNumber: 8,
    kind: "listen-and-tap",
    title: "Instrucciones:",
    prompt: "Circula el dibujo que comienza con la vocal del recuadro.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded exercise for Lesson 1.",
    sourcePage: getBookPageImage(8)
  },
  {
    id: "l1-p9-draw-line",
    lessonNumber: 1,
    pageNumber: 9,
    kind: "drag-syllable-to-slot",
    title: "Instrucciones:",
    prompt: "Traza una línea de la vocal al dibujo que le corresponde.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded exercise for Lesson 1.",
    sourcePage: getBookPageImage(9)
  }
];
`;
  fs.writeFileSync('src/data/lessons/lesson-01.ts', content);
}

function createVowelLesson(lNum, startPage, letterCap, letterLow) {
  const p1 = startPage;
  const p2 = startPage + 1;
  const p3 = startPage + 2;

  const content = `import { getBookPageImage } from "@/lib/bookImages";

export const lesson${lNum.toString().padStart(2, '0')} = [
  {
    id: "l${lNum}-p${p1}-mark-x",
    lessonNumber: ${lNum},
    pageNumber: ${p1},
    kind: "listen-and-tap",
    title: "Instrucciones:",
    prompt: "Marca con una x los dibujos de las palabras que comienzan con ${letterCap} ${letterLow}.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded exercise for ${letterCap} ${letterLow}.",
    sourcePage: getBookPageImage(${p1})
  },
  {
    id: "l${lNum}-p${p2}-draw-line",
    lessonNumber: ${lNum},
    pageNumber: ${p2},
    kind: "drag-syllable-to-slot",
    title: "Instrucciones:",
    prompt: "Traza una línea desde la vocal ${letterCap}${letterLow} hasta el dibujo de la palabra que comienza con ${letterCap}${letterLow}.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded exercise for ${letterCap} ${letterLow}.",
    sourcePage: getBookPageImage(${p2})
  },
  {
    id: "l${lNum}-p${p3}-letter-tracing",
    lessonNumber: ${lNum},
    pageNumber: ${p3},
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra.",
    prompt: "Haz un dibujo que represente una palabra que comienza con ${letterLow}.",
    items: [
      { id: "letter-${letterCap}", label: "${letterCap}" },
      { id: "letter-${letterLow}", label: "${letterLow}" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded letter tracing for ${letterCap} ${letterLow}.",
    sourcePage: getBookPageImage(${p3})
  }
];
`;
  // Fix minor differences for L2 vs L3, etc.
  // Actually, L2 prompt says: "Marca con una x los dibujos que comienzan con O o." instead of "de las palabras que"
  let finalContent = content;
  if (lNum === 2) {
    finalContent = finalContent.replace("dibujos de las palabras que", "dibujos que");
  }
  fs.writeFileSync(`src/data/lessons/lesson-${lNum.toString().padStart(2, '0')}.ts`, finalContent);
}

createLesson1();
createVowelLesson(2, 10, 'O', 'o');
createVowelLesson(3, 13, 'A', 'a');
createVowelLesson(4, 16, 'E', 'e');
createVowelLesson(5, 19, 'I', 'i');
createVowelLesson(6, 22, 'U', 'u');
