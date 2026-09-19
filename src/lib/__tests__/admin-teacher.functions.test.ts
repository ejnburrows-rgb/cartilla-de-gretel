/**
 * @vitest-environment jsdom
 */
// The client half of teacher-account deletion. The guards that matter (admin
// only, no self-deletion, no deleting the last admin) live in the Edge Function
// and are verified against the live project; what has to be right here is that
// a refusal is never mistaken for a success.
//
// The 409 "needs confirmation" case is the subtle one: supabase-js reports any
// non-2xx as an error, so without special handling a refusal to delete would
// look like a plain failure and the admin would never see what it would cost.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteTeacherAccount } from "../admin-teacher.functions";

const invoke = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: (...a: unknown[]) => invoke(...a) } },
}));

/** Mimics supabase-js: non-2xx becomes an error carrying the Response. */
const httpError = (status: number, body: unknown) => ({
  data: null,
  error: Object.assign(new Error(`Edge Function returned ${status}`), {
    context: { status, json: async () => body },
  }),
});

describe("deleteTeacherAccount", () => {
  beforeEach(() => invoke.mockReset());

  it("asks without deleteClasses on the first call", async () => {
    invoke.mockResolvedValue({
      data: { ok: true, deletedClasses: 0, deletedStudents: 0 },
      error: null,
    });
    await deleteTeacherAccount("teacher-1");
    expect(invoke).toHaveBeenCalledWith("delete-teacher", {
      body: { teacherId: "teacher-1", deleteClasses: false },
    });
  });

  it("reports what would be lost when the server asks for confirmation", async () => {
    invoke.mockResolvedValue(
      httpError(409, {
        error: "needs_confirmation",
        message: "Ese maestro todavía tiene clases.",
        classCount: 2,
        studentCount: 7,
        classNames: ["Clase A", "Clase B"],
      }),
    );

    const result = await deleteTeacherAccount("teacher-1");
    expect(result.status).toBe("needs_confirmation");
    if (result.status !== "needs_confirmation") throw new Error("unreachable");
    expect(result.classCount).toBe(2);
    expect(result.studentCount).toBe(7);
    expect(result.classNames).toEqual(["Clase A", "Clase B"]);
  });

  it("passes deleteClasses through once confirmed, and reports the result", async () => {
    invoke.mockResolvedValue({
      data: { ok: true, deletedEmail: "maria@escuela.com", deletedClasses: 2, deletedStudents: 7 },
      error: null,
    });

    const result = await deleteTeacherAccount("teacher-1", { deleteClasses: true });
    expect(invoke).toHaveBeenCalledWith("delete-teacher", {
      body: { teacherId: "teacher-1", deleteClasses: true },
    });
    expect(result).toEqual({
      status: "deleted",
      deletedEmail: "maria@escuela.com",
      deletedClasses: 2,
      deletedStudents: 7,
    });
  });

  it("surfaces a refusal as an error, not a success", async () => {
    for (const [status, message] of [
      [403, "Solo un administrador puede hacer esto."],
      [400, "No puedes eliminar tu propia cuenta desde aquí."],
      [400, "No puedes eliminar al último administrador."],
      [404, "Esa cuenta no existe."],
    ] as const) {
      invoke.mockResolvedValue(httpError(status, { error: message }));
      const result = await deleteTeacherAccount("teacher-1");
      expect(result.status).toBe("error");
      if (result.status !== "error") throw new Error("unreachable");
      expect(result.message).toBe(message);
    }
  });

  it("does not claim success when the body says otherwise", async () => {
    invoke.mockResolvedValue({ data: { ok: false, error: "algo salió mal" }, error: null });
    const result = await deleteTeacherAccount("teacher-1");
    expect(result.status).toBe("error");
  });

  it("still reports an error when the failure body cannot be read", async () => {
    invoke.mockResolvedValue({ data: null, error: new Error("network down") });
    const result = await deleteTeacherAccount("teacher-1");
    expect(result.status).toBe("error");
    if (result.status !== "error") throw new Error("unreachable");
    expect(result.message).toBe("network down");
  });
});
