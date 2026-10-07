import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Download, FileUp, ImagePlus, PackageOpen, RotateCcw, WandSparkles } from "lucide-react";
import { Sidebar } from "@/features/teacher-crm/components/Sidebar";
import { Topbar } from "@/features/teacher-crm/components/Topbar";
import {
  ART_FACTORY_CATEGORIES,
  ART_FACTORY_STATUSES,
  ART_FACTORY_STORAGE_KEY,
  attachGeneratedResult,
  buildGenerationPackage,
  createAsset,
  createEmptyArtFactoryProject,
  matchGeneratedFilename,
  parseProject,
  serializeProject,
  setAssetStatus,
  setPageMapping,
  type ArtFactoryCategory,
  type ArtFactoryProject,
  type ArtFactoryStatus,
  type NormalizedCrop,
  type StyleReference,
} from "@/lib/cartilla-art-factory";
import "@/styles/teacher-crm.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type PdfDocument = {
  numPages: number;
  getPage(pageNumber: number): Promise<{
    getViewport(options: { scale: number }): { width: number; height: number };
    render(options: { canvasContext: CanvasRenderingContext2D; viewport: unknown }): { promise: Promise<void> };
  }>;
};

type Drag = { startX: number; startY: number; endX: number; endY: number };

const QUALITY_REASONS = [
  "wrong subject",
  "lost original identity",
  "wrong pose",
  "incorrect colors",
  "style drift",
  "malformed anatomy",
  "extra objects",
  "crop",
  "material mismatch",
  "other",
] as const;

export const Route = createLazyFileRoute("/cartilla/teacher/crm/artwork")({
  component: CartillaArtFactoryPage,
});

function readDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function loadPdf(file: File): Promise<PdfDocument> {
  const data = new Uint8Array(await file.arrayBuffer());
  const task = pdfjsLib.getDocument({ data, useSystemFonts: true });
  return (await task.promise) as unknown as PdfDocument;
}

async function renderPdfPage(pdf: PdfDocument | null, pageNumber: number, canvas: HTMLCanvasElement | null) {
  if (!pdf || !canvas || pageNumber < 1 || pageNumber > pdf.numPages) return;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1.15 });
  const context = canvas.getContext("2d");
  if (!context) return;
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  await page.render({ canvasContext: context, viewport }).promise;
}

async function renderPdfThumbnails(pdf: PdfDocument) {
  const thumbs: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 0.14 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(viewport.width));
    canvas.height = Math.max(1, Math.round(viewport.height));
    const context = canvas.getContext("2d");
    if (!context) {
      thumbs.push("");
      continue;
    }
    await page.render({ canvasContext: context, viewport }).promise;
    thumbs.push(canvas.toDataURL("image/jpeg", 0.72));
  }
  return thumbs;
}

function cropFromCanvas(canvas: HTMLCanvasElement, drag: Drag, page: number): NormalizedCrop | null {
  const left = Math.max(0, Math.min(drag.startX, drag.endX));
  const top = Math.max(0, Math.min(drag.startY, drag.endY));
  const right = Math.min(canvas.width, Math.max(drag.startX, drag.endX));
  const bottom = Math.min(canvas.height, Math.max(drag.startY, drag.endY));
  const width = Math.round(right - left);
  const height = Math.round(bottom - top);
  if (width < 12 || height < 12) return null;
  const output = document.createElement("canvas");
  output.width = width;
  output.height = height;
  const context = output.getContext("2d");
  if (!context) return null;
  context.drawImage(canvas, left, top, width, height, 0, 0, width, height);
  return {
    page,
    x: left / canvas.width,
    y: top / canvas.height,
    width: width / canvas.width,
    height: height / canvas.height,
    dataUrl: output.toDataURL("image/png"),
  };
}

function pointerPosition(event: React.PointerEvent<HTMLCanvasElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * event.currentTarget.width,
    y: ((event.clientY - rect.top) / rect.height) * event.currentTarget.height,
  };
}

function loadInitialProject() {
  if (typeof window === "undefined") return createEmptyArtFactoryProject();
  const saved = window.localStorage.getItem(ART_FACTORY_STORAGE_KEY);
  if (!saved) return createEmptyArtFactoryProject();
  try {
    return parseProject(saved);
  } catch {
    return createEmptyArtFactoryProject();
  }
}

