// Redeems a teacher invitation code. Role assignment stays entirely
// server-side (accept_teacher_invitation validates the code, checks
// expiry, and only then grants the role) — the client never decides who
// gets teacher/admin access. See
// supabase/migrations/20260730100002_secure_progress_rpcs_and_invitations.sql.

import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const inputSchema = z.object({
  invitationCode: z.string().trim().min(1).max(200),
});

export async function acceptTeacherInvitation(invitationCode: string): Promise<{ role: string }> {
  const data = inputSchema.parse({ invitationCode });
  const { data: role, error } = await supabase.rpc("accept_teacher_invitation", {
    p_invitation_code: data.invitationCode,
  });
  if (error) throw new Error(error.message || "No se pudo aceptar la invitación.");
  return { role: String(role) };
}
