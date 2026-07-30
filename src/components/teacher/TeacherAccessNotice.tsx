import { Link } from "@tanstack/react-router";
import { ArrowLeft, GraduationCap, Loader2 } from "lucide-react";
import { TEACHER_ACCESS_MESSAGES, type TeacherAccessState } from "@/lib/teacher-access-state";
import "@/styles/teacher-chrome.css";

/**
 * Full-screen status shown for every non-authorized teacher-access state
 * (loading, pending approval, invalid/expired invitation, unauthorized,
 * retry). Matches the hand-rolled teacher-chrome shell login.tsx already
 * uses, rather than introducing a separate Card/Alert convention.
 */
export function TeacherAccessNotice({
  state,
  onRetry,
}: {
  state: Exclude<TeacherAccessState, "authorized">;
  onRetry?: () => void;
}) {
  const message = TEACHER_ACCESS_MESSAGES[state];
  return (
    <main className="teacher-chrome min-h-screen px-4 py-8 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="teacher-chrome__brand-mark mx-auto w-14 h-14 rounded-2xl text-white flex items-center justify-center">
          {state === "loading" ? (
            <Loader2 className="w-7 h-7 animate-spin" />
          ) : (
            <GraduationCap className="w-7 h-7" />
          )}
        </div>
        <p
          role={state === "loading" ? "status" : "alert"}
          className={
            state === "loading"
              ? "mt-6 text-sm font-bold text-[var(--tc-ink-soft)] bg-white/60 border-2 border-[var(--tc-border)] rounded-2xl px-4 py-3"
              : "mt-6 text-sm font-bold text-destructive bg-destructive/10 border-2 border-destructive/20 rounded-2xl px-4 py-3"
          }
        >
          {message}
        </p>
        {state === "retry" && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 w-full py-3 rounded-2xl text-white font-black text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition"
            style={{ background: "linear-gradient(135deg, #5fa777, #3d7a5c)" }}
          >
            Intentar de nuevo
          </button>
        )}
        {state !== "loading" && (
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--tc-ink-soft)] hover:text-[var(--tc-ink)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al acceso
          </Link>
        )}
      </div>
    </main>
  );
}