function CartillaArtFactoryPage() {
  const [project, setProject] = useState<ArtFactoryProject>(loadInitialProject);
  const [workbookPdf, setWorkbookPdf] = useState<PdfDocument | null>(null);
  const [flipchartPdf, setFlipchartPdf] = useState<PdfDocument | null>(null);
  const [workbookThumbs, setWorkbookThumbs] = useState<string[]>([]);
  const [flipchartThumbs, setFlipchartThumbs] = useState<string[]>([]);
  const [studentPage, setStudentPage] = useState(1);
  const [flipchartPage, setFlipchartPage] = useState(1);
  const [mappingText, setMappingText] = useState("");
  const [sourceCrop, setSourceCrop] = useState<NormalizedCrop | null>(null);
  const [referenceCrop, setReferenceCrop] = useState<NormalizedCrop | null>(null);
  const [sourceDrag, setSourceDrag] = useState<Drag | null>(null);
  const [referenceDrag, setReferenceDrag] = useState<Drag | null>(null);
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<ArtFactoryCategory>("object");
  const [statusFilter, setStatusFilter] = useState<ArtFactoryStatus | "ALL">("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<ArtFactoryStatus>("READY FOR INTEGRATION");
  const workbookCanvas = useRef<HTMLCanvasElement>(null);
  const flipchartCanvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    window.localStorage.setItem(ART_FACTORY_STORAGE_KEY, serializeProject(project));
  }, [project]);

  useEffect(() => {
    void renderPdfPage(workbookPdf, studentPage, workbookCanvas.current);
    setSourceCrop(null);
    setSourceDrag(null);
  }, [workbookPdf, studentPage]);

  useEffect(() => {
    void renderPdfPage(flipchartPdf, flipchartPage, flipchartCanvas.current);
    setReferenceCrop(null);
    setReferenceDrag(null);
  }, [flipchartPdf, flipchartPage]);

  useEffect(() => {
    setMappingText((project.mappings[String(studentPage)] ?? []).join(", "));
  }, [project.mappings, studentPage]);

  const filteredAssets = useMemo(
    () => project.assets.filter((asset) => statusFilter === "ALL" || asset.status === statusFilter),
    [project.assets, statusFilter],
  );

  const updateProject = (updater: (current: ArtFactoryProject) => ArtFactoryProject) => {
    setProject((current) => updater(current));
  };

  const handlePdf = async (kind: "workbook" | "flipchart", file?: File) => {
    if (!file) return;
    const pdf = await loadPdf(file);
    if (kind === "workbook") {
      setWorkbookPdf(pdf);
      setStudentPage(1);
      setWorkbookThumbs([]);
      void renderPdfThumbnails(pdf).then(setWorkbookThumbs);
    } else {
      setFlipchartPdf(pdf);
      setFlipchartPage(1);
      setFlipchartThumbs([]);
      void renderPdfThumbnails(pdf).then(setFlipchartThumbs);
    }
    updateProject((current) => ({
      ...current,
      [kind]: { name: file.name, pageCount: pdf.numPages },
      updatedAt: new Date().toISOString(),
    }));
  };

  const saveMapping = () => {
    const pages = mappingText
      .split(/[\s,;]+/)
      .map((value) => Number(value))
      .filter(Number.isFinite);
    updateProject((current) => setPageMapping(current, studentPage, pages));
  };

  const beginDrag = (
    event: React.PointerEvent<HTMLCanvasElement>,
    setter: React.Dispatch<React.SetStateAction<Drag | null>>,
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointerPosition(event);
    setter({ startX: point.x, startY: point.y, endX: point.x, endY: point.y });
  };

  const moveDrag = (
    event: React.PointerEvent<HTMLCanvasElement>,
    drag: Drag | null,
    setter: React.Dispatch<React.SetStateAction<Drag | null>>,
  ) => {
    if (!drag || event.buttons === 0) return;
    const point = pointerPosition(event);
    setter({ ...drag, endX: point.x, endY: point.y });
  };

  const finishDrag = (
    event: React.PointerEvent<HTMLCanvasElement>,
    drag: Drag | null,
    page: number,
    cropSetter: React.Dispatch<React.SetStateAction<NormalizedCrop | null>>,
  ) => {
    if (!drag) return;
    const point = pointerPosition(event);
    const finished = { ...drag, endX: point.x, endY: point.y };
    const crop = cropFromCanvas(event.currentTarget, finished, page);
    cropSetter(crop);
  };

  const createJob = () => {
    if (!sourceCrop || !subject.trim()) return;
    updateProject((current) => ({
      ...current,
      assets: [
        ...current.assets,
        createAsset(current, {
          studentPage,
          sourceCrop,
          referenceCrops: referenceCrop ? [referenceCrop] : [],
          category,
          subject,
          preservationNotes: notes,
        }),
      ],
      updatedAt: new Date().toISOString(),
    }));
    setSubject("");
    setNotes("");
    setSourceCrop(null);
    setReferenceCrop(null);
  };

  const importGenerated = async (files: FileList | null) => {
    if (!files) return;
    let next = project;
    for (const file of Array.from(files)) {
      const match = matchGeneratedFilename(file.name, next.assets);
      if (!match) continue;
      const dataUrl = await readDataUrl(file);
      next = {
        ...next,
        assets: next.assets.map((asset) =>
          asset.id === match.id
            ? attachGeneratedResult(asset, {
                name: file.name,
                dataUrl,
                importedAt: new Date().toISOString(),
              })
            : asset,
        ),
        updatedAt: new Date().toISOString(),
      };
    }
    setProject(next);
  };

  const importManifest = async (file?: File) => {
    if (!file) return;
    setProject(parseProject(await file.text()));
    setSelectedIds([]);
  };

  const addStyleReferences = async (files: FileList | null) => {
    if (!files) return;
    const additions: StyleReference[] = [];
    for (const file of Array.from(files)) {
      additions.push({
        id: "style-" + crypto.randomUUID(),
        name: file.name,
        dataUrl: await readDataUrl(file),
      });
    }
    updateProject((current) => ({
      ...current,
      styleReferences: [...current.styleReferences, ...additions],
      updatedAt: new Date().toISOString(),
    }));
  };

  const exportManifest = () =>
    downloadBlob(
      new Blob([JSON.stringify(project, null, 2)], { type: "application/json" }),
      "cartilla-art-factory-manifest.json",
    );

  const exportPackage = () =>
    downloadBlob(
      buildGenerationPackage(project, selectedIds.length ? selectedIds : undefined),
      "cartilla-art-factory-generation-package.zip",
    );

  const applyBulkStatus = () => {
    if (selectedIds.length === 0) return;
    updateProject((current) => ({
      ...current,
      assets: current.assets.map((asset) =>
        selectedIds.includes(asset.id) ? setAssetStatus(asset, bulkStatus) : asset,
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const resetProject = () => {
    if (!window.confirm("¿Reiniciar el proyecto local de Art Factory? Los PDF originales no se modifican.")) return;
    setProject(createEmptyArtFactoryProject());
    setWorkbookPdf(null);
    setFlipchartPdf(null);
    setSelectedIds([]);
    setSourceCrop(null);
    setReferenceCrop(null);
  };

  return (
    <div className="crm-app bg-[#f7f2e8]">
      <Sidebar />
      <main className="crm-main flex min-h-screen flex-1 flex-col overflow-hidden">
        <Topbar />
        <div className="crm-content flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <header className="rounded-[2rem] border border-[#eadfc8] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a45d22]">
                    La Cartilla de Gretel · Producción
                  </p>
                  <h1 className="mt-1 text-3xl font-black text-[#332616]">Cartilla Art Factory</h1>
                  <p className="mt-2 max-w-3xl text-sm font-semibold text-stone-600">
                    PDF → mapping → crop → job → generation package → result import → integration-ready.
                    No paid API and no owner-approval gate.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer rounded-xl border border-[#d9c9ac] bg-white px-4 py-2 text-sm font-black text-stone-700">
                    <FileUp className="mr-2 inline h-4 w-4" /> Import manifest
                    <input type="file" accept="application/json" className="hidden" onChange={(event) => void importManifest(event.target.files?.[0])} />
                  </label>
                  <button type="button" onClick={exportManifest} className="rounded-xl bg-[#356b43] px-4 py-2 text-sm font-black text-white">
                    <Download className="mr-2 inline h-4 w-4" /> Manifest
                  </button>
                  <button type="button" onClick={resetProject} className="rounded-xl border border-stone-300 px-3 py-2 text-sm font-black text-stone-600">
                    <RotateCcw className="mr-2 inline h-4 w-4" /> Reset
                  </button>
                </div>
              </div>
            </header>

            <section className="grid gap-4 lg:grid-cols-2">
              <PdfPane
                title="Libro del alumno"
                subtitle={project.workbook.name ? project.workbook.name + " · " + project.workbook.pageCount + " páginas" : "Carga el PDF de 98 páginas"}
                page={studentPage}
                pageCount={project.workbook.pageCount}
                canvasRef={workbookCanvas}
                drag={sourceDrag}
                crop={sourceCrop}
                thumbnails={workbookThumbs}
                onFile={(file) => void handlePdf("workbook", file)}
                onPage={setStudentPage}
                onPointerDown={(event) => beginDrag(event, setSourceDrag)}
                onPointerMove={(event) => moveDrag(event, sourceDrag, setSourceDrag)}
                onPointerUp={(event) => finishDrag(event, sourceDrag, studentPage, setSourceCrop)}
              />
              <PdfPane
                title="Rotafolio / Flip Chart"
                subtitle={project.flipchart.name ? project.flipchart.name + " · " + project.flipchart.pageCount + " páginas" : "Carga el PDF de 62 páginas"}
                page={flipchartPage}
                pageCount={project.flipchart.pageCount}
                canvasRef={flipchartCanvas}
                drag={referenceDrag}
                crop={referenceCrop}
                thumbnails={flipchartThumbs}
                onFile={(file) => void handlePdf("flipchart", file)}
                onPage={setFlipchartPage}
                onPointerDown={(event) => beginDrag(event, setReferenceDrag)}
                onPointerMove={(event) => moveDrag(event, referenceDrag, setReferenceDrag)}
                onPointerUp={(event) => finishDrag(event, referenceDrag, flipchartPage, setReferenceCrop)}
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              <div className="rounded-[2rem] border border-[#eadfc8] bg-white p-5 shadow-sm">
                <h2 className="text-xl font-black text-stone-800">Mapping explícito</h2>
                <p className="mt-1 text-sm font-semibold text-stone-500">
                  Libro página {studentPage} → cero, una o varias páginas del Flip Chart. Nunca se asume 1:1.
                </p>
                <div className="mt-4 flex gap-2">
                  <input
                    value={mappingText}
                    onChange={(event) => setMappingText(event.target.value)}
                    placeholder="Ej. 3, 4, 8"
                    className="min-w-0 flex-1 rounded-xl border border-stone-300 px-3 py-2 text-sm font-bold"
                  />
                  <button type="button" onClick={saveMapping} className="rounded-xl bg-[#356b43] px-4 py-2 text-sm font-black text-white">
                    Guardar
                  </button>
                </div>
                <div className="mt-4">
                  <label className="text-xs font-black uppercase tracking-wide text-stone-500">Referencias de estilo globales</label>
                  <label className="mt-2 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#d8c8aa] p-4 text-sm font-black text-[#a45d22]">
                    <ImagePlus className="mr-2 h-4 w-4" /> Añadir imágenes Gretel 2.0
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => void addStyleReferences(event.target.files)} />
                  </label>
                  <p className="mt-2 text-xs font-semibold text-stone-500">{project.styleReferences.length} referencia(s) registrada(s).</p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-[#eadfc8] bg-white p-5 shadow-sm">
                <h2 className="text-xl font-black text-stone-800">Crear generation job</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Sujeto / nombre" className="rounded-xl border border-stone-300 px-3 py-2 text-sm font-bold" />
                  <select value={category} onChange={(event) => setCategory(event.target.value as ArtFactoryCategory)} className="rounded-xl border border-stone-300 px-3 py-2 text-sm font-bold">
                    {ART_FACTORY_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                  <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Detalles que deben preservarse" className="min-h-24 rounded-xl border border-stone-300 px-3 py-2 text-sm font-semibold sm:col-span-2" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold text-stone-600">
                  <span>Source crop: {sourceCrop ? "LISTO" : "selecciona arrastrando en Libro"}</span>
                  <span>Reference crop: {referenceCrop ? "LISTO" : "opcional"}</span>
                </div>
                <button
                  type="button"
                  disabled={!sourceCrop || !subject.trim()}
                  onClick={createJob}
                  className="mt-4 rounded-xl bg-[#a45d22] px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <WandSparkles className="mr-2 inline h-4 w-4" /> Crear job
                </button>
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#eadfc8] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-stone-800">Batch de producción</h2>
                  <p className="text-sm font-semibold text-stone-500">{project.assets.length} asset(s) · {selectedIds.length} seleccionado(s)</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ArtFactoryStatus | "ALL")} className="rounded-xl border border-stone-300 px-3 py-2 text-sm font-bold">
                    <option value="ALL">Todos</option>
                    {ART_FACTORY_STATUSES.map((status) => <option key={status}>{status}</option>)}
                  </select>
                  <select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value as ArtFactoryStatus)} className="rounded-xl border border-stone-300 px-3 py-2 text-sm font-bold">
                    {ART_FACTORY_STATUSES.map((status) => <option key={status}>{status}</option>)}
                  </select>
                  <button type="button" onClick={() => setSelectedIds(filteredAssets.map((asset) => asset.id))} className="rounded-xl border border-stone-300 px-3 py-2 text-sm font-black text-stone-600">Seleccionar visibles</button>
                  <button type="button" onClick={applyBulkStatus} className="rounded-xl border border-[#356b43] px-3 py-2 text-sm font-black text-[#356b43]">Aplicar estado</button>
                  <button type="button" onClick={exportPackage} className="rounded-xl bg-[#356b43] px-4 py-2 text-sm font-black text-white">
                    <PackageOpen className="mr-2 inline h-4 w-4" /> Export ZIP
                  </button>
                  <label className="cursor-pointer rounded-xl bg-[#a45d22] px-4 py-2 text-sm font-black text-white">
                    Import results
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => void importGenerated(event.target.files)} />
                  </label>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {filteredAssets.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm font-bold text-stone-500">
                    No hay jobs todavía. Carga los PDF, guarda el mapping, selecciona un crop y crea el primer job.
                  </div>
                ) : filteredAssets.map((asset) => (
                  <article key={asset.id} className="rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4">
                    <div className="flex flex-wrap items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(asset.id)}
                        onChange={(event) =>
                          setSelectedIds((current) =>
                            event.target.checked ? [...current, asset.id] : current.filter((id) => id !== asset.id),
                          )
                        }
                        className="mt-2 h-4 w-4"
                      />
                      <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[120px_120px_120px_1fr]">
                        <Preview title="ORIGINAL" src={asset.sourceCrop.dataUrl} />
                        <Preview title="ROTafolio" src={asset.referenceCrops[0]?.dataUrl} />
                        <Preview title="RESULT" src={asset.generatedResult?.dataUrl} />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <strong className="text-sm text-stone-800">{asset.id}</strong>
                            <span className="rounded-full bg-[#efe8d8] px-2 py-1 text-[10px] font-black text-stone-600">{asset.status}</span>
                          </div>
                          <p className="mt-1 text-sm font-black text-stone-700">{asset.subject} · Libro {asset.studentPage}</p>
                          <p className="mt-1 text-xs font-semibold text-stone-500">Flip Chart: {asset.referencePages.join(", ") || "sin mapping"}</p>
                          <p className="mt-1 break-all text-[11px] font-semibold text-stone-500">{asset.expectedFilename}</p>
                          <select
                            value={asset.qualityNotes ?? ""}
                            onChange={(event) =>
                              updateProject((current) => ({
                                ...current,
                                assets: current.assets.map((item) =>
                                  item.id === asset.id
                                    ? { ...item, qualityNotes: event.target.value, updatedAt: new Date().toISOString() }
                                    : item,
                                ),
                              }))
                            }
                            className="mt-3 w-full rounded-lg border border-stone-300 px-2 py-1.5 text-xs font-bold text-stone-600"
                          >
                            <option value="">Quality check: no issue selected</option>
                            {QUALITY_REASONS.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
                          </select>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button type="button" onClick={() => updateProject((current) => ({ ...current, assets: current.assets.map((item) => item.id === asset.id ? setAssetStatus(item, "READY FOR INTEGRATION") : item) }))} className="rounded-lg bg-[#356b43] px-3 py-1.5 text-xs font-black text-white">
                              Ready for integration
                            </button>
                            <button type="button" onClick={() => updateProject((current) => ({ ...current, assets: current.assets.map((item) => item.id === asset.id ? setAssetStatus(item, "NEEDS FIX") : item) }))} className="rounded-lg border border-amber-400 px-3 py-1.5 text-xs font-black text-amber-700">
                              Needs fix
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function PdfPane(props: {
  title: string;
  subtitle: string;
  page: number;
  pageCount: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  drag: Drag | null;
  crop: NormalizedCrop | null;
  thumbnails: string[];
  onFile(file?: File): void;
  onPage(page: number): void;
  onPointerDown(event: React.PointerEvent<HTMLCanvasElement>): void;
  onPointerMove(event: React.PointerEvent<HTMLCanvasElement>): void;
  onPointerUp(event: React.PointerEvent<HTMLCanvasElement>): void;
}) {
  return (
    <section className="rounded-[2rem] border border-[#eadfc8] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-800">{props.title}</h2>
          <p className="text-xs font-semibold text-stone-500">{props.subtitle}</p>
        </div>
        <label className="cursor-pointer rounded-xl border border-[#d9c9ac] px-3 py-2 text-xs font-black text-[#a45d22]">
          Cargar PDF
          <input type="file" accept="application/pdf" className="hidden" onChange={(event) => props.onFile(event.target.files?.[0])} />
        </label>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button type="button" disabled={props.page <= 1} onClick={() => props.onPage(Math.max(1, props.page - 1))} className="rounded-lg border px-3 py-1 text-xs font-black disabled:opacity-40">←</button>
        <input
          type="number"
          min={1}
          max={props.pageCount || 999}
          value={props.page}
          onChange={(event) => props.onPage(Math.max(1, Number(event.target.value) || 1))}
          className="w-20 rounded-lg border px-2 py-1 text-center text-sm font-black"
        />
        <span className="text-xs font-bold text-stone-500">/ {props.pageCount || "—"}</span>
        <button type="button" disabled={Boolean(props.pageCount && props.page >= props.pageCount)} onClick={() => props.onPage(Math.min(props.pageCount || props.page + 1, props.page + 1))} className="rounded-lg border px-3 py-1 text-xs font-black disabled:opacity-40">→</button>
        {props.crop ? <span className="ml-auto text-xs font-black text-[#356b43]">Crop listo</span> : <span className="ml-auto text-xs font-bold text-stone-500">Arrastra para recortar</span>}
      </div>
      <div className="mt-3 overflow-auto rounded-2xl border border-[#eadfc8] bg-stone-100 p-2">
        <canvas
          ref={props.canvasRef}
          className="mx-auto block max-h-[62vh] max-w-full cursor-crosshair bg-white shadow"
          onPointerDown={props.onPointerDown}
          onPointerMove={props.onPointerMove}
          onPointerUp={props.onPointerUp}
        />
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {props.thumbnails.length === 0 && props.pageCount > 0 ? (
          <span className="px-2 py-3 text-xs font-bold text-stone-400">Generando miniaturas…</span>
        ) : props.thumbnails.map((src, index) => (
          <button
            type="button"
            key={index}
            onClick={() => props.onPage(index + 1)}
            className={"shrink-0 rounded-lg border-2 p-1 " + (props.page === index + 1 ? "border-[#a45d22]" : "border-transparent")}
            aria-label={"Página " + (index + 1)}
          >
            {src ? <img src={src} alt="" className="h-20 w-auto rounded bg-white object-contain" /> : null}
            <span className="block text-[10px] font-black text-stone-500">{index + 1}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Preview({ title, src }: { title: string; src?: string }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-stone-500">{title}</p>
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-white">
        {src ? <img src={src} alt="" className="h-full w-full object-contain" /> : <span className="px-2 text-center text-[10px] font-bold text-stone-400">pendiente</span>}
      </div>
    </div>
  );
}
