import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Sparkles,
  Search,
  BookOpen,
  Clock,
  MonitorPlay,
  ClipboardCheck,
  Users,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  GraduationCap,
} from "lucide-react";
import { GRETEL_APPROVED_MASTER_SRC } from "@/lib/gretel-master";
import {
  TEACHER_TOPICS,
  searchTeacherKB,
  type TeacherTopic,
  type Lang,
} from "@/lib/gretel-teacher-kb";

export const Route = createLazyFileRoute("/cartilla/teacher/gretel")({
  component: TeacherGretelPage,
});

const CATEGORIES = [
  { id: "all", label: { es: "Todos los temas", en: "All topics" }, icon: BookOpen },
  { id: "metodologia", label: { es: "Metodología", en: "Methodology" }, icon: GraduationCap },
  { id: "aula", label: { es: "Gestión en Aula", en: "Classroom Pacing" }, icon: Clock },
  { id: "materiales", label: { es: "Rotafolio y Materiales", en: "Flipchart & Media" }, icon: MonitorPlay },
  { id: "evaluacion", label: { es: "Evaluación y Rúbricas", en: "Assessment & Rubrics" }, icon: ClipboardCheck },
  { id: "gestion", label: { es: "Familias y CRM", en: "Families & CRM" }, icon: Users },
] as const;

