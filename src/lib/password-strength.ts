// Weak-password rejection for teacher sign-up.
//
// WHY THIS EXISTS
// Supabase can reject passwords found in the HaveIBeenPwned breach corpus, but
// that feature is Pro-plan-and-above and this project is on the Free plan
// (verified 2026-07-26: the dashboard control is locked). Teacher accounts reach
// real children's records, so shipping with a 6-character minimum and no other
// check was the weakest link in the product.
//
// WHAT THIS IS, HONESTLY
// Not a replacement for a breach check. HaveIBeenPwned covers hundreds of
// millions of leaked passwords; the list below is a few hundred. What it does
// cover is the part that actually shows up in practice — "123456", "password",
// "qwerty123", the account's own email, a single repeated character — plus a
// longer minimum length, which is the single most effective rule available
// without an external service. If the project ever moves to Pro, turn the
// Supabase setting on and keep this as a first line of defence.
//
// It runs in the browser, so it is a guard against a teacher *accidentally*
// choosing a terrible password, not against someone deliberately calling the
// auth API directly. That is the right threat model here: the risk is a busy
// teacher typing "escuela123", not a teacher attacking their own account. The
// server-side complement is Supabase's own password-requirements settings
// (minimum length and required character classes), which ARE available on the
// Free plan.

/** Minimum length for a NEW password. Deliberately above Supabase's default of
 * 6: length beats complexity rules, and this is the one lever available without
 * a breach-check service. Never applied when signing in — an existing teacher
 * must always be able to type the password they already have. */
export const MIN_NEW_PASSWORD_LENGTH = 10;

/**
 * The passwords that actually get chosen. Drawn from the top of the commonly
 * published breach lists, plus Spanish-language and school-context entries that
 * a generic English list would miss. Compared case-insensitively, so only
 * lowercase forms are listed.
 */
const COMMON_PASSWORDS = new Set([
  // Numeric runs and keyboard walks
  "123456",
  "1234567",
  "12345678",
  "123456789",
  "1234567890",
  "12345",
  "1234",
  "111111",
  "000000",
  "121212",
  "123123",
  "112233",
  "654321",
  "666666",
  "888888",
  "qwerty",
  "qwerty123",
  "qwertyuiop",
  "asdfgh",
  "asdfghjk",
  "zxcvbn",
  "1q2w3e4r",
  "qazwsx",
  "1qaz2wsx",
  "poiuyt",
  "qwertz",
  // English classics
  "password",
  "password1",
  "password12",
  "password123",
  "passw0rd",
  "p@ssword",
  "p@ssw0rd",
  "letmein",
  "welcome",
  "welcome1",
  "welcome123",
  "admin",
  "admin123",
  "administrator",
  "root",
  "toor",
  "guest",
  "test",
  "test123",
  "testing",
  "iloveyou",
  "monkey",
  "dragon",
  "sunshine",
  "princess",
  "football",
  "baseball",
  "shadow",
  "master",
  "superman",
  "batman",
  "trustno1",
  "whatever",
  "starwars",
  "abc123",
  "abcd1234",
  "abcdef",
  "aaaaaa",
  "changeme",
  "default",
  "secret",
  "freedom",
  "hello",
  "hello123",
  "charlie",
  "jordan",
  "michael",
  "jennifer",
  "computer",
  "internet",
  "samsung",
  "google",
  "myspace1",
  "ashley",
  "bailey",
  // Spanish-language
  "contrasena",
  "contraseña",
  "contrasena1",
  "contrasena123",
  "clave",
  "clave123",
  "hola",
  "hola123",
  "holamundo",
  "amor",
  "amor123",
  "teamo",
  "tequiero",
  "familia",
  "mama",
  "papa",
  "hermano",
  "hermana",
  "abuela",
  "abuelo",
  "mexico",
  "mexico123",
  "espana",
  "españa",
  "argentina",
  "colombia",
  "chile",
  "venezuela",
  "peru",
  "ecuador",
  "guatemala",
  "honduras",
  "salvador",
  "futbol",
  "futbol123",
  "barcelona",
  "madrid",
  "america",
  "chivas",
  "cruzazul",
  "usuario",
  "usuario1",
  "administrador",
  "maestro",
  "maestra",
  "profesor",
  "profesora",
  "docente",
  "director",
  "directora",
  "escuela",
  "escuela123",
  "colegio",
  "colegio123",
  "primaria",
  "kinder",
  "jardin",
  "alumno",
  "alumnos",
  "estudiante",
  "clase",
  "clase123",
  "salon",
  "grupo",
  "tarea",
  "libro",
  "verano",
  "invierno",
  "primavera",
  "otono",
  "otoño",
  "navidad",
  "gatito",
  "perrito",
  "flores",
  "estrella",
  "corazon",
  "mariposa",
  "angel",
  "bonita",
  "hermosa",
  "guapa",
  "linda",
  "princesa",
  "reina",
  "amiga",
  // Product-specific guesses
  "cartilla",
  "cartilla123",
  "gretel",
  "gretel123",
  "cartilladegretel",
  "lacartilla",
  "lacartilladegretel",
  "doubler",
  "lopetegui",
]);

