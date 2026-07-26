// Weak-password rejection for new teacher passwords. This stands in for
// Supabase's breach check, which is Pro-plan-only and unavailable on this
// project's Free plan.
//
// The most important test in this file is the last one: these rules must apply
// to NEW passwords only. Applying them at sign-in would lock existing teachers
// out of their own accounts.
import { describe, it, expect } from "vitest";
import { checkNewPassword, MIN_NEW_PASSWORD_LENGTH } from "../password-strength";

describe("checkNewPassword", () => {
  it("accepts a decent passphrase", () => {
    expect(checkNewPassword("caballo verde ventana").ok).toBe(true);
    expect(checkNewPassword("Gretel-Lee-2026-Xk").ok).toBe(true);
  });

  it(`rejects anything shorter than ${MIN_NEW_PASSWORD_LENGTH} characters`, () => {
    const short = checkNewPassword("Abc12345"); // 8 chars
    expect(short.ok).toBe(false);
    expect(short.problem).toBe("too_short");
    expect(short.message).toContain(String(MIN_NEW_PASSWORD_LENGTH));
  });

  it("rejects the passwords people actually pick", () => {
    for (const weak of ["password123", "contrasena123", "escuela123", "qwertyuiop", "1234567890"]) {
      const result = checkNewPassword(weak);
      expect(result.ok, `expected "${weak}" to be rejected`).toBe(false);
    }
  });

  it("ignores accents, so contraseña is caught as well as contrasena", () => {
    expect(checkNewPassword("contraseña").ok).toBe(false);
  });

  it("ignores case", () => {
    expect(checkNewPassword("PassWord123").ok).toBe(false);
  });

  it("sees through padding a common word with digits or punctuation", () => {
    // "escuela" padded out to reach the length rule is still "escuela".
    expect(checkNewPassword("escuela2026!").problem).toBe("too_common");
    expect(checkNewPassword("gretel-----").problem).toBe("too_common");
  });

  it("rejects a single repeated character", () => {
    expect(checkNewPassword("aaaaaaaaaaaa").problem).toBe("single_character");
  });

  it("rejects simple sequences", () => {
    expect(checkNewPassword("abcdefghijk").problem).toBe("sequential");
    expect(checkNewPassword("9876543210").problem).toBe("sequential");
  });

  it("rejects the teacher's own email or name as their password", () => {
    expect(
      checkNewPassword("maestra.lopez@escuela.com", { email: "maestra.lopez@escuela.com" }).problem,
    ).toBe("contains_email");
    expect(checkNewPassword("maestra.lopez", { email: "maestra.lopez@escuela.com" }).problem).toBe(
      "contains_email",
    );
    expect(checkNewPassword("leonorlopetegui", { fullName: "Leonor Lopetegui" }).problem).toBe(
      "contains_name",
    );
  });

  it("does not reject a strong password that merely contains a common word", () => {
    // "escuela" appears, but the password as a whole is not guessable.
    expect(checkNewPassword("escuela-del-rio-azul-77").ok).toBe(true);
  });

  it("always returns a Spanish message a teacher can act on", () => {
    for (const weak of ["short", "password", "aaaaaaaaaaaa", "abcdefghijk"]) {
      const { ok, message } = checkNewPassword(weak);
      expect(ok).toBe(false);
      expect(message).toBeTruthy();
      // No English leaking into the student/teacher UI (AGENTS.md: Spanish-only).
      expect(message).not.toMatch(/\b(password|must|characters|invalid)\b/i);
    }
  });

  it("is not applied to existing passwords — sign-in must stay unaffected", () => {
    // A teacher who signed up before these rules may well have a 6-character
    // password. This function is only ever called on sign-up/change, and this
    // test documents that intent: it WOULD reject such a password, which is
    // exactly why the sign-in path must not call it.
    expect(checkNewPassword("abc123").ok).toBe(false);
  });
});
