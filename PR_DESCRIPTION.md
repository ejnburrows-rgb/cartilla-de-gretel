# 🔒 Prevent XSS with URL parameter encoding in practice links

## 🎯 **What:** The vulnerability fixed
The `familyPracticeHref` function used to construct a `href` directly by interpolating user-provided or externally sourced values (`lessonNumber`, `activity`) into a URL string using template literals (e.g. `lesson=${lessonNumber}&activity=${activity}`). This left the application vulnerable to URL parameter manipulation or Cross-Site Scripting (XSS) if either parameter were crafted maliciously (for example, containing quotes, amperands, or even potentially unescaped strings mapping out a secondary payload or manipulating URL structure).

## ⚠️ **Risk:** The potential impact if left unfixed
Without proper encoding, malicious input embedded in either the `lessonNumber` or `activity` variables could disrupt the intended URL format or append unforeseen malicious parameters. If `familyPracticeHref` were ever populated by dynamic external inputs, this vulnerability could escalate into a cross-site scripting (XSS) attack vector when an administrative user or parent interacted with the link.

## 🛡️ **Solution:** How the fix addresses the vulnerability
This change implements standard URL encoding by generating the query parameters with `URLSearchParams`. This API handles all parameter escaping, guaranteeing safe characters in the resulting query string, strictly neutralizing any parameter tampering or embedded payload attacks.

Tested thoroughly against `TeacherDailyHome` and route files using Vitest, confirming functionality was preserved while drastically improving security hygiene.
