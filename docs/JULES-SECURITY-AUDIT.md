# Security Audit Report

This report documents the security audit findings for the repository, analyzing hardcoded secrets, unsafe DOM/JavaScript patterns, package/dependency vulnerabilities, and gitignore anomalies.

---

## 1. Hardcoded Secrets, API Keys, Tokens, or Credentials

*   **Low** | `None` + `N/A` | No hardcoded secrets, API keys, tokens, or credentials found in the codebase or git-tracked files.

---

## 2. Unsafe DOM and JavaScript Patterns (XSS/Injection)

*   **Low** | `None` + `N/A` | No occurrences of `dangerouslySetInnerHTML`, `eval`, or unvalidated user input directly rendered to the DOM were found.

---

## 3. Package Vulnerabilities (pnpm audit)

The following vulnerabilities were identified in the project's dependencies. Note that no Critical vulnerabilities were found.

### High Severity Findings

*   **High** | `package.json` + `line 118` | **playwright** (<1.55.1): Playwright downloads and installs browsers without verifying the authenticity of the SSL certificate. Fixed in >=1.55.1.
*   **High** | `package.json` + `line 116` | **undici** (>=7.23.0 <7.28.0 via `jsdom`): Vulnerable to TLS certificate validation bypass via dropped requestTls in SOCKS5 ProxyAgent. Fixed in >=7.28.0.
*   **High** | `package.json` + `line 116` | **undici** (>=7.0.0 <7.28.0 via `jsdom`): WebSocket client vulnerable to denial of service via fragment count bypass. Fixed in >=7.28.0.
*   **High** | `package.json` + `line 116` | **undici** (>=7.23.0 <7.28.0 via `jsdom`): Vulnerable to cross-origin request routing via SOCKS5 proxy pool reuse. Fixed in >=7.28.0.
*   **High** | `package.json` + `line 120` | **vite** (>=7.0.0 <=7.3.4): `server.fs.deny` bypass on Windows alternate paths. Fixed in >=7.3.5.
*   **High** | `package.json` + `line 110` | **brace-expansion** (<1.1.16 via `eslint`): DoS via exponential-time expansion of consecutive non-expanding {} groups. Fixed in >=1.1.16.
*   **High** | `package.json` + `line 110` | **brace-expansion** (>=3.0.0 <5.0.7 via `eslint`): DoS via exponential-time expansion of consecutive non-expanding {} groups. Fixed in >=5.0.7.
*   **High** | `package.json` + `line 110` | **js-yaml** (>=4.0.0 <4.3.0 via `eslint`): YAML merge-key chains can force quadratic CPU consumption. Fixed in >=4.3.0.
*   **High** | `package.json` + `line 108` | **fast-uri** (>=3.0.0 <=3.1.3 via `ajv`): fast-uri vulnerable to host confusion via literal backslash authority delimiter. Fixed in >=3.1.4.
*   **High** | `package.json` + `line 117` | **sharp** (<0.35.0): Inherited vulnerabilities in libvips (CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591). Fixed in >=0.35.0.

### Medium/Moderate Severity Findings

*   **Medium** | `package.json` + `line 120` | **vite** (>=7.0.0 <=7.3.4): launch-editor: NTLMv2 hash disclosure via UNC path handling on Windows. Fixed in >=7.3.5.
*   **Medium** | `package.json` + `line 116` | **undici** (>=7.0.0 <7.28.0 via `jsdom`): Vulnerable to HTTP header injection via Set-Cookie percent-decoding. Fixed in >=7.28.0.
*   **Medium** | `package.json` + `line 116` | **undici** (>=7.0.0 <7.28.0 via `jsdom`): Vulnerable to cross-user information disclosure via shared cache whitespace bypass. Fixed in >=7.28.0.
*   **Medium** | `package.json` + `line 110` | **js-yaml** (>=4.0.0 <=4.1.1 via `eslint`): JS-YAML: Quadratic-complexity DoS in merge key handling via repeated aliases. Fixed in >=4.2.0.

### Low Severity Findings

*   **Low** | `package.json` + `line 120` | **esbuild** (>=0.27.3 <0.28.1 via `vite`): Allows arbitrary file read when running the development server on Windows. Fixed in >=0.28.1.
*   **Low** | `package.json` + `line 116` | **undici** (>=7.0.0 <7.28.0 via `jsdom`): Vulnerable to HTTP response queue poisoning via keep-alive socket reuse. Fixed in >=7.28.0.
*   **Low** | `package.json` + `line 116` | **undici** (>=7.0.0 <7.28.0 via `jsdom`): Vulnerable to Set-Cookie SameSite attribute downgrade via permissive substring matching. Fixed in >=7.28.0.

---

## 4. Gitignore Deviations

The following temporary/generated files are present in the workspace root but are not ignored in `.gitignore`:

*   **Low** | `__delete_test__.txt` + `line 1` | Temporary test file that is currently tracked/present in git but should ideally be ignored or deleted.
