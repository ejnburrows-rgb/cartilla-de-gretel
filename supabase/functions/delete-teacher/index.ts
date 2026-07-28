// delete-teacher — removes a teacher's login and, optionally, everything they own.
//
// WHY THIS IS A SERVER FUNCTION
// Deleting a login requires the service-role key, which must never reach a
// browser. The teacher CRM can already delete students and classes with the
// signed-in user's own permissions, but an account can only be removed here.
//
// WHAT IT GUARDS AGAINST
//   * Callers who are not admins — the role is checked server-side against the
//     database, never trusted from the request.
//   * Deleting yourself — an admin locking themselves out mid-click.
//   * Deleting the last admin — leaving nobody able to administer anything.
//   * Silently orphaning children's records. `classes.teacher_id` has NO foreign
//     key to the login, so removing the account alone would leave the classes
//     (and every student and progress row under them) in the database, owned by
//     a user that no longer exists and therefore invisible to everyone. So a
//     teacher who still owns classes is refused unless the caller explicitly
//     asks for those classes to go too — and the response says exactly how many
//     classes and students that means, so the confirmation is informed.
//
// Everything below classes DOES cascade (classes -> students -> progress
// events, lesson progress, exercise summaries, assignments), so deleting the
// classes is sufficient to remove the rest.
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  // 1. Who is calling? Taken from the token, never from the body.
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!token) return json({ error: "No autenticado." }, 401);

  const { data: caller, error: callerError } = await admin.auth.getUser(token);
  if (callerError || !caller.user) return json({ error: "No autenticado." }, 401);
  const callerId = caller.user.id;

  // 2. Are they actually an admin? Checked against the database.
  const { data: callerRoles, error: roleError } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", callerId)
    .eq("role", "admin");
  if (roleError) return json({ error: roleError.message }, 500);
  if (!callerRoles?.length) return json({ error: "Solo un administrador puede hacer esto." }, 403);

  // 3. What are we being asked to do?
  let body: { teacherId?: string; deleteClasses?: boolean };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Petición inválida." }, 400);
  }
  const teacherId = body.teacherId;
  const deleteClasses = body.deleteClasses === true;
  if (!teacherId || typeof teacherId !== "string") {
    return json({ error: "Falta el identificador del maestro." }, 400);
  }

  if (teacherId === callerId) {
    return json({ error: "No puedes eliminar tu propia cuenta desde aquí." }, 400);
  }

  const { data: target, error: targetError } = await admin.auth.admin.getUserById(teacherId);
  if (targetError || !target.user) return json({ error: "Esa cuenta no existe." }, 404);

  // 4. Never remove the last admin.
  const { data: targetRoles } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", teacherId)
    .eq("role", "admin");
  if (targetRoles?.length) {
    const { count } = await admin
      .from("user_roles")
      .select("user_id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) <= 1) {
      return json({ error: "No puedes eliminar al último administrador." }, 400);
    }
  }

  // 5. What do they own? Needed either to refuse, or to report afterwards.
  const { data: classes, error: classesError } = await admin
    .from("classes")
    .select("id, name")
    .eq("teacher_id", teacherId);
  if (classesError) return json({ error: classesError.message }, 500);

  const classIds = (classes ?? []).map((c: { id: string }) => c.id);
  let studentCount = 0;
  if (classIds.length) {
    const { count } = await admin
      .from("students")
      .select("id", { count: "exact", head: true })
      .in("class_id", classIds);
    studentCount = count ?? 0;
  }

  if (classIds.length && !deleteClasses) {
    return json(
      {
        error: "needs_confirmation",
        message:
          "Ese maestro todavía tiene clases. Confirma para eliminar también sus clases y el progreso de sus alumnos.",
        classCount: classIds.length,
        studentCount,
        classNames: (classes ?? []).map((c: { name: string }) => c.name),
      },
      409,
    );
  }

  // 6. Delete the classes first. Students, progress events, lesson progress,
  // exercise summaries and assignments all cascade from here.
  if (classIds.length) {
    const { error } = await admin.from("classes").delete().in("id", classIds);
    if (error) return json({ error: error.message }, 500);
  }

  // 7. Then the account itself. profiles and user_roles have no cascade from
  // auth.users, so they are cleared explicitly rather than left dangling.
  await admin.from("user_roles").delete().eq("user_id", teacherId);
  await admin.from("profiles").delete().eq("id", teacherId);

  const { error: deleteError } = await admin.auth.admin.deleteUser(teacherId);
  if (deleteError) return json({ error: deleteError.message }, 500);

  return json({
    ok: true,
    deletedTeacherId: teacherId,
    deletedEmail: target.user.email ?? null,
    deletedClasses: classIds.length,
    deletedStudents: studentCount,
  });
});