function TeacherGretelPage() {
  const [lang, setLang] = useState<Lang>("es");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTopicId, setActiveTopicId] = useState<string>("metodologia");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTopics = useMemo(() => {
    let list = TEACHER_TOPICS;
    if (searchQuery.trim()) {
      list = searchTeacherKB(searchQuery, lang);
    }
    if (selectedCategory !== "all") {
      list = list.filter((t) => t.category === selectedCategory);
    }
    return list;
  }, [searchQuery, selectedCategory, lang]);

  const activeTopic: TeacherTopic | undefined = useMemo(() => {
    const found = filteredTopics.find((t) => t.id === activeTopicId);
    return found || filteredTopics[0] || TEACHER_TOPICS[0];
  }, [filteredTopics, activeTopicId]);

  const handleCopyNotes = (topic: TeacherTopic) => {
    const text = [
      `📘 ${topic.title[lang]}`,
      "",
      topic.summary[lang],
      "",
      lang === "es" ? "Pasos clave:" : "Key steps:",
      ...topic.actionableSteps[lang].map((s, idx) => `${idx + 1}. ${s}`),
    ].join("\n");

    navigator.clipboard?.writeText(text);
    setCopiedId(topic.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <header className="teacher-chrome__card rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-amber-50 via-white to-orange-50/50 border border-amber-200/80 shadow-xs flex flex-col md:flex-row items-center gap-6">
        <div className="relative shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-amber-400/30 shadow-md bg-amber-100 flex items-center justify-center">
            <img
              src={GRETEL_APPROVED_MASTER_SRC}
              alt="Gretel"
              className="w-full h-full object-cover object-top"
              loading="eager"
            />
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-600 text-white shadow-xs">
            Docente
          </span>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-black tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Asistente Pedagógica para Docentes</span>
          </div>
          <h1 className="teacher-chrome__title text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900">
            {lang === "es" ? "Consulta Pedagógica con Gretel" : "Pedagogical Guide with Gretel"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 font-medium max-w-2xl">
            {lang === "es"
              ? "Orientación metodológica, dosificación de tiempos de clase, uso del rotafolio, estrategias de evaluación y apoyo a alumnos con rezago."
              : "Methodological advice, lesson pacing, flipchart usage, assessment strategies, and support for struggling students."}
          </p>
        </div>

        <div className="shrink-0 self-center md:self-start">
          <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-300">
            <button
              type="button"
              onClick={() => setLang("es")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${
                lang === "es" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${
                lang === "en" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <Link
        to="/cartilla/suplente"
        className="inline-flex min-h-12 items-center rounded-xl border border-teal-300 bg-teal-50 px-5 py-3 text-sm font-black text-teal-900 hover:bg-teal-100"
      >
        Abrir Maestra suplente · Guía local de las 24 lecciones →
      </Link>

      {/* Search and Prompt Quick Filters */}
      <section className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === "es"
                ? "Buscar tema pedagógico (ej. dosificación de clase, rezago, flipchart, rúbrica, familias)..."
                : "Search pedagogical topic (e.g. pacing, flipchart, rubric, struggling students)..."
            }
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-stone-200 text-stone-900 placeholder-stone-400 font-medium focus:border-amber-500 focus:outline-hidden transition-colors shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label[lang]}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Suggested Questions Grid */}
      <section className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
          {lang === "es" ? "Preguntas Frecuentes de Maestros:" : "Common Teacher Inquiries:"}
        </p>
        <div className="flex flex-wrap gap-2">
          {TEACHER_TOPICS.slice(0, 6).map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => {
                setActiveTopicId(topic.id);
                setSearchQuery("");
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all text-left ${
                activeTopic?.id === topic.id
                  ? "bg-amber-100 border-amber-300 text-amber-900"
                  : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
              }`}
            >
              {topic.quickPrompt[lang]}
            </button>
          ))}
        </div>
      </section>

      {/* Main Two-Column Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Topic List */}
        <aside className="lg:col-span-5 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
            {lang === "es" ? "Temas Disponibles" : "Available Topics"} ({filteredTopics.length})
          </p>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredTopics.map((topic) => {
              const isSelected = activeTopic?.id === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setActiveTopicId(topic.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? "bg-white border-amber-500 shadow-md ring-2 ring-amber-400/20"
                      : "bg-white/80 border-stone-200 hover:bg-white hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-700">
                      {topic.category}
                    </span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                  </div>
                  <h3 className="font-black text-stone-900 text-sm mt-1">{topic.title[lang]}</h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-snug">
                    {topic.summary[lang]}
                  </p>
                </button>
              );
            })}

            {filteredTopics.length === 0 && (
              <div className="p-8 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
                <HelpCircle className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                <p className="text-sm font-bold">
                  {lang === "es" ? "No se encontraron temas coincidentes" : "No matching topics found"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-3 text-xs font-bold text-amber-700 hover:underline"
                >
                  {lang === "es" ? "Restablecer filtros" : "Reset filters"}
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Right Column: Detailed Pedagogical Guide Card */}
        {activeTopic && (
          <main className="lg:col-span-7 teacher-chrome__card rounded-3xl p-6 sm:p-8 space-y-6 bg-white border border-stone-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                  {activeTopic.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-2">
                  {activeTopic.title[lang]}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => handleCopyNotes(activeTopic)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors"
                title={lang === "es" ? "Copiar notas de lección" : "Copy lesson notes"}
              >
                {copiedId === activeTopic.id ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{lang === "es" ? "Copiado" : "Copied"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-stone-500" />
                    <span>{lang === "es" ? "Copiar guía" : "Copy notes"}</span>
                  </>
                )}
              </button>
            </div>

            {/* Summary Block */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-stone-800 text-sm leading-relaxed font-medium">
              {activeTopic.summary[lang]}
            </div>

            {/* Actionable Steps */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-500">
                {lang === "es" ? "Pasos Pedagógicos Recomendados:" : "Recommended Pedagogical Steps:"}
              </h4>
              <ul className="space-y-2.5">
                {activeTopic.actionableSteps[lang].map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-stone-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Direct Tool Links */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-500">
                {lang === "es" ? "Herramientas Relacionadas en el Panel:" : "Related Teacher Tools:"}
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {activeTopic.links.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to as never}
                    search={link.search as never}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-xs"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Related Topics */}
            {activeTopic.relatedTopics.length > 0 && (
              <div className="pt-2 border-t border-stone-100">
                <span className="text-xs font-bold text-stone-500 mr-2">
                  {lang === "es" ? "Temas vinculados:" : "Linked topics:"}
                </span>
                <div className="inline-flex flex-wrap gap-1.5 mt-2">
                  {activeTopic.relatedTopics.map((relId) => {
                    const related = TEACHER_TOPICS.find((t) => t.id === relId);
                    if (!related) return null;
                    return (
                      <button
                        key={relId}
                        type="button"
                        onClick={() => setActiveTopicId(relId)}
                        className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                      >
                        <span>{related.title[lang]}</span>
                        <ArrowRight className="w-3 h-3 text-stone-400" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </main>
        )}
      </div>

      {/* Bottom Hub Navigation */}
      <nav className="flex flex-wrap gap-3 pt-4 border-t border-stone-200">
        <Link
          to="/cartilla/teacher"
          className="min-h-12 inline-flex items-center px-5 py-3 rounded-2xl bg-stone-900 text-white font-bold hover:bg-stone-800 transition-colors"
        >
          {lang === "es" ? "Volver al Panel del Docente" : "Back to Teacher Hub"}
        </Link>
        <Link
          to="/cartilla/teacher/guia"
          className="min-h-12 inline-flex items-center px-5 py-3 rounded-2xl border-2 border-stone-300 font-bold text-stone-800 hover:bg-stone-100 transition-colors"
        >
          {lang === "es" ? "Ir a la Guía del Profesor" : "Go to Teacher Guide"}
        </Link>
        <Link
          to="/cartilla/teacher/flipchart"
          className="min-h-12 inline-flex items-center px-5 py-3 rounded-2xl border-2 border-stone-300 font-bold text-stone-800 hover:bg-stone-100 transition-colors"
        >
          {lang === "es" ? "Proyectar Flipchart" : "Project Flipchart"}
        </Link>
      </nav>
    </div>
  );
}
