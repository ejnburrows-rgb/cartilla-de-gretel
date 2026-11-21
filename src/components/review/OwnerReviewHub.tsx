import { useEffect, useMemo, useRef, useState } from "react";
import { ContractPencilCursor } from "@/components/StudentBook/ContractPencilCursor";
import { WorkbookPencilMark } from "@/components/cartilla/WorkbookPencilMark";
import { useCursorMode } from "@/lib/cursor-mode";
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

interface WorkbookAuditItem {
  id: string;
  page: number;
  lesson: number | null;
  lessonTitle: string;
  word: string;
  pageImage: string | null;
  servedPath: string | null;
  candidatePath?: string | null;
  box: { x: number; y: number; width: number; height: number } | null;
  status: "READY" | "FLAGGED" | "NOT_INTEGRATED" | "MISSING" | "TEXT_ONLY" | "SOURCE_BLOCKED";
  problem: string;
}

const AUDIT_STATUS_LABEL: Record<WorkbookAuditItem["status"], string> = {
  READY: "Ready (wired)",
  FLAGGED: "Flagged crop/edge",
  NOT_INTEGRATED: "Not integrated yet",
  MISSING: "Missing file",
  TEXT_ONLY: "Text / tracing page",
  SOURCE_BLOCKED: "Source blocked (pp. 86–87)",
};

