import { useEffect, useMemo, useRef, useState } from "react";
import {
  download,
  historyToCsv,
  historyToJson,
  importHistory,
  latestDecisions,
  loadHistory,
  recordDecision,
  type DecisionRecord,
  type OwnerDecision,
} from "@/lib/owner-review-store";
import {
  AREA_STATUS,
  COMPARISONS,
  DOWNLOADS,
  QUICK_LINKS,
  REVIEW_REVISION,
  type Comparison,
  type OwnerStatus,
} from "./review-data";
import "@/styles/owner-review.css";

const DECISION_LABEL: Record<OwnerDecision, string> = {
  "approve-a": "Approve A",
  "approve-b": "Approve B",
  "reject-both": "Reject both",
  "request-changes": "Request changes",
  "keep-current": "Keep current",
  "upload-replacement": "Upload owner replacement",
  "accept-original": "Accept original",
  "accept-alternate": "Accept alternate",
  "needs-rerecording": "Needs authentic re-recording",
  reject: "Reject",
};

function useHistory() {
  const [history, setHistory] = useState<DecisionRecord[]>([]);
  useEffect(() => setHistory(loadHistory()), []);
  return [history, setHistory] as const;
}

function DecisionBar({
  itemId,
  options,
  history,
  onChange,
}: {
  itemId: string;
  options: OwnerDecision[];
  history: DecisionRecord[];
  onChange: (h: DecisionRecord[]) => void;
}) {
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const latest = latestDecisions(history).get(itemId);
  const commentId = `${itemId}-comment`;
  const save = async (decision: OwnerDecision) => {
    if (decision === "request-changes" && !comment.trim()) return;
    if (saving) return;
    setError("");
    setSaving(true);
    try {
      let replacement: DecisionRecord["replacement"];
      if (decision === "upload-replacement") {
        if (!file || !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) {
          setError("Choose a PNG, JPEG, WebP or GIF image first.");
          return;
        }
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("File read failed"));
          reader.onerror = () => reject(new Error("File read failed"));
          reader.readAsDataURL(file);
        });
        replacement = { name: file.name, dataUrl };
      }
      onChange(recordDecision({ itemId, decision, comment: comment.trim(), revision: REVIEW_REVISION, replacement }));
      setComment("");
      setFile(null);
      if (imageRef.current) imageRef.current.value = "";
    } catch {
      setError("Could not save. Browser storage may be full or unavailable; no decision was recorded.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="orh-decision" data-item={itemId}>
      <p className="orh-decision__state" aria-live="polite">
        {latest ? (
          <>
            Your decision: <b>{DECISION_LABEL[latest.decision]}</b>
            {latest.comment ? ` — “${latest.comment}”` : ""}{" "}
            <span className="orh-muted">({new Date(latest.at).toLocaleString()})</span>
          </>
        ) : (
          <>No decision yet. Opening or trying a version does not count as approval.</>
        )}
      </p>
      <label htmlFor={commentId} className="orh-label">
        Comments (required for “Request changes”)
      </label>
      <textarea
        id={commentId}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        className="orh-textarea"
      />
      {options.includes("upload-replacement") && (
        <>
          <label htmlFor={`${itemId}-file`} className="orh-label">Replacement image (PNG, JPEG, WebP or GIF)</label>
          <input ref={imageRef} id={`${itemId}-file`} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <p className="orh-muted">The image is saved in this browser only. Download JSON to back it up with your decisions. Uploading does not approve or publish the artwork.</p>
        </>
      )}
      {latest?.replacement && <p><a href={latest.replacement.dataUrl} download={latest.replacement.name}>Download saved replacement: {latest.replacement.name}</a></p>}
      {error && <p role="alert" className="orh-missing">{error}</p>}
      <div className="orh-decision__buttons">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            className={`orh-btn orh-btn--${o}`}
            onClick={() => save(o)}
            disabled={saving || (o === "request-changes" && !comment.trim()) || (o === "upload-replacement" && !file)}
          >
            {DECISION_LABEL[o]}
          </button>
        ))}
      </div>
    </div>
  );
}

