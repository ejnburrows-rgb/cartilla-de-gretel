import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

interface ModelPage {
  sequence: string;
  lesson: number;
  page: number;
  route: string;
  approvedModel?: boolean;
}

interface ArchetypePageEntry {
  lesson: number;
  lessonLabel: string;
  sequence: string;
  pageNumber: number;
  route: string;
  flipchartRoute?: string;
  presentarRoute?: string | null;
  usesSharedContractKernel: boolean;
  sourceStatus: "AVAILABLE" | "SOURCE_BLOCKED";
}

interface ArchetypeTypeEntry {
  id: string;
  label: string;
  spanishLabel: string;
  surface: "workbook" | "flipchart";
  usesSharedContractKernel: boolean;
  kernelComponent: string;
  modelPages: ModelPage[];
  count: number;
  pages: ArchetypePageEntry[];
}

interface ArchetypesInventory {
  generatedAt: string;
  approvedModel: {
    lesson: number;
    workbookPages: number[];
    flipchartSheet: number;
    option: string;
  };
  totals: {
    workbookPages: number;
    workbookAvailable: number;
    workbookSourceBlocked: number;
    flipchartSheets: number;
    totalLessons: number;
  };
  types: Record<string, ArchetypeTypeEntry>;
}

const SEQUENCE_LABELS: Record<string, string> = {
  frontmatter: "Frontmatter",
  intro: "Intro (L1)",
  vowels: "Vowels (L2–6)",
  "first-consonants": "First Consonants (L7–14)",
  "later-consonants": "Later Consonants (L15–21)",
  combinations: "Combinations & Final (L22–24)",
};

export function ArchetypeGallery() {
  const [data, setData] = useState<ArchetypesInventory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [surfaceFilter, setSurfaceFilter] = useState<"all" | "workbook" | "flipchart">("all");

  useEffect(() => {
    let cancelled = false;
    fetch("/review/archetypes.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ArchetypesInventory>;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load archetypes");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const entries = data
    ? Object.values(data.types).filter((t) => surfaceFilter === "all" || t.surface === surfaceFilter)
    : [];

  return (
    <main className="min-h-screen bg-[#f8f5ef] text-stone-900 px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                La Cartilla de Gretel · Owner Archetype Gallery
              </p>
              <h1 className="text-2xl font-extrabold text-stone-900">
                Lesson &amp; Flip Chart Archetypes (Option B)
              </h1>
              <p className="mt-1 text-sm text-stone-600">
                Approved model: <strong>Lesson 3</strong> (Workbook pp. 7–9, Flip Chart sheet 5).
                Single wooden pencil tip, 400ms charcoal hold, eraser removes red marks only, curl B &amp; flip B.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/revision"
                className="rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-800 hover:bg-stone-50"
              >
                Back to Review Hub
              </Link>
              <Link
                to="/cartilla/leccion/$n"
                params={{ n: "3" }}
                className="rounded-xl bg-teal-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-teal-900"
              >
                Open Model: Lesson 3 Workbook
              </Link>
              <a
                href="/cartilla/teacher/flipchart?lesson=3"
                className="rounded-xl border border-teal-700 bg-teal-50 px-3.5 py-2 text-xs font-bold text-teal-900 hover:bg-teal-100"
              >
                Open Model: Sheet 5 Flip Chart
              </a>
            </div>
          </div>

          {data && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-stone-700">
                <span className="rounded-full bg-stone-100 px-3 py-1">
                  {data.totals.totalLessons} lessons
                </span>
                <span className="rounded-full bg-stone-100 px-3 py-1">
                  {data.totals.workbookAvailable} workbook pages (+{data.totals.workbookSourceBlocked} source-blocked)
                </span>
                <span className="rounded-full bg-stone-100 px-3 py-1">
                  {data.totals.flipchartSheets} flip chart sheets
                </span>
              </div>

              <div className="flex gap-1.5" role="tablist" aria-label="Filter by surface">
                {(["all", "workbook", "flipchart"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={surfaceFilter === tab}
                    onClick={() => setSurfaceFilter(tab)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${
                      surfaceFilter === tab
                        ? "bg-stone-900 text-white"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    {tab === "all" ? "All" : tab === "workbook" ? "Workbook" : "Flip Chart"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Could not load archetypes inventory: {error}
          </div>
        )}

        {!data && !error && (
          <div className="rounded-xl border border-stone-200 bg-white p-6 text-sm text-stone-600">
            Loading archetypes inventory…
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          {entries.map((type) => (
            <article
              key={type.id}
              className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                        type.surface === "workbook"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-teal-100 text-teal-900"
                      }`}
                    >
                      {type.surface === "workbook" ? "Workbook" : "Flip Chart"}
                    </span>
                    <h2 className="mt-1.5 text-lg font-extrabold text-stone-900">{type.label}</h2>
                    <p className="text-xs text-stone-500">{type.spanishLabel}</p>
                  </div>
                  <span className="rounded-xl bg-stone-100 px-3 py-1 text-sm font-extrabold text-stone-800">
                    {type.count}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`rounded-md px-2 py-0.5 font-semibold ${
                      type.usesSharedContractKernel
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-stone-100 text-stone-700"
                    }`}
                  >
                    {type.usesSharedContractKernel
                      ? "Uses shared contract mark kernel"
                      : "Freehand / static / presenter"}
                  </span>
                  <span className="text-stone-500">{type.kernelComponent}</span>
                </div>

                {type.modelPages.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Model Pages by Sequence
                    </h3>
                    <div className="space-y-1.5">
                      {type.modelPages.map((m) => (
                        <div
                          key={`${type.id}-${m.sequence}-${m.page}`}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-100 bg-stone-50 px-3 py-2 text-xs"
                        >
                          <div>
                            <span className="font-bold text-stone-800">
                              {SEQUENCE_LABELS[m.sequence] ?? m.sequence}
                            </span>
                            <span className="mx-1.5 text-stone-400">·</span>
                            <span className="text-stone-700">
                              L{m.lesson} p.{m.page}
                            </span>
                            {m.approvedModel && (
                              <span className="ml-2 rounded bg-teal-700 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                Approved Model
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {m.lesson > 0 && (
                              <a
                                href={`/cartilla/leccion/${m.lesson}`}
                                className="font-bold text-teal-800 hover:underline"
                              >
                                Workbook
                              </a>
                            )}
                            <a
                              href={
                                m.lesson > 0
                                  ? `/cartilla/teacher/flipchart?lesson=${m.lesson}`
                                  : "/cartilla/teacher/flipchart"
                              }
                              className="font-bold text-amber-800 hover:underline"
                            >
                              Flip Chart
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <details className="mt-4 border-t border-stone-100 pt-3 text-xs">
                <summary className="cursor-pointer font-bold text-stone-700 hover:text-stone-900">
                  All {type.count} pages / sheets
                </summary>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {type.pages.map((p) => (
                    <a
                      key={`${type.id}-${p.lesson}-${p.pageNumber}`}
                      href={p.route}
                      className={`rounded-md border px-2 py-1 font-medium ${
                        p.sourceStatus === "SOURCE_BLOCKED"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-stone-200 bg-white text-stone-700 hover:border-teal-500"
                      }`}
                      title={`${p.lessonLabel} — p.${p.pageNumber}`}
                    >
                      L{p.lesson} p.{p.pageNumber}
                      {p.sourceStatus === "SOURCE_BLOCKED" ? " (BLOCKED)" : ""}
                    </a>
                  ))}
                </div>
              </details>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
