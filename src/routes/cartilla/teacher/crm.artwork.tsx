import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Images, RefreshCw } from "lucide-react";
import importData from "@/data/canonical-artwork-import.json";
import { Sidebar } from "@/features/teacher-crm/components/Sidebar";
import { Topbar } from "@/features/teacher-crm/components/Topbar";
import "@/styles/teacher-crm.css";

type ImportAsset = {
  src?: string;
  productionSrc?: string;
  canonicalSrc?: string;
  slug?: string;
  status?: string;
  method?: string;
  packageAsset?: string;
  candidates?: string[];
};

type ImportData = {
  version: string;
  status: string;
  generatedAt: string | null;
  packageSource: string | null;
  canonicalDirection: string;
  assets: ImportAsset[];
  summary: {
    imported: number;
    matched: number;
    ambiguous: number;
    unresolved: number;
  };
};

export const Route = createFileRoute("/cartilla/teacher/crm/artwork")({
  component: ArtworkReviewPage,
});

function ArtworkReviewPage() {
  const data = importData as ImportData;
  const matched = data.assets.filter((asset) => asset.status === "matched");
  const unresolved = data.assets.filter((asset) => asset.status !== "matched");

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
                    La Cartilla de Gretel · Arte canónico
                  </p>
                  <h1 className="mt-1 text-3xl font-black text-[#332616]">
                    Artwork remaster
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm font-semibold text-stone-600">
                    ORIGINAL EN SU ADN · MODERNA EN SU ACABADO · DIGITAL EN SU EJECUCIÓN · FIEL A LA CARTILLA
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f4efe3] px-4 py-3 text-right">
                  <p className="text-xs font-black uppercase tracking-wide text-stone-500">Estado</p>
                  <p className="mt-1 text-sm font-black text-stone-800">{data.status}</p>
                </div>
              </div>
            </header>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Importados", data.summary.imported],
                ["Conectados", data.summary.matched],
                ["Ambiguos", data.summary.ambiguous],
                ["Sin resolver", data.summary.unresolved],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-2xl border border-[#eadfc8] bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-stone-500">{label}</p>
                  <p className="mt-2 text-3xl font-black text-[#332616]">{value}</p>
                </div>
              ))}
            </section>

            {matched.length === 0 ? (
              <section className="rounded-[2rem] border border-dashed border-[#d8c8aa] bg-white p-10 text-center shadow-sm">
                <RefreshCw className="mx-auto h-9 w-9 text-[#a45d22]" />
                <h2 className="mt-3 text-xl font-black text-stone-800">Paquete listo para importar</h2>
                <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold text-stone-500">
                  El importador canónico todavía no se ha ejecutado en la copia local del proyecto. Después de ejecutarlo, esta pantalla mostrará cada reemplazo conectado.
                </p>
              </section>
            ) : (
              <section className="rounded-[2rem] border border-[#eadfc8] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <Images className="h-5 w-5 text-[#356b43]" />
                  <div>
                    <h2 className="text-xl font-black text-stone-800">Arte conectado</h2>
                    <p className="text-xs font-semibold text-stone-500">
                      La ruta de producción permanece estable; el contenido visual fue sustituido por el remaster canónico.
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {matched.map((asset) => (
                    <article key={asset.src} className="overflow-hidden rounded-2xl border border-[#eadfc8] bg-[#fffdf8]">
                      <div className="aspect-square bg-white p-4">
                        {asset.productionSrc ? (
                          <img
                            src={asset.productionSrc}
                            alt={asset.slug ?? "Ilustración canónica"}
                            className="h-full w-full object-contain"
                          />
                        ) : null}
                      </div>
                      <div className="border-t border-[#eadfc8] p-4">
                        <div className="flex items-center gap-2 text-[#356b43]">
                          <CheckCircle2 className="h-4 w-4" />
                          <p className="text-xs font-black uppercase tracking-wide">Conectado</p>
                        </div>
                        <p className="mt-2 text-base font-black text-stone-800">{asset.slug}</p>
                        <p className="mt-1 break-all text-[11px] font-semibold text-stone-500">{asset.productionSrc}</p>
                        <p className="mt-2 text-xs font-bold text-stone-600">{asset.method}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {unresolved.length > 0 && (
              <section className="rounded-[2rem] border border-[#efd8b5] bg-[#fffaf1] p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-[#b45309]" />
                  <div>
                    <h2 className="text-xl font-black text-stone-800">Revisión pendiente</h2>
                    <p className="text-xs font-semibold text-stone-500">
                      Estos elementos no fueron sustituidos automáticamente para evitar una coincidencia incorrecta.
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {unresolved.map((asset, index) => (
                    <div key={`${asset.src}-${index}`} className="rounded-xl border border-[#efd8b5] bg-white px-4 py-3">
                      <p className="text-sm font-black text-stone-800">{asset.slug || asset.src}</p>
                      <p className="mt-1 text-xs font-semibold text-stone-500">{asset.status}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
