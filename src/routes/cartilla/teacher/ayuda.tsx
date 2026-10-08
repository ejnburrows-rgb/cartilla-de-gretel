import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LogIn,
  GraduationCap,
  UserPlus,
  ClipboardList,
  MonitorPlay,
  BarChart3,
  BookOpen,
  NotebookPen,
  ShieldAlert,
  ListOrdered,
} from "lucide-react";

export const Route = createFileRoute("/cartilla/teacher/ayuda")({
  component: TeacherAyudaPage,
  head: () => ({
    meta: [
      { title: "Ayuda para el Docente — La Cartilla de Gretel" },
      {
        name: "description",
        content:
          "Guía completa para usar la app en clase: entrar, crear clase, agregar alumnos, asignar, presentar y ver progreso.",
      },
    ],
  }),
});

interface Section {
  id: string;
  number: number;
  title: string;
  icon: React.ReactNode;
  accent: string;
  body: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    id: "entrar",
    number: 1,
    title: "Cómo entrar",
    icon: <LogIn className="w-5 h-5" />,
    accent: "#0f766e",
    body: (
      <>
        <p>
          Entra en{" "}
          <code className="px-1.5 py-0.5 bg-[var(--tc-paper-soft)] rounded font-mono text-sm">
            /login
          </code>{" "}
          con tu correo y contraseña de docente. Esa pantalla es solo para maestros — los
          estudiantes nunca usan este formulario, ellos entran con un código de clase en{" "}
          <code className="px-1.5 py-0.5 bg-[var(--tc-paper-soft)] rounded font-mono text-sm">
            /cartilla/unirse
          </code>
          .
        </p>
        <p>
          Una vez dentro, todo el panel del docente vive bajo <strong>Panel del Docente</strong>. La
          barra de arriba (o el menú ☰ en el celular) te lleva a cualquier tarea principal en un
          solo toque: Clase, Alumnos, Guía, Presentar, Reportes y esta misma Ayuda.
        </p>
      </>
    ),
  },
  {
    id: "clase",
    number: 2,
    title: "Cómo crear o abrir una clase",
    icon: <GraduationCap className="w-5 h-5" />,
    accent: "#0f766e",
    body: (
      <>
        <p>
          Toca <strong>Clase</strong> en la barra de arriba (o la tarjeta "Clase" en el Panel del
          Docente). Ahí puedes crear una clase nueva con un nombre, o abrir una clase que ya existe
          de una lista.
        </p>
        <p>
          Cada clase tiene su propio <strong>código de unión</strong> — ese código es lo único que
          las familias necesitan para que sus hijos entren a practicar. Puedes verlo y copiarlo
          desde la pantalla de la clase en cualquier momento.
        </p>
      </>
    ),
  },
  {
    id: "estudiantes",
    number: 3,
    title: "Cómo agregar estudiantes / código de unión",
    icon: <UserPlus className="w-5 h-5" />,
    accent: "#0f766e",
    body: (
      <>
        <p>
          Dentro de una clase, agrega estudiantes por nombre — no necesitan correo ni contraseña.
          Cada estudiante entra después en{" "}
          <code className="px-1.5 py-0.5 bg-[var(--tc-paper-soft)] rounded font-mono text-sm">
            /cartilla/unirse
          </code>{" "}
          con el código de la clase y toca su propio nombre en la lista.
        </p>
        <p>
          La pantalla de <strong>Alumnos</strong> (Roster) en la barra de arriba muestra el
          directorio completo de estudiantes de todas tus clases, con su estado de conexión y
          progreso básico de un vistazo.
        </p>
      </>
    ),
  },
  {
    id: "asignar",
    number: 4,
    title: "Cómo asignar lecciones o actividades",
    icon: <ClipboardList className="w-5 h-5" />,
    accent: "#0f766e",
    body: (
      <>
        <p>
          Hay dos lugares para asignar trabajo: desde <strong>Clase</strong> puedes asignar una
          lección completa a toda la clase o a estudiantes específicos. Desde <strong>Guía</strong>,
          dentro de cualquiera de las 5 carpetas, cada fila de lección tiene un botón{" "}
          <strong>"Asignar"</strong> que te deja mandar esa actividad puntual (la guía, la tabla, la
          tarea, la evaluación o el poema de esa lección) a la clase o a alumnos elegidos.
        </p>
        <p>
          El tablero de la clase muestra siempre 4 estados por lección y por alumno: sin empezar, en
          progreso, completada, y asignada (un punto azul) — así sabes de un vistazo qué falta.
        </p>
      </>
    ),
  },
  {
    id: "presentar",
    number: 5,
    title: "Cómo presentar el flipchart",
    icon: <MonitorPlay className="w-5 h-5" />,
    accent: "#d97706",
    body: (
      <>
        <p>
          Toca <strong>Presentar</strong> en la barra de arriba, o el botón "Presentar flipchart"
          dentro de cualquier lección en la Guía, para proyectar esa lección frente a la clase. Esta
          pantalla es solo para el maestro — el estudiante nunca ve esta vista, y esta vista nunca
          muestra las páginas del cuaderno del estudiante.
        </p>
        <p>Controles reales dentro del flipchart:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>
            <strong>Avanzar / retroceder lámina:</strong> toca las flechas en pantalla, o usa el
            teclado (flecha derecha, espacio o Av Pág para avanzar; flecha izquierda o Re Pág para
            retroceder).
          </li>
          <li>
            <strong>Pantalla completa:</strong> botón de expandir en la esquina — ideal para
            proyectar en el televisor o proyector del salón.
          </li>
          <li>
            <strong>Puntero láser:</strong> actívalo con su botón y mueve el mouse (o el dedo en
            pantalla táctil) para señalar algo en la lámina sin tapar el contenido.
          </li>
          <li>
            <strong>Salir:</strong> el botón de salir te regresa siempre al Panel del Docente, nunca
            al camino del estudiante.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "progreso",
    number: 6,
    title: "Cómo ver progreso por estudiante y por lección",
    icon: <BarChart3 className="w-5 h-5" />,
    accent: "#9333ea",
    body: (
      <>
        <p>
          Desde <strong>Clase</strong>, navega Panel → Clase → Estudiante → Lección para ver el
          detalle completo: intentos de actividad, puntuación, tiempo dedicado y la fecha de la
          última actividad. La vista de la clase también resalta primero a los estudiantes que
          necesitan atención (7 días o más sin actividad, o puntuaciones bajas repetidas).
        </p>
        <p>
          En <strong>Reportes</strong> encuentras el <strong>Reporte para Familias</strong> (una
          página imprimible por estudiante, con lecciones completadas, lección actual y un mensaje
          de aliento) y la <strong>exportación CSV</strong> del progreso de toda la clase, útil para
          tus propios registros.
        </p>
      </>
    ),
  },
  {
    id: "guia",
    number: 7,
    title: "Cómo usar la Guía del profesor por lección",
    icon: <BookOpen className="w-5 h-5" />,
    accent: "#4f46e5",
    body: (
      <>
        <p>
          <strong>Guía</strong> abre 5 carpetas de color: Guía del profesor (objetivos, motivación y
          guion palabra por palabra), Tablas silábicas y de vocales, Tareas para el hogar (la rima
          de práctica), Evaluaciones (referencia de página) y Poemas y audio. Toca una carpeta para
          ver las 24 lecciones dentro de esa categoría.
        </p>
        <p>
          Al abrir una lección completa (Folder "Guía del profesor"), tienes botones directos a{" "}
          <strong>Actividades del estudiante</strong> y a <strong>Presentar flipchart</strong> de
          esa misma lección — nunca tienes que adivinar a dónde ir después.
        </p>
        <p>
          Para las lecciones donde el escaneo impreso de la Guía del profesor de Leonor Lopetegui no
          existe en el repositorio, la app lo dice honestamente ("SOURCE-NOT-IN-REPO") en vez de
          mostrar una página en blanco o inventar contenido — y muestra igual lo que sí es real,
          como el poema cuando ya fue transcrito de las páginas reales del cuaderno.
        </p>
      </>
    ),
  },
  {
    id: "cuaderno",
    number: 8,
    title: "Cómo el estudiante usa el cuaderno (para poder guiarlo)",
    icon: <NotebookPen className="w-5 h-5" />,
    accent: "#0f766e",
    body: (
      <>
        <p>
          El estudiante entra con el código de la clase, elige su lección entre las 24 disponibles,
          y practica directamente sobre las páginas reales del libro: toca dibujos, traza letras,
          empareja sílabas — según lo que esa página pida. Su progreso se guarda solo, sin que tenga
          que hacer nada extra, cada vez que completa un ejercicio o termina una lección.
        </p>
        <p>
          Si estás sentado junto a un estudiante para ayudarlo, es la misma pantalla que ves tú al
          abrir esa lección desde el camino del estudiante — no hay una versión "secreta" distinta a
          la que juega el niño.
        </p>
      </>
    ),
  },
  {
    id: "no-hacer",
    number: 9,
    title: "Qué NO hacer",
    icon: <ShieldAlert className="w-5 h-5" />,
    accent: "#dc2626",
    body: (
      <ul className="list-disc pl-6 space-y-1.5">
        <li>
          <strong>No mezcles el camino del estudiante con el panel del docente.</strong> Cada uno
          tiene su propia entrada (código de clase vs. /login) y su propia vista — nunca vas a ver
          páginas del cuaderno del estudiante dentro de "Presentar", ni vas a ver el panel del
          docente desde el lado del estudiante.
        </li>
        <li>
          <strong>No inventes contenido.</strong> Cuando la Guía del profesor impresa no está
          disponible para una lección, la app lo dice claramente en vez de mostrar un texto
          inventado. Esa es una regla dura del proyecto, no un error a corregir tú mismo.
        </li>
        <li>
          <strong>No actives el modo de demostración en producción.</strong> El modo de datos de
          ejemplo existe solo para pruebas internas y está desactivado por diseño en el sitio real —
          no hay ninguna acción que un docente deba tomar aquí.
        </li>
      </ul>
    ),
  },
  {
    id: "orden-clase",
    number: 10,
    title: "Orden típico de una clase con esta app",
    icon: <ListOrdered className="w-5 h-5" />,
    accent: "#0f766e",
    body: (
      <ol className="list-decimal pl-6 space-y-2">
        <li>Entra en /login y abre la clase del día desde Clase.</li>
        <li>Revisa el tablero: quién necesita atención antes de empezar.</li>
        <li>
          Abre Presentar (o el botón "Presentar flipchart" desde Guía) para dar la lección de hoy
          frente a la clase, con pantalla completa y el puntero láser si hace falta.
        </li>
        <li>
          Cuando termine la parte de grupo, cada estudiante entra a practicar la lección en su
          propio dispositivo con el código de la clase.
        </li>
        <li>
          Mientras practican, usa la Guía para revisar objetivos, tareas para el hogar y la
          evaluación de esa lección.
        </li>
        <li>
          Al final, revisa Reportes o el tablero de Clase para ver quién completó la lección y quién
          necesita más práctica.
        </li>
        <li>Asigna la tarea para el hogar (la rima de la carpeta "Tareas") si corresponde.</li>
        <li>Repite con la siguiente lección en la próxima clase.</li>
      </ol>
    ),
  },
];

