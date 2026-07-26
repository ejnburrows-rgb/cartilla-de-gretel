/**
 * @vitest-environment jsdom
 */
// The Dirección (admin) page must open for exactly two kinds of visitor and
// nobody else: the demo admin account, and a real account holding the 'admin'
// role. Everyone else lands back on their own CRM rather than seeing an empty
// or partly-filled global view.
//
// This locks in the live lane added on 2026-07-26. Before it, the gate
// redirected *every* real session away, so a genuine admin could never reach
// the page. The role check cannot be synchronous — it lives in the database —
// so beforeLoad is async and these tests await it.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { isRedirect } from "@tanstack/react-router";

const getUser = vi.fn();
const rpc = vi.fn();
const isSeedSessionActive = vi.fn();
const isSeedAdmin = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: (...a: unknown[]) => getUser(...a) },
    rpc: (...a: unknown[]) => rpc(...a),
  },
}));

vi.mock("@/lib/seed-data", () => ({
  isSeedSessionActive: (...a: unknown[]) => isSeedSessionActive(...a),
  isSeedAdmin: (...a: unknown[]) => isSeedAdmin(...a),
  getSeedAdminOverview: () => ({
    teachers: [],
    totals: { teacherCount: 0, classCount: 0, studentCount: 0, accuracy: null, attentionCount: 0 },
  }),
}));

async function runGate() {
  const { Route } = await import("../admin");
  let caught: unknown;
  try {
    await Route.options.beforeLoad!({} as never);
  } catch (e) {
    caught = e;
  }
  return caught;
}

function expectRedirectToCrm(caught: unknown) {
  expect(caught).toBeDefined();
  expect(isRedirect(caught)).toBe(true);
  expect((caught as { options: { to: string } }).options.to).toBe("/cartilla/teacher/crm");
}

describe("Dirección (admin) route gate", () => {
  beforeEach(() => {
    vi.resetModules();
    getUser.mockReset();
    rpc.mockReset();
    isSeedSessionActive.mockReset();
    isSeedAdmin.mockReset();
  });

  it("lets the demo admin account in without asking the server", async () => {
    isSeedSessionActive.mockReturnValue(true);
    isSeedAdmin.mockReturnValue(true);

    expect(await runGate()).toBeUndefined();
    // The demo lane is answered locally: no round-trip should happen.
    expect(getUser).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("sends a non-admin demo account back to the CRM", async () => {
    isSeedSessionActive.mockReturnValue(true);
    isSeedAdmin.mockReturnValue(false);

    expectRedirectToCrm(await runGate());
  });

  it("lets a real account holding the admin role in", async () => {
    isSeedSessionActive.mockReturnValue(false);
    getUser.mockResolvedValue({ data: { user: { id: "admin-uuid" } }, error: null });
    rpc.mockResolvedValue({ data: true, error: null });

    expect(await runGate()).toBeUndefined();
    expect(rpc).toHaveBeenCalledWith("has_role", { _user_id: "admin-uuid", _role: "admin" });
  });

  it("sends a real teacher without the admin role back to the CRM", async () => {
    isSeedSessionActive.mockReturnValue(false);
    getUser.mockResolvedValue({ data: { user: { id: "teacher-uuid" } }, error: null });
    rpc.mockResolvedValue({ data: false, error: null });

    expectRedirectToCrm(await runGate());
  });

  it("sends a visitor with no session back to the CRM", async () => {
    isSeedSessionActive.mockReturnValue(false);
    getUser.mockResolvedValue({ data: { user: null }, error: null });

    expectRedirectToCrm(await runGate());
    expect(rpc).not.toHaveBeenCalled();
  });

  it("fails closed when the role check itself errors", async () => {
    // A refused or broken has_role call must not be read as "is an admin".
    isSeedSessionActive.mockReturnValue(false);
    getUser.mockResolvedValue({ data: { user: { id: "someone" } }, error: null });
    rpc.mockResolvedValue({ data: null, error: { message: "permission denied" } });

    expectRedirectToCrm(await runGate());
  });
});
