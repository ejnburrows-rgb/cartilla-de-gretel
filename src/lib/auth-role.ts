import { supabase } from "@/integrations/supabase/client";

/**
 * Whether a signed-in user actually holds the teacher or admin role (via
 * the has_role RPC), not just any authenticated Supabase session. Every
 * self-signup already gets 'teacher' automatically (see the
 * handle_new_user database trigger), so this should only ever be false
 * for an account with no role row at all.
 */
export async function hasTeacherOrAdminRole(userId: string): Promise<boolean> {
  const [teacherCheck, adminCheck] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "teacher" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
  ]);
  return teacherCheck.data === true || adminCheck.data === true;
}