function ArtworkBoard({ history, onChange }: { history: DecisionRecord[]; onChange: (h: DecisionRecord[]) => void }) {
  const audit = useJson<{ summary: Row; items: WorkbookAuditItem[] }>("/review/workbook-artwork-audit.json");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageFilter, setPageFilter] = useState<string>("all");
  const [shown, setShown] = useState(40);
  const latestMap = useMemo(() => latestDecisions(history), [history]);

  if (!audit) return <p className="orh-muted">Loading complete 90-page workbook artwork audit…</p>;

  const pages = Array.from(new Set(audit.items.map((i) => i.page))).sort((a, b) => a - b);
  const statuses: WorkbookAuditItem["status"][] = ["READY", "FLAGGED", "NOT_INTEGRATED", "MISSING", "TEXT_ONLY", "SOURCE_BLOCKED"];
  const rows = audit.items.filter(
    (item) =>
      (statusFilter === "all" || item.status === statusFilter) &&
      (pageFilter === "all" || String(item.page) === pageFilter),
  );

  return (
    <div>
      <dl className="orh-summary">
        {Object.entries(audit.summary).map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="orh-art-filters">
        <label className="orh-label">
          Status{" "}
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setShown(40); }}>
            <option value="all">All ({audit.items.length})</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {AUDIT_STATUS_LABEL[s]} ({audit.items.filter((i) => i.status === s).length})
              </option>
            ))}
          </select>
        </label>
        <label className="orh-label">
          Page{" "}
          <select value={pageFilter} onChange={(e) => { setPageFilter(e.target.value); setShown(40); }}>
            <option value="all">All pages (1–90)</option>
            {pages.map((p) => (
              <option key={p} value={String(p)}>
                Page {p} ({audit.items.filter((i) => i.page === p).length})
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="orh-art-list">
        {rows.slice(0, shown).map((r) => {
          const uploaded = latestMap.get(`art:${r.id}`)?.replacement;
          const rightImgSrc = uploaded?.dataUrl || r.servedPath || r.candidatePath;
          return (
            <article key={r.id} className="orh-art" id={`art-${r.id}`}>
              <div className="orh-art__header">
                <b>{r.id}</b> · Page {r.page}{r.lesson ? ` (Lesson ${r.lesson})` : ""} · <span>{r.word}</span>{" "}
                <span className={`orh-pill orh-pill--${r.status === "READY" ? "live" : r.status === "FLAGGED" || r.status === "MISSING" || r.status === "NOT_INTEGRATED" ? "waiting" : "untested"}`}>
                  {AUDIT_STATUS_LABEL[r.status]}
                </span>
              </div>
              <div className="orh-art__pair">
                <figure className="orh-art__source">
                  {r.pageImage ? (
                    <div className="orh-art__scan-wrap">
                      <img src={r.pageImage} alt={`Workbook page ${r.page} scan`} loading="lazy" />
                      {r.box && (
                        <svg className="orh-art__circle-overlay" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
                          <ellipse
                            cx={r.box.x + r.box.width / 2}
                            cy={r.box.y + r.box.height / 2}
                            rx={r.box.width * 0.56}
                            ry={r.box.height * 0.56}
                            fill="rgba(196, 50, 10, 0.08)"
                            stroke="#c4320a"
                            strokeWidth="0.012"
                          />
                        </svg>
                      )}
                    </div>
                  ) : (
                    <div className="orh-art__empty">Source scan unavailable (SOURCE_BLOCKED)</div>
                  )}
                  <figcaption>
                    Original workbook page {r.page} {r.box ? "(circled asset)" : "(full page)"}
                  </figcaption>
                </figure>
                <figure className="orh-art__updated">
                  {rightImgSrc ? (
                    <img src={rightImgSrc} alt={`Updated asset for ${r.word}`} loading="lazy" />
                  ) : (
                    <div className="orh-art__empty">
                      {r.status === "TEXT_ONLY"
                        ? "No individual picture cutout configured — upload if needed"
                        : "Missing / not yet integrated — upload image below"}
                    </div>
                  )}
                  <figcaption>
                    {uploaded
                      ? `Uploaded replacement: ${uploaded.name}`
                      : r.servedPath
                        ? `Current image: ${r.servedPath}`
                        : r.candidatePath
                          ? `Candidate image: ${r.candidatePath}`
                          : "No updated image wired"}
                  </figcaption>
                </figure>
                {!uploaded && r.servedPath && r.candidatePath && r.candidatePath !== r.servedPath && (
                  <figure className="orh-art__updated">
                    <img src={r.candidatePath} alt={`Replacement candidate for ${r.word}`} loading="lazy" />
                    <figcaption>Replacement candidate: {r.candidatePath}</figcaption>
                  </figure>
                )}
              </div>
              <p className="orh-muted">{r.problem}</p>
              <DecisionBar
                itemId={`art:${r.id}`}
                options={["keep-current", "upload-replacement", "request-changes", "reject"]}
                history={history}
                onChange={onChange}
              />
            </article>
          );
        })}
      </div>
      <p className="orh-muted" aria-live="polite">Showing {Math.min(shown, rows.length)} of {rows.length} workbook entries.</p>
      {shown < rows.length && <button type="button" className="orh-btn" onClick={() => setShown((n) => n + 40)}>Show more workbook assets</button>}
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

function TopTwoPencilPrototypes({
  history,
  onChange,
}: {
  history: DecisionRecord[];
  onChange: (h: DecisionRecord[]) => void;
}) {
  const cursorMode = useCursorMode();
  const [circleState, setCircleState] = useState<"idle" | "drawing" | "done">("idle");
  const [circleRun, setCircleRun] = useState(0);
  const [xState, setXState] = useState<"idle" | "drawing" | "done">("idle");
  const [xRun, setXRun] = useState(0);

  const triggerCircle = () => {
    setCircleRun((n) => n + 1);
    setCircleState("drawing");
  };
  const triggerX = () => {
    setXRun((n) => n + 1);
    setXState("drawing");
  };

  return (
    <article
      className="orh-card"
      id="top-two-pencil-prototypes"
      data-testid="top-two-pencil-prototypes"
      data-pencil-cursor-host={cursorMode === "contract" ? "true" : undefined}
    >
      {cursorMode === "contract" && <ContractPencilCursor />}
      <p className="orh-kicker">Top Two Revised Pencil Cursor Prototypes · @image1 + Prototype B Orientation</p>
      <h3>Extreme Close-Up Sharpened Pencil Cursor — Circle &amp; X Actions</h3>
      <p>
        Extreme close-up of the real sharpened wooden pencil from <b>@image1</b> (sharp dark graphite point, visible wood fibers, scalloped yellow-painted barrel extending seamlessly all the way past the edge of the screen with no cut-off gap and zero checkerboard background) oriented as in <b>Prototype B</b>: point facing <b>up and to the left</b> at exact <code>(0, 0)</code> hotspot. The pencil lowers onto the page as though guided by hand (no hand shown), keeping the exact same zoomed close-up scale and sharp detail throughout both actions while the mark forms directly at the very end of the graphite point with zero gap or offset.
      </p>
      <div className="orh-ab">
        <section className="orh-variant" data-testid="prototype-circle-card">
          <h4>Prototype 1 — Circle Action (“Encierra en un círculo”)</h4>
          <p>
            The pencil lowers onto the page and guides the graphite point around the picture; the charcoal line forms continuously right behind the moving point with zero gap or offset.
          </p>
          <div className="orh-proto-stage">
            <button
              type="button"
              className="orh-proto-tile"
              data-testid="prototype-circle-trigger"
              aria-label="Dibujar círculo alrededor de aro"
              aria-pressed={circleState === "done"}
              onClick={triggerCircle}
            >
              <img src="/cartilla/art/faithful/vocal-a/aro.webp" alt="aro" loading="lazy" draggable={false} />
              {circleState !== "idle" && (
                <span className="orh-proto-tile__mark" key={`circle-${circleRun}`}>
                  <WorkbookPencilMark
                    markType="circle"
                    round
                    isCorrect
                    disableCloseUp
                    itemId={`proto-circle-${circleRun}`}
                    status={circleState === "done" ? "correct" : undefined}
                    onSuccess={() => setCircleState("done")}
                  />
                </span>
              )}
            </button>
            <div className="orh-decision__buttons">
              <button
                type="button"
                className="orh-btn orh-btn--approve-b"
                data-testid="prototype-circle-play"
                onClick={triggerCircle}
              >
                Draw Circle
              </button>
              <button
                type="button"
                className="orh-btn"
                data-testid="prototype-circle-reset"
                onClick={() => setCircleState("idle")}
              >
                Reset Circle
              </button>
            </div>
          </div>
          <Links links={[{ label: "Open Circle in Lesson 1 Workbook", href: "/cartilla/leccion/1" }]} />
        </section>

        <section className="orh-variant" data-testid="prototype-x-card">
          <h4>Prototype 2 — X Action (“Marca con una X”)</h4>
          <p>
            At the exact same close-up scale and sharp detail, the pencil lowers onto the page and draws each diagonal stroke sequentially right from the very end of the graphite tip with zero gap or offset.
          </p>
          <div className="orh-proto-stage">
            <button
              type="button"
              className="orh-proto-tile"
              data-testid="prototype-x-trigger"
              aria-label="Marcar con una X sobre abanico"
              aria-pressed={xState === "done"}
              onClick={triggerX}
            >
              <img src="/cartilla/art/faithful/vocal-a/abanico.webp" alt="abanico" loading="lazy" draggable={false} />
              {xState !== "idle" && (
                <span className="orh-proto-tile__mark" key={`x-${xRun}`}>
                  <WorkbookPencilMark
                    markType="x"
                    round
                    isCorrect
                    disableCloseUp
                    itemId={`proto-x-${xRun}`}
                    status={xState === "done" ? "correct" : undefined}
                    onSuccess={() => setXState("done")}
                  />
                </span>
              )}
            </button>
            <div className="orh-decision__buttons">
              <button
                type="button"
                className="orh-btn orh-btn--approve-b"
                data-testid="prototype-x-play"
                onClick={triggerX}
              >
                Mark X
              </button>
              <button
                type="button"
                className="orh-btn"
                data-testid="prototype-x-reset"
                onClick={() => setXState("idle")}
              >
                Reset X
              </button>
            </div>
          </div>
          <Links links={[{ label: "Open X in Lesson 3 Workbook", href: "/cartilla/leccion/3" }]} />
        </section>
      </div>
      <DecisionBar
        itemId="top-two-pencil-prototypes"
        options={["approve-b", "request-changes", "reject-both"]}
        history={history}
        onChange={onChange}
      />
    </article>
  );
}

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
        <TopTwoPencilPrototypes history={history} onChange={setHistory} />
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
            { label: "Try it: Lesson 3 (locked pencil)", href: "/cartilla/leccion/3?cursor=contract" },
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
