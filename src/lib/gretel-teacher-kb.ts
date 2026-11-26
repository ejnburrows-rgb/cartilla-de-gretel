export type Lang = "es" | "en";

export type TeacherLink = {
  label: string;
  to: string;
  search?: Record<string, string>;
};

export type TeacherTopic = {
  id: string;
  category: "metodologia" | "aula" | "materiales" | "evaluacion" | "gestion";
  keywords: string[];
  title: { es: string; en: string };
  summary: { es: string; en: string };
  actionableSteps: { es: string[]; en: string[] };
  links: TeacherLink[];
  relatedTopics: string[];
  quickPrompt: { es: string; en: string };
};

export const TEACHER_TOPICS: TeacherTopic[] = [
  {
    id: "metodologia",
    category: "metodologia",
    keywords: [
      "metodologia",
      "metodo",
      "pedagogia",
      "fonetico",
      "silabico",
      "lecciones",
      "24 lecciones",
      "ensenanza",
      "lectoescritura",
      "method",
      "curriculum",
    ],
    title: {
      es: "Metodología de las 24 Lecciones",
      en: "24 Lessons Methodology",
    },
    summary: {
      es: "La Cartilla de Gretel sigue un método analítico-sintético fonético-silábico probado. Inicia con vocales (Lecciones 1-3), avanza a consonantes de alta frecuencia (M, P, S, L, T en Lecciones 4-9), luego consonantes compuestas y dígrafos (CH, LL, RR), concluyendo con fluidez lectora integrada en la Lección 24.",
      en: "La Cartilla de Gretel follows a tested phonetic-syllabic analytical-synthetic method. It starts with vowels (Lessons 1-3), progresses to high-frequency consonants (M, P, S, L, T in Lessons 4-9), then blends and digraphs (CH, LL, RR), concluding with integrated reading fluency in Lesson 24.",
    },
    actionableSteps: {
      es: [
        "Presenta siempre el fonema y su grafía antes de unirlo con vocales.",
        "Trabaja una lección por semana o al ritmo del grupo, asegurando consolidación antes de avanzar.",
        "Combina el reconocimiento auditivo, el trazo motriz y la lectura contextualizada.",
      ],
      en: [
        "Always present the phoneme and its spelling before joining it with vowels.",
        "Work on one lesson per week or at the group's pace, ensuring mastery before advancing.",
        "Combine auditory recognition, motor stroke, and contextualized reading.",
      ],
    },
    links: [
      { label: "Ver Guía del Profesor (24 lecciones)", to: "/cartilla/teacher/guia" },
      { label: "Ver Tablas Silábicas", to: "/cartilla/teacher/guia", search: { folder: "tablas" } },
    ],
    relatedTopics: ["estructura-clase", "tablas-silabicas", "evaluacion"],
    quickPrompt: {
      es: "¿Cuál es la metodología de las 24 lecciones?",
      en: "What is the 24-lesson methodology?",
    },
  },
  {
    id: "estructura-clase",
    category: "aula",
    keywords: [
      "estructura",
      "tiempo",
      "clase",
      "minutos",
      "pacing",
      "dosificacion",
      "horario",
      "sesion",
      "paso a paso",
      "schedule",
      "session",
    ],
    title: {
      es: "Estructura Recomendada de una Clase (45–60 min)",
      en: "Recommended Lesson Structure (45–60 min)",
    },
    summary: {
      es: "Una sesión equilibrada combina instrucción directa, modelado colectivo, práctica autónoma en el cuaderno y retroalimentación inmediata.",
      en: "A balanced session combines direct instruction, collective modeling, autonomous workbook practice, and immediate feedback.",
    },
    actionableSteps: {
      es: [
        "Minutos 1–10: Calentamiento fonético y repaso de la rima/canción de la lección previa.",
        "Minutos 10–25: Presentación frontal con el Flipchart proyectado frente al aula (identificación de sonido y formación silábica).",
        "Minutos 25–45: Práctica activa en el cuaderno del estudiante (dispositivo individual o copia impresa).",
        "Minutos 45–55: Cierre grupal, lectura compartida y registro de avances en el CRM de la clase.",
        "Minutos 55–60: Asignación de la rima para el hogar.",
      ],
      en: [
        "Minutes 1–10: Phonetic warm-up and review of the previous lesson rhyme.",
        "Minutes 10–25: Frontal presentation with the projected Flipchart (sound identification and syllable formation).",
        "Minutes 25–45: Active practice in student workbook (individual device or printed booklet).",
        "Minutes 45–55: Group wrap-up, shared reading, and progress logging in class CRM.",
        "Minutes 55–60: Homework rhyme assignment.",
      ],
    },
    links: [
      { label: "Abrir Rotafolio / Flipchart", to: "/cartilla/teacher/flipchart" },
      { label: "Ir al Panel de Clase (CRM)", to: "/cartilla/teacher/crm" },
    ],
    relatedTopics: ["rotafolio", "cuaderno-estudiante", "poemas-audio"],
    quickPrompt: {
      es: "¿Cómo organizo el tiempo de una sesión de 50 minutos?",
      en: "How do I structure a 50-minute lesson?",
    },
  },
  {
    id: "rotafolio",
    category: "materiales",
    keywords: [
      "rotafolio",
      "flipchart",
      "presentar",
      "proyector",
      "pantalla",
      "puntero",
      "laser",
      "frontal",
      "present",
      "projector",
    ],
    title: {
      es: "Uso del Rotafolio Digital (Flipchart Frontal)",
      en: "Using the Digital Flipchart (Frontal Display)",
    },
    summary: {
      es: "El Rotafolio vive en /cartilla/teacher/flipchart y es exclusivo del docente. Está optimizado para pantallas grandes y proyectores en el salón de clases, permitiendo guiar la atención sin distracciones.",
      en: "The Flipchart lives at /cartilla/teacher/flipchart and is teacher-exclusive. It is optimized for large screens and classroom projectors to guide group attention without distractions.",
    },
    actionableSteps: {
      es: [
        "Usa el botón de Pantalla Completa (F) para eliminar las barras del navegador.",
        "Activa el puntero láser digital para resaltar la consonante y vocal que se están combinando.",
        "Pide a los alumnos que repitan al unísono el sonido silábico al señalar cada recuadro.",
        "Recuerda: Los estudiantes nunca acceden al flipchart directamente; es una herramienta de exposición docente.",
      ],
      en: [
        "Use the Fullscreen button (F) to hide browser chrome.",
        "Toggle the digital laser pointer to highlight the letter combination being taught.",
        "Have students chant syllable sounds in unison as you point to each cell.",
        "Remember: Students never access the flipchart directly; it is an educator presentation tool.",
      ],
    },
    links: [
      { label: "Proyectar Flipchart Ahora", to: "/cartilla/teacher/flipchart" },
      { label: "Ver Guía de Presentación", to: "/cartilla/teacher/ayuda" },
    ],
    relatedTopics: ["estructura-clase", "tablas-silabicas"],
    quickPrompt: {
      es: "¿Cómo uso el rotafolio / flipchart en el aula?",
      en: "How do I use the flipchart in class?",
    },
  },
  {
    id: "cuaderno-estudiante",
    category: "aula",
    keywords: [
      "cuaderno",
      "estudiante",
      "alumno",
      "trazo",
      "dibujo",
      "escritura",
      "ejercicios",
      "practica",
      "workbook",
      "student",
    ],
    title: {
      es: "Coordinación con el Cuaderno del Estudiante",
      en: "Student Workbook Coordination",
    },
    summary: {
      es: "El cuaderno interactivo del estudiante (/cartilla/lecciones) permite trazar letras, realizar discriminación de imágenes y resolver lecturas silábicas. Los trazos y respuestas se guardan automáticamente en el navegador de cada alumno.",
      en: "The student interactive workbook (/cartilla/lecciones) allows tracing letters, image discrimination, and solving syllable readings. Strokes and answers persist automatically in each student's browser.",
    },
    actionableSteps: {
      es: [
        "Asigna la lección correspondiente desde el panel de Clase (CRM) para que aparezca destacada al alumno.",
        "Monitorea que utilicen el lápiz digital o dedo con el trazo correcto de arriba a abajo e izquierda a derecha.",
        "Si no hay dispositivos suficientes, imprime las fichas de trabajo correspondientes desde el módulo Imprimir.",
      ],
      en: [
        "Assign the corresponding lesson from the Class CRM panel so it is highlighted for the student.",
        "Monitor that they trace with correct top-down and left-to-right directionality.",
        "If 1:1 devices are unavailable, print corresponding worksheets from the Print module.",
      ],
    },
    links: [
      { label: "Asignar lección en Clase", to: "/cartilla/teacher/crm" },
      { label: "Imprimir Fichas y Cuadernos", to: "/cartilla/imprimir/all" },
    ],
    relatedTopics: ["crm-seguimiento", "imprimir", "alumnos-rezago"],
    quickPrompt: {
      es: "¿Cómo sincronizo el cuaderno del alumno con mi clase?",
      en: "How do I coordinate the student workbook with my class?",
    },
  },
  {
    id: "crm-seguimiento",
    category: "gestion",
    keywords: [
      "crm",
      "clase",
      "seguimiento",
      "alumnos",
      "roster",
      "estados",
      "asignar",
      "progreso",
      "class",
      "tracking",
    ],
    title: {
      es: "Gestión de Clase y Seguimiento Individual (CRM)",
      en: "Class Management and Student Tracking (CRM)",
    },
    summary: {
      es: "El CRM docente (/cartilla/teacher/crm) muestra una matriz de 4 estados por lección y alumno: Sin empezar, En progreso, Completada y Asignada (punto azul).",
      en: "The teacher CRM (/cartilla/teacher/crm) displays a 4-state matrix per lesson and student: Not started, In progress, Completed, and Assigned (blue dot).",
    },
    actionableSteps: {
      es: [
        "Crea tu clase con el nombre del grado o grupo (ej. 1° Primaria A).",
        "Agrega a tus estudiantes solo con su primer nombre y apellido (sin requerir correos electrónicos).",
        "Toca 'Asignar' en una lección para marcarla como objetivo de la semana.",
        "Revisa la columna de estado al final de cada sesión para detectar quién necesita apoyo antes de la evaluación.",
      ],
      en: [
        "Create your class with grade or group name (e.g. 1st Grade A).",
        "Add students by first and last name (no child emails required).",
        "Tap 'Assign' on a lesson to set it as the target for the week.",
        "Review the status column at the end of each session to spot who needs intervention before evaluation.",
      ],
    },
    links: [
      { label: "Abrir Panel de Clase (CRM)", to: "/cartilla/teacher/crm" },
      { label: "Ver Directorio de Alumnos (Roster)", to: "/cartilla/teacher/roster" },
    ],
    relatedTopics: ["evaluacion", "codigos-familia", "reportes"],
    quickPrompt: {
      es: "¿Cómo uso el CRM para monitorear el avance de mis alumnos?",
      en: "How do I use the CRM to track student progress?",
    },
  },
  {
    id: "evaluacion",
    category: "evaluacion",
    keywords: [
      "evaluacion",
      "rubrica",
      "diagnostico",
      "fluidez",
      "nivel lector",
      "presilabico",
      "silabico",
      "alfabetico",
      "assessment",
      "rubric",
    ],
    title: {
      es: "Evaluación Diagnóstica y Rúbrica de Fluidez Lector",
      en: "Diagnostic Assessment and Reading Fluency Rubric",
    },
    summary: {
      es: "Evalúa con criterios formativos cada 4 lecciones usando las pruebas diagnósticas incluidas en la carpeta Evaluaciones de la Guía del Profesor.",
      en: "Assess with formative criteria every 4 lessons using the diagnostic tests in the Assessments folder of the Teacher Guide.",
    },
    actionableSteps: {
      es: [
        "Nivel 1 (Pre-silábico): Reconoce sonidos de vocales aisladas e identifica que el texto tiene significado.",
        "Nivel 2 (Silábico): Asocia cada vocal con su consonante correspondiente en sílabas directas (ma, me, mi, mo, mu).",
        "Nivel 3 (Silábico-Alfabético): Lee palabras bisílabas y trisílabas sencillas (mesa, pato, pelota) con segmentación auditiva.",
        "Nivel 4 (Alfabético / Fluidez): Lee oraciones cortas con entonación natural y comprensión inmediata.",
        "Registra las observaciones cualitativas en la ficha individual de cada alumno en el CRM.",
      ],
      en: [
        "Level 1 (Pre-syllabic): Recognizes isolated vowel sounds and understands text carries meaning.",
        "Level 2 (Syllabic): Associates consonants with vowels in direct syllables (ma, me, mi, mo, mu).",
        "Level 3 (Syllabic-Alphabetic): Reads 2- and 3-syllable words (mesa, pato, pelota) with phonetic segmentation.",
        "Level 4 (Alphabetic / Fluency): Reads short sentences with natural rhythm and immediate comprehension.",
        "Log qualitative notes in the student's individual profile in the CRM.",
      ],
    },
    links: [
      { label: "Ver Evaluaciones en la Guía", to: "/cartilla/teacher/guia", search: { folder: "evaluaciones" } },
      { label: "Ver Reportes de Progreso", to: "/cartilla/teacher/reportes" },
    ],
    relatedTopics: ["crm-seguimiento", "alumnos-rezago", "metodologia"],
    quickPrompt: {
      es: "¿Cómo evalúo el nivel lector de mis estudiantes?",
      en: "How do I assess my students' reading levels?",
    },
  },
  {
    id: "tablas-silabicas",
    category: "materiales",
    keywords: [
      "tablas",
      "mural",
      "silabas",
      "vocales",
      "cartel",
      "dictado",
      "relampago",
      "matrices",
      "syllable tables",
      "charts",
    ],
    title: {
      es: "Estrategias con Tablas Silábicas y de Vocales",
      en: "Strategies with Syllabic and Vowel Charts",
    },
    summary: {
      es: "Las tablas silábicas son matrices visuales que conectan consonantes en filas con vocales en columnas, permitiendo juegos de lectura rápida y discriminación cruzada.",
      en: "Syllabic tables are visual matrices connecting consonants in rows with vowels in columns, enabling fast-reading games and cross-grid discrimination.",
    },
    actionableSteps: {
      es: [
        "Realiza 'Dictados relámpago': Nombra una sílaba (ej. 'so') y pide a un alumno señalarla en el cartel mural en menos de 5 segundos.",
        "Juego de saltos: Pide que lean filas de izquierda a derecha (sa, se, si, so, su) y luego columnas de arriba a abajo (ma, pa, sa, la, ta).",
        "Usa las tablas impresas de bolsillo para que los estudiantes construyan palabras cortando y uniendo tarjetas de sílabas.",
      ],
      en: [
        "Conduct 'Lightning dictations': Call out a syllable (e.g. 'so') and have a student locate it on the mural within 5 seconds.",
        "Grid hops: Have students read rows left to right (sa, se, si, so, su) and columns top to bottom (ma, pa, sa, la, ta).",
        "Use pocket-sized printable tables for tactile word-building exercises.",
      ],
    },
    links: [
      { label: "Abrir Tablas en la Guía", to: "/cartilla/teacher/guia", search: { folder: "tablas" } },
      { label: "Imprimir Tablas Murales", to: "/cartilla/imprimir/all" },
    ],
    relatedTopics: ["metodologia", "rotafolio", "alumnos-rezago"],
    quickPrompt: {
      es: "¿Cómo aprovecho las tablas silábicas en clase?",
      en: "How can I leverage syllable tables in class?",
    },
  },
  {
    id: "alumnos-rezago",
    category: "aula",
    keywords: [
      "rezago",
      "dificultad",
      "apoyo",
      "intervencion",
      "dislexia",
      "confusion",
      "letras",
      "lento",
      "remediation",
      "support",
    ],
    title: {
      es: "Intervención Oportuna para Alumnos con Rezago",
      en: "Targeted Intervention for Struggling Students",
    },
    summary: {
      es: "Cuando un estudiante tiene dificultades para consolidar el principio alfabético o confunde grafías similares (b/d, p/q, m/n), aplica intervención multisensorial focalizada.",
      en: "When a student struggles to grasp the alphabetic principle or confuses mirror letters (b/d, p/q, m/n), apply focused multisensory intervention.",
    },
    actionableSteps: {
      es: [
        "Refuerzo auditivo y kinestésico: Haz que aplaudan con cada sílaba y tracen la letra en arena o superficie rugosa antes de escribir.",
        "Aislamiento fonémico: Pídeles que sostengan un espejo para observar la posición de labios y lengua al pronunciar /m/, /p/, /t/.",
        "Grupos de nivel flexible: Dedica 15 minutos de la sesión a trabajar con el grupo de apoyo mientras el resto avanza en actividades autónomas de lectura.",
        "No avances a la siguiente consonante hasta que reconozca con seguridad las vocales y al menos dos consonantes base (M y P).",
      ],
      en: [
        "Auditory and kinesthetic reinforcement: Have them clap per syllable and trace letters in sand before writing on paper.",
        "Phonemic isolation: Use mirrors so students observe mouth/tongue shape when pronouncing /m/, /p/, /t/.",
        "Flexible tiered groups: Dedicate 15 minutes to the support group while confident readers tackle extension stories.",
        "Do not advance to new consonants until vowels and anchor consonants (M and P) are stable.",
      ],
    },
    links: [
      { label: "Ver Alumnos en Riesgo en Reportes", to: "/cartilla/teacher/reportes" },
      { label: "Abrir Guía Pedagógica", to: "/cartilla/teacher/guia" },
    ],
    relatedTopics: ["evaluacion", "tablas-silabicas", "estructura-clase"],
    quickPrompt: {
      es: "¿Qué hago con los alumnos que confunden letras o van más lento?",
      en: "What should I do for students who confuse letters or lag behind?",
    },
  },
  {
    id: "codigos-familia",
    category: "gestion",
    keywords: [
      "codigo",
      "unirse",
      "familia",
      "padres",
      "casa",
      "tarea",
      "acceso",
      "privacidad",
      "join",
      "parents",
      "code",
    ],
    title: {
      es: "Códigos de Clase e Involucramiento de las Familias",
      en: "Class Codes and Family Engagement",
    },
    summary: {
      es: "Los estudiantes y sus familias nunca crean cuentas con contraseña ni proporcionan datos personales. Entran a /cartilla/unirse únicamente con el código alfanumérico generado por el docente.",
      en: "Students and families never create accounts with passwords or provide personal credentials. They join at /cartilla/unirse strictly using the educator-generated class code.",
    },
    actionableSteps: {
      es: [
        "Copia el código de unión desde la pantalla de Clase (/cartilla/teacher/crm).",
        "Compártelo en la libreta de comunicaciones o chat de padres con instrucciones breves: 'Entrar a /cartilla/unirse, escribir el código y tocar el nombre de su hijo'.",
        "Asigna la rima semanal de la carpeta 'Tareas' para lectura compartida en casa durante 10 minutos al día.",
        "Aclara a las familias que la app funciona sin costo y sin anuncios comerciales.",
      ],
      en: [
        "Copy the join code from the Class screen (/cartilla/teacher/crm).",
        "Share it via noticeboard or parent chat with simple instructions: 'Visit /cartilla/unirse, enter the code, and tap your child's name'.",
        "Assign the weekly rhyme from the 'Homework' folder for 10-minute daily shared home reading.",
        "Assure parents that the platform is 100% free of advertising and zero personal data is gathered from minors.",
      ],
    },
    links: [
      { label: "Obtener Código de Clase en CRM", to: "/cartilla/teacher/crm" },
      { label: "Ver Tareas para el Hogar", to: "/cartilla/teacher/guia", search: { folder: "tareas" } },
    ],
    relatedTopics: ["crm-seguimiento", "poemas-audio"],
    quickPrompt: {
      es: "¿Cómo explico a los padres cómo ingresar con el código de clase?",
      en: "How do I explain class join codes to parents?",
    },
  },
  {
    id: "poemas-audio",
    category: "materiales",
    keywords: [
      "poemas",
      "rimas",
      "audio",
      "musica",
      "ritmo",
      "cancion",
      "entonacion",
      "poems",
      "audio",
      "rhymes",
    ],
    title: {
      es: "Integración de Poemas, Rimas y Audio Rítmico",
      en: "Integrating Poems, Rhymes, and Rhythmic Audio",
    },
    summary: {
      es: "Cada lección cuenta con un poema o rima rítmica diseñada para ejercitar la conciencia fonológica y el compás silábico de forma lúdica y memorable.",
      en: "Every lesson features an authentic poem or rhythmic rhyme tailored to develop phonological awareness and syllabic cadence in an engaging way.",
    },
    actionableSteps: {
      es: [
        "Reproduce la rima durante los primeros 5 minutos para ambientar la sesión.",
        "Realiza lectura coral: El docente lee un verso y los estudiantes repiten con énfasis en la rima consonante.",
        "Pídeles que aplaudan en cada acento rítmico para interiorizar la división silábica natural del español.",
        "Asigna el poema a casa como lectura compartida con padres o tutores.",
      ],
      en: [
        "Play the rhyme during the first 5 minutes to set a joyful tone.",
        "Practice choral reading: Teacher recites a verse and pupils repeat emphasizing rhyming syllables.",
        "Have children clap on stressed syllables to internalize Spanish rhythmic cadence.",
        "Assign the poem for shared family reading at home.",
      ],
    },
    links: [
      { label: "Ver Poemas y Audios en la Guía", to: "/cartilla/teacher/guia", search: { folder: "poemas" } },
      { label: "Ir al Rotafolio", to: "/cartilla/teacher/flipchart" },
    ],
    relatedTopics: ["metodologia", "estructura-clase", "codigos-familia"],
    quickPrompt: {
      es: "¿Cómo utilizo las rimas y poemas rítmicos en clase?",
      en: "How do I incorporate rhythmic rhymes into my lessons?",
    },
  },
  {
    id: "imprimir",
    category: "materiales",
    keywords: [
      "imprimir",
      "pdf",
      "papel",
      "descargar",
      "fichas",
      "hojas",
      "impresion",
      "cuadernillo",
      "print",
      "worksheet",
    ],
    title: {
      es: "Materiales Imprimibles y Cuadernillos de Trabajo",
      en: "Printable Materials and Student Worksheets",
    },
    summary: {
      es: "Todo el contenido de La Cartilla de Gretel puede imprimirse directamente en formato estándar (Carta / A4) desde /cartilla/imprimir/all para aulas sin conexión a internet.",
      en: "All Cartilla de Gretel materials can be printed directly in standard paper formats (Letter / A4) via /cartilla/imprimir/all for offline classrooms.",
    },
    actionableSteps: {
      es: [
        "Accede a /cartilla/imprimir/all desde el menú superior del Panel del Docente.",
        "Selecciona el cuadernillo completo o lecciones individuales según la necesidad del día.",
        "Los estilos de impresión están optimizados en blanco y negro de alto contraste para economizar tinta de tóner escolar.",
      ],
      en: [
        "Access /cartilla/imprimir/all from the Teacher Panel top navigation.",
        "Choose either the full workbook or specific lesson worksheets for the day.",
        "Print stylesheets are optimized in crisp high-contrast black-and-white to conserve school toner.",
      ],
    },
    links: [
      { label: "Abrir Centro de Impresión", to: "/cartilla/imprimir/all" },
      { label: "Ver Fichas en la Guía", to: "/cartilla/teacher/guia" },
    ],
    relatedTopics: ["cuaderno-estudiante", "tablas-silabicas"],
    quickPrompt: {
      es: "¿Cómo imprimo las lecciones y fichas de trabajo?",
      en: "How do I print lessons and student worksheets?",
    },
  },
];

export function searchTeacherKB(query: string, lang: Lang = "es"): TeacherTopic[] {
  const clean = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  if (!clean) return TEACHER_TOPICS;

  const words = clean.split(/\s+/).filter(Boolean);

  const scored = TEACHER_TOPICS.map((topic) => {
    let score = 0;
    const targetKeywords = topic.keywords.map((k) =>
      k
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
    );
    const title = topic.title[lang]
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const summary = topic.summary[lang]
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    for (const w of words) {
      if (topic.id.includes(w)) score += 15;
      if (title.includes(w)) score += 12;
      for (const kw of targetKeywords) {
        if (kw === w) score += 10;
        else if (kw.includes(w)) score += 6;
      }
      if (summary.includes(w)) score += 3;
    }

    return { topic, score };
  });

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.topic);
}

export function getTeacherTopicById(id: string): TeacherTopic | undefined {
  return TEACHER_TOPICS.find((t) => t.id === id);
}
