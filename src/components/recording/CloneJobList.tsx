import { useEffect, useState } from "react";
import { Play, RefreshCcw, Trash2 } from "lucide-react";
import { list, markStatus, onCloneJobsChange, remove, type AudioCloneJob } from "@/lib/audio-clone-jobs";

function StatusPill({ status }: { status: AudioCloneJob["status"] }) {
  const tone =
    status === "ready"
      ? "bg-emerald-100 text-emerald-800"
      : status === "failed"
        ? "bg-rose-100 text-rose-800"
        : "bg-amber-100 text-amber-900";
  return <span className={`rounded-full px-2 py-1 text-xs font-black ${tone}`}>{status}</span>;
}

export function CloneJobList() {
  const [jobs, setJobs] = useState<AudioCloneJob[]>([]);

  useEffect(() => {
    const refresh = () => void list().then(setJobs);
    refresh();
    return onCloneJobsChange(refresh);
  }, []);

  const audition = (url?: string) => {
    if (!url) return;
    new Audio(url).play().catch(() => undefined);
  };

  if (jobs.length === 0) {
    return <p className="rounded-2xl border border-dashed border-amber-900/20 bg-white/70 p-4 text-sm font-bold text-[#3A281E]/65">No hay trabajos en cola todavia.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-amber-900/15 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-amber-50 text-xs uppercase tracking-wide text-amber-900/70">
          <tr>
            <th className="px-3 py-2">Leccion</th>
            <th className="px-3 py-2">Linea</th>
            <th className="px-3 py-2">Estado</th>
            <th className="px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="border-t border-amber-900/10">
              <td className="px-3 py-2 font-bold">{job.lessonId}</td>
              <td className="px-3 py-2">{job.lineId}</td>
              <td className="px-3 py-2"><StatusPill status={job.status} /></td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-2">
                  {job.status === "failed" ? (
                    <button type="button" onClick={() => void markStatus(job.id, "queued")} className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 font-bold">
                      <RefreshCcw className="h-3.5 w-3.5" /> Retry
                    </button>
                  ) : null}
                  {job.status === "ready" ? (
                    <button type="button" onClick={() => audition(job.clonedUrl)} className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 font-bold">
                      <Play className="h-3.5 w-3.5" /> Audition
                    </button>
                  ) : null}
                  <button type="button" onClick={() => void remove(job.id)} className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 font-bold text-rose-700">
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
