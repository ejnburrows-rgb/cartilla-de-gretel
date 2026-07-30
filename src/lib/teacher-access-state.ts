// Teacher onboarding states.
//
// Public registration must not hand out teacher access. A new account is
// pending until an administrator approves it or a valid invitation is
// accepted, and every one of those outcomes needs a real screen state rather
// than a silent redirect.

export type TeacherAccessState =
  | "loading"
  | "authorized"
  | "pending_approval"
  | "invalid_invitation"
  | "expired_invitation"
  | "unauthorized"
  | "retry";

export type TeacherAccessInput = {
  /** Still resolving the session or the role check. */
  isLoading?: boolean;
  /** The role check itself failed (network/RPC). Never treat this as "allowed". */
  checkFailed?: boolean;
  hasSession: boolean;
  hasTeacherOrAdminRole: boolean;
  /** Present only when the account arrived through an invitation link. */
  invitation?: {
    exists: boolean;
    expiresAt?: string;
    acceptedAt?: string | null;
  };
  /** True once an approval request exists but has not been granted. */
  approvalPending?: boolean;
  now?: number;
};

/**
 * Resolves what the teacher lane should show. Fails closed: anything unclear
 * results in no access, never in access-by-accident.
 */
export function resolveTeacherAccessState(input: TeacherAccessInput): TeacherAccessState {
  if (input.isLoading) return "loading";
  if (input.checkFailed) return "retry";
  if (!input.hasSession) return "unauthorized";
  if (input.hasTeacherOrAdminRole) return "authorized";

  if (input.invitation) {
    if (!input.invitation.exists) return "invalid_invitation";
    const expiry = input.invitation.expiresAt ? Date.parse(input.invitation.expiresAt) : NaN;
    if (Number.isNaN(expiry)) return "invalid_invitation";
    if (expiry <= (input.now ?? Date.now())) return "expired_invitation";
    return "pending_approval";
  }

  if (input.approvalPending) return "pending_approval";
  return "unauthorized";
}

/** Spanish copy for each state, so no screen invents its own wording. */
export const TEACHER_ACCESS_MESSAGES: Record<TeacherAccessState, string> = {
  loading: "Comprobando tu acceso…",
  authorized: "Acceso confirmado.",
  pending_approval:
    "Tu cuenta está pendiente de aprobación. Te avisaremos cuando el acceso docente esté activo.",
  invalid_invitation: "Esta invitación no es válida. Pide una invitación nueva.",
  expired_invitation: "Esta invitación ya venció. Pide una invitación nueva.",
  unauthorized: "Esta cuenta no tiene acceso docente.",
  retry: "No pudimos comprobar tu acceso. Intenta de nuevo.",
};

// The states above that only ever show up on /login (never "loading" or
// "authorized", which never survive a redirect) are handed off from the
// /cartilla/teacher route guard via sessionStorage — same mechanism the old
// "cartilla.auth.unauthorized" flag used, generalized to every state.
export type HandoffTeacherAccessState = Exclude<TeacherAccessState, "loading" | "authorized">;

const HANDOFF_KEY = "cartilla.auth.state";

export function setTeacherAccessNotice(state: HandoffTeacherAccessState) {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.setItem(HANDOFF_KEY, state);
    }
  } catch {
    /* storage unavailable in some test runners — the redirect still happens */
  }
}

/** Reads and clears the handed-off state, so a page refresh doesn't re-show it. */
export function consumeTeacherAccessNotice(): HandoffTeacherAccessState | null {
  if (typeof window === "undefined" || !window.sessionStorage) return null;
  try {
    const raw = window.sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(HANDOFF_KEY);
    if (
      raw === "pending_approval" ||
      raw === "invalid_invitation" ||
      raw === "expired_invitation" ||
      raw === "unauthorized" ||
      raw === "retry"
    ) {
      return raw;
    }
    return null;
  } catch {
    return null;
  }
}
