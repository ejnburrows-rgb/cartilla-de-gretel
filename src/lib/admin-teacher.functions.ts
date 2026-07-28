// Admin-only teacher account removal.
//
// Deleting a login needs the service-role key, which must never be in a
// browser, so the real work happens in the `delete-teacher` Edge Function. This
// is just the call and the shape of its answers.
import { supabase } from "@/integrations/supabase/client";

/** The function refused because the teacher still owns classes. The caller
 * shows these numbers in the confirmation, then calls again with
 * `deleteClasses: true`. */
export interface DeleteTeacherNeedsConfirmation {
  status: "needs_confirmation";
  message: string;
  classCount: number;
  studentCount: number;
  classNames: string[];
}

export interface DeleteTeacherDone {
  status: "deleted";
  deletedEmail: string | null;
  deletedClasses: number;
  deletedStudents: number;
}

export interface DeleteTeacherFailed {
  status: "error";
  message: string;
}

export type DeleteTeacherResult =
  | DeleteTeacherNeedsConfirmation
  | DeleteTeacherDone
  | DeleteTeacherFailed;

/**
 * Removes a teacher's account.
 *
 * Called once without `deleteClasses`: if the teacher still owns classes the
 * function refuses and reports how many classes and students would be lost, so
 * the admin confirms knowing the cost. Called again with `deleteClasses: true`
 * it removes the classes (students and all their progress cascade from there)
 * and then the login.
 *
 * Every guard that matters — is the caller an admin, is this self-deletion, is
 * this the last admin — is enforced inside the function, not here. This cannot
 * be made safe by the UI alone.
 */
export async function deleteTeacherAccount(
  teacherId: string,
  options: { deleteClasses?: boolean } = {},
): Promise<DeleteTeacherResult> {
  const { data, error } = await supabase.functions.invoke("delete-teacher", {
    body: { teacherId, deleteClasses: options.deleteClasses === true },
  });

  // A refusal comes back as a non-2xx, which supabase-js surfaces as an error
  // with the body attached — the 409 confirmation case has to be read out of it
  // rather than treated as a failure.
  if (error) {
    const body = await readErrorBody(error);
    if (body?.error === "needs_confirmation") {
      return {
        status: "needs_confirmation",
        message: body.message ?? "Ese maestro todavía tiene clases.",
        classCount: Number(body.classCount ?? 0),
        studentCount: Number(body.studentCount ?? 0),
        classNames: Array.isArray(body.classNames) ? body.classNames : [],
      };
    }
    return {
      status: "error",
      message: body?.error ?? error.message ?? "No se pudo eliminar la cuenta.",
    };
  }

  if (data?.ok) {
    return {
      status: "deleted",
      deletedEmail: data.deletedEmail ?? null,
      deletedClasses: Number(data.deletedClasses ?? 0),
      deletedStudents: Number(data.deletedStudents ?? 0),
    };
  }

  return { status: "error", message: data?.error ?? "No se pudo eliminar la cuenta." };
}

type ErrorBody = {
  error?: string;
  message?: string;
  classCount?: number;
  studentCount?: number;
  classNames?: string[];
};

/** supabase-js wraps a non-2xx in a FunctionsHttpError carrying the Response. */
async function readErrorBody(error: unknown): Promise<ErrorBody | null> {
  const context = (error as { context?: unknown }).context;
  if (context && typeof (context as Response).json === "function") {
    try {
      return (await (context as Response).json()) as ErrorBody;
    } catch {
      return null;
    }
  }
  return null;
}
