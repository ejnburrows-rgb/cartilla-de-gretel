import { describe, it, expect } from "vitest";
import { resolveTeacherAccessState } from "../teacher-access-state";

const NOW = Date.parse("2026-07-30T12:00:00Z");

describe("resolveTeacherAccessState", () => {
  it("shows loading while the check is running", () => {
    expect(
      resolveTeacherAccessState({ isLoading: true, hasSession: false, hasTeacherOrAdminRole: false }),
    ).toBe("loading");
  });

  it("never grants access to an arbitrary new registration", () => {
    expect(resolveTeacherAccessState({ hasSession: true, hasTeacherOrAdminRole: false })).toBe(
      "unauthorized",
    );
  });

  it("holds a newly registered account as pending approval", () => {
    expect(
      resolveTeacherAccessState({
        hasSession: true,
        hasTeacherOrAdminRole: false,
        approvalPending: true,
      }),
    ).toBe("pending_approval");
  });

  it("separates an invalid invitation from an expired one", () => {
    expect(
      resolveTeacherAccessState({
        hasSession: true,
        hasTeacherOrAdminRole: false,
        invitation: { exists: false },
        now: NOW,
      }),
    ).toBe("invalid_invitation");

    expect(
      resolveTeacherAccessState({
        hasSession: true,
        hasTeacherOrAdminRole: false,
        invitation: { exists: true, expiresAt: "2026-07-29T12:00:00Z" },
        now: NOW,
      }),
    ).toBe("expired_invitation");

    expect(
      resolveTeacherAccessState({
        hasSession: true,
        hasTeacherOrAdminRole: false,
        invitation: { exists: true, expiresAt: "2026-07-31T12:00:00Z" },
        now: NOW,
      }),
    ).toBe("pending_approval");
  });

  it("fails closed and offers retry when the role check itself errors", () => {
    expect(
      resolveTeacherAccessState({
        checkFailed: true,
        hasSession: true,
        hasTeacherOrAdminRole: false,
      }),
    ).toBe("retry");
  });

  it("authorizes an account that genuinely holds the role", () => {
    expect(resolveTeacherAccessState({ hasSession: true, hasTeacherOrAdminRole: true })).toBe(
      "authorized",
    );
  });
});