function TeacherAyudaPage() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-16">
      <header className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--tc-ink-faint)]">
          Panel del Docente
        </p>
        <h1 className="teacher-chrome__title text-3xl sm:text-4xl font-black">
          Ayuda para el Docente
        </h1>
        <p className="text-lg text-[var(--tc-ink-soft)] font-medium">
          Cómo usar La Cartilla de Gretel para dar clase, de principio a fin.
        </p>
      </header>

      <nav aria-label="Secciones" className="flex flex-wrap gap-2">
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="px-3 py-2 rounded-xl bg-white hover:bg-[var(--tc-paper-soft)] text-xs font-bold text-[var(--tc-ink)] border border-[var(--tc-border)] transition-colors"
          >
            {section.number}. {section.title}
          </a>
        ))}
      </nav>

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="teacher-chrome__card scroll-mt-24 rounded-3xl p-6 space-y-3"
          >
            <h2 className="teacher-chrome__title text-xl font-black flex items-center gap-3">
              <span
                className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-white"
                style={{ background: section.accent }}
              >
                {section.icon}
              </span>
              {section.number}. {section.title}
            </h2>
            <div className="text-[var(--tc-ink)] leading-relaxed font-medium space-y-3">
              {section.body}
            </div>
          </section>
        ))}
      </div>

      <nav className="flex flex-wrap gap-3 pt-4">
        <Link
          to="/cartilla/teacher"
          className="min-h-12 inline-flex items-center px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold"
        >
          Volver al Panel del Docente
        </Link>
        <Link
          to="/cartilla/teacher/crm"
          className="min-h-12 inline-flex items-center px-5 py-3 rounded-2xl border-2 border-[var(--tc-border)] font-bold text-[var(--tc-ink)]"
        >
          Ir a Clase
        </Link>
        <Link
          to="/cartilla/teacher/guia"
          className="min-h-12 inline-flex items-center px-5 py-3 rounded-2xl border-2 border-[var(--tc-border)] font-bold text-[var(--tc-ink)]"
        >
          Ir a la Guía
        </Link>
      </nav>
    </div>
  );
}
