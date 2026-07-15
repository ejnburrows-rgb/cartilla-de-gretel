import { X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getTeacherResource } from "@/content/teacher-resources";

interface TeacherResourcePanelProps {
  resourceId: string;
  onClose: () => void;
}

export function TeacherResourcePanel({ resourceId, onClose }: TeacherResourcePanelProps) {
  const { lang } = useLanguage(); // "es" or "en"
  const resource = getTeacherResource(resourceId);

  if (!resource) return null;

  // Bilingual fallback
  const getField = (field: { es: any; en: any }) =>
    field[lang] ?? field[lang === "es" ? "en" : "es"];

  const title = getField(resource.title);
  const summary = getField(resource.summary);
  const objective = getField(resource.objective);
  const whenToUse = getField(resource.whenToUse) as string[];
  const howItWorks = getField(resource.howItWorks) as string[];
  const teacherTips = getField(resource.teacherTips) as string[];

  // Warn if missing in current language
  if (!resource.title[lang] && (resource.title.es || resource.title.en)) {
    console.warn(`[TeacherResourcePanel] Missing translation for ${resourceId} in ${lang}`);
  }

  return (
    <div className="fixed inset-y-0 right-0 z-[100] flex w-full max-w-sm flex-col bg-stone-50 shadow-2xl transition-transform border-l border-stone-200 overflow-y-auto font-sans text-stone-800">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white/80 px-6 py-4 backdrop-blur">
        <h2 className="text-xl font-bold">{title}</h2>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors"
          aria-label="Cerrar panel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-6 p-6">
        <div>
          <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-stone-400">
            {lang === "en" ? "Summary" : "Resumen"}
          </h3>
          <p className="text-sm font-medium leading-relaxed">{summary}</p>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-stone-400">
            {lang === "en" ? "Learning objective" : "Objetivo de aprendizaje"}
          </h3>
          <p className="text-sm font-medium leading-relaxed">{objective}</p>
        </div>

        {whenToUse.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-stone-400">
              {lang === "en" ? "When to use" : "Cuándo usarlo"}
            </h3>
            <ul className="list-inside list-disc space-y-1 text-sm font-medium text-stone-700">
              {whenToUse.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {howItWorks.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-stone-400">
              {lang === "en" ? "How it works" : "Cómo funciona"}
            </h3>
            <ul className="list-inside list-disc space-y-1 text-sm font-medium text-stone-700">
              {howItWorks.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {teacherTips.length > 0 && (
          <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100">
            <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-amber-600">
              {lang === "en" ? "Teacher tips" : "Sugerencias para el docente"}
            </h3>
            <ul className="list-inside list-disc space-y-1 text-sm font-medium text-amber-800">
              {teacherTips.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