function Links({ links }: { links: { label: string; href: string }[] }) {
  return (
    <ul className="orh-links">
      {links.map((l) => (
        <li key={l.href}>
          <a href={l.href} target={l.href.startsWith("/review/") ? "_blank" : undefined} rel="noreferrer">
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function ComparisonCard({
  c,
  history,
  onChange,
}: {
  c: Comparison;
  history: DecisionRecord[];
  onChange: (h: DecisionRecord[]) => void;
}) {
  const options: OwnerDecision[] = c.b
    ? ["approve-a", "approve-b", "reject-both", "request-changes"]
    : ["keep-current", "reject", "request-changes"];
  if (c.artwork) options.push("keep-current");
  return (
    <article className="orh-card" id={c.id}>
      <h3>{c.title}</h3>
      <p>{c.summary}</p>
      <div className={c.b ? "orh-ab" : "orh-single"}>
        {[c.a, c.b].filter(Boolean).map((v) => (
          <section key={v!.name} className="orh-variant">
            <h4>{v!.name}</h4>
            <p>{v!.description}</p>
            <Links links={v!.links} />
          </section>
        ))}
      </div>
      {c.singleOptionReason && <p className="orh-note">{c.singleOptionReason}</p>}
      <details className="orh-details">
        <summary>Proof (screenshots and recordings)</summary>
        <Links links={c.evidence} />
      </details>
      <DecisionBar itemId={c.id} options={options} history={history} onChange={onChange} />
    </article>
  );
}

type Row = Record<string, string>;
function useJson<T>(url: string): T | null {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    let live = true;
    fetch(url)
      .then((r) => (r.ok ? (r.json() as Promise<T>) : null))
      .then((d) => live && setData(d))
      .catch(() => live && setData(null));
    return () => {
      live = false;
    };
  }, [url]);
  return data;
}

const STATUS_CLASS: Record<OwnerStatus, string> = {
  "DONE and live": "live",
  "DONE but not live": "ready",
  WAITING: "waiting",
  "NOT TESTED": "untested",
};

function CoverageFilter({ summary, rows, filter, setFilter }: { summary: Row; rows: Row[]; filter: string; setFilter: (filter: string) => void }) {
  const kinds = Array.from(new Set(rows.map((r) => r.classification)));
  return (
    <>
      <dl className="orh-summary">
        {Object.entries(summary).map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <label className="orh-label">
        Show{" "}
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">all ({rows.length})</option>
          {kinds.map((k) => (
            <option key={k} value={k}>
              {k} ({rows.filter((r) => r.classification === k).length})
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

function ArtworkBoard({ history, onChange }: { history: DecisionRecord[]; onChange: (h: DecisionRecord[]) => void }) {
  const data = useJson<{ summary: Row; issues: Row[] }>("/review/artwork-board.json");
  const [filter, setFilter] = useState("all");
  const [shown, setShown] = useState(60);
  if (!data) return <p className="orh-muted">Artwork review data is not available in this draft.</p>;
  const rows = data.issues.filter((r) => filter === "all" || r.classification === filter);
  return (
    <div>
      <CoverageFilter summary={data.summary} rows={data.issues} filter={filter} setFilter={(value) => { setFilter(value); setShown(60); }} />
      <div className="orh-art-list">
        {rows.slice(0, shown).map((r) => (
          <article key={r.id} className="orh-art" id={`art-${r.id}`}>
            <div className="orh-art__images">
              {r.pageImage && (
                <figure>
                  <img src={r.pageImage} alt={`Printed page ${r.page}`} loading="lazy" />
                  <figcaption>Printed page {r.page}</figcaption>
                </figure>
              )}
              {r.servedPath && (
                <figure>
                  <img
                    src={r.servedPath}
                    alt={`Configured image ${r.id}`}
                    loading="lazy"
                    style={{ width: r.displayWidth ? `${Math.min(220, Number(r.displayWidth))}px` : undefined }}
                  />
                  <figcaption>
                    Configured asset: {r.width === "vector" ? "vector" : `${r.width}×${r.height}px`}
                  </figcaption>
                </figure>
              )}
              {r.candidatePath && (
                <figure>
                  <img src={r.candidatePath} alt={`Existing candidate ${r.id}`} loading="lazy" />
                  <figcaption>Existing candidate — not applied or approved</figcaption>
                </figure>
              )}
            </div>
            <p>
              <b>{r.id}</b> · page {r.page} · <code>{r.servedPath}</code>
            </p>
            <p>
              <b>{r.classification}</b> — {r.problem}
            </p>
            <p className="orh-muted">Proposed: {r.remedy}</p>
            <DecisionBar
              itemId={`art:${r.id}`}
              options={["keep-current", "upload-replacement", "request-changes", "reject"]}
              history={history}
              onChange={onChange}
            />
          </article>
        ))}
      </div>
      <p className="orh-muted" aria-live="polite">Showing {Math.min(shown, rows.length)} of {rows.length} artwork entries.</p>
      {shown < rows.length && <button type="button" className="orh-btn" onClick={() => setShown((n) => n + 60)}>Show more artwork</button>}
    </div>
  );
}

function AudioBoard({ history, onChange }: { history: DecisionRecord[]; onChange: (h: DecisionRecord[]) => void }) {
  const data = useJson<{ summary: Row; rows: Row[] }>("/review/audio-board.json");
  const [filter, setFilter] = useState("MISSING");
  const [shown, setShown] = useState(80);
  if (!data) return <p className="orh-muted">Audio review data is not available in this draft.</p>;
  const rows = data.rows.filter((r) => filter === "all" || r.classification === filter);
  return (
    <div>
      <CoverageFilter summary={data.summary} rows={data.rows} filter={filter} setFilter={(value) => { setFilter(value); setShown(80); }} />
      <div className="orh-audio-list">
        {rows.slice(0, shown).map((r) => (
          <article key={r.id} className="orh-audio">
            <p>
              <b lang="es">{r.script}</b> · {r.category} · {r.where}
            </p>
            {r.file?.endsWith("/Gretel_558674_Original.m4a") && r.source === "Gretel_558674_Original.m4a" ? (
              <>
                <p className="orh-muted">Original recording for listening and transcript review; not wired or approved.</p>
                <audio controls preload="none" src={r.file}>
                  <track kind="captions" />
                </audio>
              </>
            ) : (
              <p className="orh-missing">No authorized original recording is linked for review; the cue stays silent.</p>
            )}
            <p className="orh-muted">
              {r.classification} — {r.note}
            </p>
            {!(r.file?.endsWith("/Gretel_558674_Original.m4a") && r.transcriptVerified === "true" && r.source === "Gretel_558674_Original.m4a") && <p className="orh-muted">Accepting the original requires the authorized file and a verified transcript match.</p>}
            <DecisionBar
              itemId={`audio:${r.id}`}
              options={r.file?.endsWith("/Gretel_558674_Original.m4a") && r.transcriptVerified === "true" && r.source === "Gretel_558674_Original.m4a" ? ["accept-original", "needs-rerecording", "reject"] : ["needs-rerecording", "reject"]}
              history={history}
              onChange={onChange}
            />
          </article>
        ))}
      </div>
      <p className="orh-muted" aria-live="polite">Showing {Math.min(shown, rows.length)} of {rows.length} audio entries.</p>
      {shown < rows.length && <button type="button" className="orh-btn" onClick={() => setShown((n) => n + 80)}>Show more audio</button>}
    </div>
  );
}

function GamesBoard() {
  const data = useJson<Row[]>("/review/games.json");
  if (!data) return <p className="orh-muted">Games coverage data is not available in this draft.</p>;
  return (
    <ul className="orh-games">
      {data.map((g) => (
        <li key={g.route}>
          <a href={g.route}>{g.name}</a> <span className={`orh-pill orh-pill--${g.result.toLowerCase().replace(/\s+/g, "-")}`}>{g.result}</span>
          <span className="orh-muted"> {g.note}</span>
        </li>
      ))}
    </ul>
  );
}

const SECTIONS = [
  ["ab", "1–3. A/B comparisons"],
  ["turns", "4. Page turns"],
  ["art", "5. Artwork review"],
  ["audio", "6. Audio review"],
  ["motion", "7. Motion"],
  ["teacher", "8. Teacher platform"],
  ["games", "9. Games & practice"],
  ["status", "11. Verification status"],
  ["history", "12. Your decisions"],
] as const;

export function OwnerReviewHub() {
  const [history, setHistory] = useHistory();
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const counts = useMemo(() => latestDecisions(history).size, [history]);
  const turn = useJson<Row>("/review/page-turn-timing.json");
  return (
    <main className="orh" lang="en">
      <header className="orh-header">
        <p className="orh-kicker">La Cartilla de Gretel · Owner review · November 16, 2026</p>
        <h1>Review and approve</h1>
        <p>
          This is an <b>incomplete local draft</b>, not a finished review preview. Some evidence and review boards are missing. Nothing here is published. Your choices are saved in
          this browser and can be downloaded. JSON includes replacement images; CSV lists their filenames. Browser data can be cleared, so keep a JSON backup.
        </p>
        <p className="orh-muted">Build: {REVIEW_REVISION}</p>
        <nav aria-label="Sections" className="orh-nav">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
      </header>

      <section id="ab" aria-labelledby="ab-h">
        <h2 id="ab-h">A/B comparisons</h2>
        <p className="orh-note"><b>Pencil: WAITING.</b> The two whole-pencil poses shown on November 16 were rejected by the owner. They are not offered as review options. The requested pencil reference and new alternatives remain unresolved; the eraser is also incomplete.</p>
        {COMPARISONS.map((c) => (
          <ComparisonCard key={c.id} c={c} history={history} onChange={setHistory} />
        ))}
      </section>

      <section id="turns" aria-labelledby="turns-h">
        <h2 id="turns-h">Page turns</h2>
        <p>
          Workbook: bottom-right curl across the side spine — about 0.3 s lift, <b>2.6 s curl</b>, 0.1 s settle. The intended guard waits for marks and erasing; the full saving and trigger checks remain unverified. Flip Chart:
          sheet lifts over the top binding in 2.0 s.
        </p>
        {turn && (
          <dl className="orh-summary">
            {Object.entries(turn).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}
        <Links
          links={[
            { label: "Try it: Lesson 3 (draft pencil not approved)", href: "/cartilla/leccion/3?cursor=contract" },
            { label: "Try it: pages 85 → 88 (book)", href: "/cartilla/cuaderno" },
            { label: "Try it: Flip Chart top flip", href: "/cartilla/presentar/3" },
          ]}
        />
        <p className="orh-note">Pages 86–87 do not exist in the original book. They are skipped (85 → 88) and never requested.</p>
      </section>

      <section id="art" aria-labelledby="art-h">
        <h2 id="art-h">Artwork review</h2>
        <ArtworkBoard history={history} onChange={setHistory} />
      </section>

      <section id="audio" aria-labelledby="audio-h">
        <h2 id="audio-h">Gretel voice and audio review</h2>
        <p>
          The voice policy requires a verified real Gretel recording or silence; playback and transcript matches still need verification.
        </p>
        <AudioBoard history={history} onChange={setHistory} />
      </section>

      <section id="motion" aria-labelledby="motion-h">
        <h2 id="motion-h">Living pictures (motion)</h2>
        <p>
          The motion list is in MOTION-COVERAGE.csv (downloads below). No two-option motion choice is offered: no new
          motion design was made.
        </p>
      </section>

      <section id="teacher" aria-labelledby="teacher-h">
        <h2 id="teacher-h">Teacher platform, cover and everything else</h2>
        {QUICK_LINKS.map((g) => (
          <div key={g.group}>
            <h3>{g.group}</h3>
            <Links links={g.links} />
          </div>
        ))}
        <p className="orh-note">The teacher area uses the fictional demo class only. No real student data.</p>
      </section>

      <section id="games" aria-labelledby="games-h">
        <h2 id="games-h">Games and practice</h2>
        <GamesBoard />
      </section>

      <section id="status" aria-labelledby="status-h">
        <h2 id="status-h">Verification status</h2>
        {AREA_STATUS.map((a) => (
          <div key={a.area} className="orh-status">
            <h3>{a.area}</h3>
            <ul>
              {a.items.map((i) => (
                <li key={i.what}>
                  <span className={`orh-pill orh-pill--${STATUS_CLASS[i.status]}`}>{i.status}</span> {i.what}
                  <span className="orh-muted"> — {i.note}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <h3>Downloads</h3>
        {DOWNLOADS.length ? <Links links={DOWNLOADS} /> : <p>Coverage files are not available yet.</p>}
      </section>

      <section id="history" aria-labelledby="history-h">
        <h2 id="history-h">Your decisions ({counts} items decided)</h2>
        <div className="orh-decision__buttons">
          <button type="button" className="orh-btn" onClick={() => download("cartilla-owner-decisions.json", historyToJson(history), "application/json")}>
            Download JSON
          </button>
          <button type="button" className="orh-btn" onClick={() => download("cartilla-owner-decisions.csv", historyToCsv(history), "text/csv")}>
            Download CSV
          </button>
          <button type="button" className="orh-btn" onClick={() => fileRef.current?.click()}>
            Restore from file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                setHistory(importHistory(await f.text()));
                setMsg("Restored.");
              } catch {
                setMsg("That file is not a review export.");
              }
            }}
          />
        </div>
        <p aria-live="polite">{msg}</p>
        <ol className="orh-history">
          {history
            .slice()
            .reverse()
            .map((r) => (
              <li key={`${r.itemId}-${r.at}`}>
                {new Date(r.at).toLocaleString()} — <b>{r.itemId}</b>: {DECISION_LABEL[r.decision]}
                {r.comment ? ` — “${r.comment}”` : ""}
                {r.replacement && <> — <a href={r.replacement.dataUrl} download={r.replacement.name}>Download {r.replacement.name}</a></>}
              </li>
            ))}
        </ol>
      </section>
    </main>
  );
}
