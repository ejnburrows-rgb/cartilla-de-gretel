import { describe, it, expect, beforeEach, vi } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import { acceptTeacherInvitation } from "../teacher-invitations.functions";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: vi.fn() },
}));

describe("acceptTeacherInvitation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redeems a valid code and returns the granted role", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: "teacher", error: null } as never);

    const result = await acceptTeacherInvitation(" SYN-CODE-1 ");

    expect(supabase.rpc).toHaveBeenCalledWith("accept_teacher_invitation", {
      p_invitation_code: "SYN-CODE-1",
    });
    expect(result).toEqual({ role: "teacher" });
  });

  it("surfaces the server's error message for an invalid code", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: { message: "Invitación inválida" },
    } as never);

    await expect(acceptTeacherInvitation("BAD")).rejects.toThrow("Invitación inválida");
  });

  it("rejects an empty code before calling the RPC", async () => {
    await expect(acceptTeacherInvitation("")).rejects.toThrow();
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