export type PasswordProblem =
  | "too_short"
  | "too_common"
  | "contains_email"
  | "contains_name"
  | "single_character"
  | "sequential";

export interface PasswordCheck {
  ok: boolean;
  problem?: PasswordProblem;
  /** Ready to show to a teacher, in Spanish. */
  message?: string;
}

const MESSAGES: Record<PasswordProblem, string> = {
  too_short: `La contraseña debe tener al menos ${MIN_NEW_PASSWORD_LENGTH} caracteres.`,
  too_common:
    "Esa contraseña es demasiado común y es fácil de adivinar. Elige otra, por ejemplo tres palabras que solo tú recuerdes.",
  contains_email: "La contraseña no puede ser tu correo electrónico.",
  contains_name: "La contraseña no puede ser tu nombre.",
  single_character: "La contraseña no puede ser el mismo carácter repetido.",
  sequential: "La contraseña no puede ser una secuencia simple como 123456 o abcdef.",
};

/** Strips accents so "contraseña" and "contrasena" are treated alike. */
function normalize(value: string): string {
  return value.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** True for runs like 123456, 654321, abcdef — six or more consecutive steps. */
function isSequential(value: string): boolean {
  if (value.length < 6) return false;
  let ascending = 0;
  let descending = 0;
  for (let i = 1; i < value.length; i++) {
    const step = value.charCodeAt(i) - value.charCodeAt(i - 1);
    ascending = step === 1 ? ascending + 1 : 0;
    descending = step === -1 ? descending + 1 : 0;
    if (ascending >= 5 || descending >= 5) return true;
  }
  return false;
}

/**
 * Checks a password a teacher is about to set. Sign-up and password change
 * only — never call this on sign-in, or a teacher whose existing password
 * predates these rules would be locked out of their own account.
 */
export function checkNewPassword(
  password: string,
  context: { email?: string; fullName?: string } = {},
): PasswordCheck {
  const fail = (problem: PasswordProblem): PasswordCheck => ({
    ok: false,
    problem,
    message: MESSAGES[problem],
  });

  if (password.length < MIN_NEW_PASSWORD_LENGTH) return fail("too_short");

  const normalized = normalize(password);

  if (COMMON_PASSWORDS.has(normalized)) return fail("too_common");

  // Common padding of a weak base: "password2024", "escuela!!" and friends.
  const stripped = normalized.replace(/[^a-z]/g, "");
  if (stripped.length >= 4 && COMMON_PASSWORDS.has(stripped)) return fail("too_common");

  if (new Set(normalized).size === 1) return fail("single_character");
  if (isSequential(normalized)) return fail("sequential");

  const email = normalize(context.email ?? "");
  if (email) {
    const localPart = email.split("@")[0];
    if (normalized === email || (localPart.length >= 4 && normalized === localPart)) {
      return fail("contains_email");
    }
  }

  const name = normalize(context.fullName ?? "").replace(/\s+/g, "");
  if (name.length >= 4 && normalized === name) return fail("contains_name");

  return { ok: true };
}
