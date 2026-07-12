import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: vi.fn() },
}));

import { supabase } from "@/integrations/supabase/client";
import { hasTeacherOrAdminRole } from "../auth-role";

describe("hasTeacherOrAdminRole", () => {
  beforeEach(() => {
    vi.mocked(supabase.rpc).mockReset();
  });

  it("returns true when the user has the teacher role", async () => {
    vi.mocked(supabase.rpc).mockImplementation((_fn, args) => {
      const isTeacher = (args as { _role: string })._role === "teacher";
      return Promise.resolve({ data: isTeacher, error: null }) as unknown as ReturnType<
        typeof supabase.rpc
      >;
    });
    expect(await hasTeacherOrAdminRole("user-1")).toBe(true);
  });

  it("returns true when the user has only the admin role", async () => {
    vi.mocked(supabase.rpc).mockImplementation((_fn, args) => {
      const isAdmin = (args as { _role: string })._role === "admin";
      return Promise.resolve({ data: isAdmin, error: null }) as unknown as ReturnType<
        typeof supabase.rpc
      >;
    });
    expect(await hasTeacherOrAdminRole("user-1")).toBe(true);
  });

  it("returns false when the user has neither role", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: false, error: null } as never);
    expect(await hasTeacherOrAdminRole("user-1")).toBe(false);
  });

  it("returns false (fail closed) if the RPC errors out", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: { message: "boom" } } as never);
    expect(await hasTeacherOrAdminRole("user-1")).toBe(false);
  });
});
