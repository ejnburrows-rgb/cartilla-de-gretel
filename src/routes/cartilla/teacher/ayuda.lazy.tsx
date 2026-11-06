import { createLazyFileRoute, Link } from "@tanstack/react-router";
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
  Sparkles,
} from "lucide-react";

export const Route = createLazyFileRoute("/cartilla/teacher/ayuda")({
  component: TeacherAyudaPage,
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
            <strong>Pantalla completa:</strong> botón en la barra o tecla <code>F</code> para
            proyectar sin barras del navegador.
          </li>
          <li>
            <strong>Puntero láser:</strong> botón con ícono de mira o tecla <code>L</code> para
            resaltar una parte de la lección mientras hablas.
          </li>
          <li>
            <strong>Flechas ← y →</strong> (o las flechas del teclado) para avanzar o retroceder
            entre páginas de la lección.
          </li>
          <li>
            <strong>Selector de lección:</strong> menú desplegable arriba para saltar directo a
            cualquiera de las 24 lecciones.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "progreso",
    number: 6,
    title: "Cómo ver el progreso de los alumnos",
    icon: <BarChart3 className="w-5 h-5" />,
    accent: "#0f766e",
    body: (
      <>
        <p>
          El progreso se ve en dos niveles: en <strong>Clase</strong> ves el tablero en vivo con
          cuadritos de colores por lección y por alumno. En <strong>Reportes</strong> ves las métricas
          consolidadas: porcentaje de completitud por lección, quién va al día y quién se ha
          quedado atrás.
        </p>
        <p>
          El tablero usa 4 estados claros:
        </p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>
            <strong>Gris:</strong> sin empezar.
          </li>
          <li>
            <strong>Amarillo:</strong> en progreso (el alumno ya abrió la lección).
          </li>
          <li>
            <strong>Verde:</strong> completada (pasó todas las páginas requeridas).
          </li>
          <li>
            <strong>Punto azul:</strong> asignada por el docente (tarea pendiente para ese alumno).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "guia",
    number: 7,
    title: "Qué hay en cada carpeta de la Guía",
    icon: <BookOpen className="w-5 h-5" />,
    accent: "#0f766e",
    body: (
      <>
        <p>
          La <strong>Guía</strong> organiza todo el material oficial en 5 carpetas de colores,
          cada una con las 24 lecciones completas:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Guía del Profesor (verde):</strong> objetivos pedagógicos, vocabulario clave,
            desglose de la lección y sugerencias didácticas.
          </li>
          <li>
            <strong>Tablas Silábicas y de Vocales (esmeralda):</strong> las tablas murales de cada
            lección para trabajar el reconocimiento rápido de sílabas.
          </li>
          <li>
            <strong>Tareas para el Hogar (ámbar):</strong> rimas cortas para que los niños lean en
            voz alta con su familia al terminar cada lección.
          </li>
          <li>
            <strong>Evaluaciones (púrpura):</strong> pruebas formativas para medir si el alumno ya
            domina las sílabas de esa lección antes de avanzar.
          </li>
          <li>
            <strong>Poemas y Audio (rosa):</strong> el poema rítmico oficial de cada lección junto
            con su pista de audio grabada.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "imprimir",
    number: 8,
    title: "Cómo imprimir o exportar",
    icon: <NotebookPen className="w-5 h-5" />,
    accent: "#0f766e",
    body: (
      <>
        <p>
          Toca <strong>Imprimir</strong> en la barra de arriba (o <code>/cartilla/imprimir/all</code>)
          para generar hojas listas para imprimir en blanco y negro o color:
        </p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>
            <strong>Cuadernillo completo:</strong> todas las lecciones del estudiante juntas.
          </li>
          <li>
            <strong>Lección individual:</strong> solo la lección que vas a dar hoy.
          </li>
          <li>
            <strong>Reporte de clase:</strong> desde Reportes puedes imprimir la sábana completa de
            avance del grupo para la carpeta pedagógica o exportar a CSV para abrir en Excel.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "seguridad",
    number: 9,
    title: "Qué NO hacer (reglas del sistema)",
    icon: <ShieldAlert className="w-5 h-5" />,
    accent: "#dc2626",
    body: (
      <ul className="list-disc pl-6 space-y-2 text-[var(--tc-ink)]">
        <li>
          <strong>No compartas contraseñas de docente con estudiantes.</strong> Cada rol tiene su
          propia entrada (/cartilla/unirse vs. /login) y su propia vista — nunca vas a ver
          páginas del cuaderno del estudiante dentro de "Presentar", ni vas a ver el panel del
          docente desde el lado del estudiante.
        </li>
        <li>
          <strong>No inventes contenido.</strong> Cuando la Guía del profesor impresa no esté
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
  {
    id: "asistente-gretel",
    number: 11,
    title: "Asistente Pedagógica Gretel",
    icon: <Sparkles className="w-5 h-5" />,
    accent: "#ea580c",
    body: (
      <>
        <p>
          En <strong>Gretel</strong> (o en{" "}
          <code className="px-1.5 py-0.5 bg-[var(--tc-paper-soft)] rounded font-mono text-sm">
            /cartilla/teacher/gretel
          </code>
          ) tienes un asistente de consulta metodológica exclusivo para docentes. Te orienta en la
          progresión de las 24 lecciones, cómo dosificar una clase de 50 minutos, cómo intervenir con
          alumnos con rezago lector y cómo coordinar el rotafolio frontal con el cuaderno individual.
        </p>
        <p>
          Puedes copiar las notas pedagógicas y los pasos recomendados directamente a tu plan de
          clase con un solo clic.
        </p>
      </>
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
          to="/cartilla/teacher/gretel"
          className="min-h-12 inline-flex items-center px-5 py-3 rounded-2xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors"
        >
          Consultar a Gretel Asistente
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
