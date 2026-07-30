import { supabase } from "@/integrations/supabase/client";

/**
 * Whether a signed-in user actually holds the teacher or admin role (via the
 * has_role RPC), not just any authenticated Supabase session.
 *
 * Note on the old comment here: it used to say every self-signup automatically
 * receives the 'teacher' role, so this check "should only ever be false for an
 * account with no role row at all". That automatic grant is being removed — see
 * the prepared migration for pending/invitation-based teacher onboarding. Once
 * it is applied, a role-less account is the NORMAL state for a new signup, and
 * this check is a real gate rather than a formality. It fails closed either way.
 */
export async function hasTeacherOrAdminRole(userId: string): Promise<boolean> {
  const [teacherCheck, adminCheck] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "teacher" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
  ]);
  return teacherCheck.data === true || adminCheck.data === true;
}
