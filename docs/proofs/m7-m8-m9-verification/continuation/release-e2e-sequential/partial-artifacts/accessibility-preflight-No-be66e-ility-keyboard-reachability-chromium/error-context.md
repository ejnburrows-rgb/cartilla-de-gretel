# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility-preflight.spec.ts >> Non-Workbook Accessibility & Keyboard Preflight (#561 Excluded) >> 1. Welcome and primary entry actions accessibility & keyboard reachability
- Location: tests\e2e\accessibility-preflight.spec.ts:90:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1#lc-welcome-title')
Expected substring: "La Cartilla de Gretel"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" locator('h1#lc-welcome-title') with timeout 5000ms
  - waiting for locator('h1#lc-welcome-title')

```

```yaml
- link "Saltar al contenido principal":
  - /url: "#main-content"
- main:
  - heading "La Cartilla de Gretel" [level=1]
  - link "Soy maestro":
    - /url: /cartilla/teacher/crm
  - link "Abrir libro La Cartilla de Gretel":
    - /url: /cartilla/lecciones
  - navigation "Entrar":
    - paragraph: ¡Hola! Soy Gretel. Vamos a aprender a leer juntos.
    - link "Comenzar":
      - /url: /cartilla/lecciones
```

# Test source

```ts
  1   | import { test, expect, Page } from "@playwright/test";
  2   | import fs from "node:fs/promises";
  3   | import path from "node:path";
  4   | 
  5   | const PROOF_DIR = path.resolve("docs/proofs/accessibility-preflight");
  6   | 
  7   | async function ensureProofDir() {
  8   |   await fs.mkdir(PROOF_DIR, { recursive: true });
  9   | }
  10  | 
  11  | /**
  12  |  * Helper to verify that an element has a non-empty accessible name and proper semantic role.
  13  |  */
  14  | async function verifyElementAccessibility(
  15  |   page: Page,
  16  |   selector: string,
  17  |   expectedRole?: string,
  18  | ) {
  19  |   const locator = page.locator(selector).first();
  20  |   await expect(locator).toBeVisible();
  21  | 
  22  |   if (expectedRole) {
  23  |     const role = await locator.getAttribute("role");
  24  |     const tagName = await locator.evaluate((el) => el.tagName.toLowerCase());
  25  |     const valid =
  26  |       role === expectedRole ||
  27  |       (expectedRole === "button" && tagName === "button") ||
  28  |       (expectedRole === "link" && tagName === "a") ||
  29  |       (expectedRole === "navigation" && (tagName === "nav" || role === "navigation")) ||
  30  |       (expectedRole === "region" && tagName === "section") ||
  31  |       (expectedRole === "table" && tagName === "table");
  32  |     expect(valid).toBe(true);
  33  |   }
  34  | 
  35  |   // Check accessible name via Playwright evaluate
  36  |   const accName = await locator.evaluate((el) => {
  37  |     return (
  38  |       el.getAttribute("aria-label") ||
  39  |       el.getAttribute("aria-labelledby") ||
  40  |       el.textContent?.trim() ||
  41  |       (el as HTMLInputElement).placeholder ||
  42  |       ""
  43  |     );
  44  |   });
  45  |   expect(accName.length).toBeGreaterThan(0);
  46  | }
  47  | 
  48  | /**
  49  |  * Helper to check visible focus ring on a focused element.
  50  |  */
  51  | async function verifyVisibleFocus(page: Page, locator: ReturnType<Page["locator"]>) {
  52  |   // Drive focus with real Tab presses: programmatic focus() would bypass tab
  53  |   // order and could reach tabindex="-1" controls a keyboard user cannot.
  54  |   await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  55  |   let reached = false;
  56  |   for (let i = 0; i < 80 && !reached; i++) {
  57  |     await page.keyboard.press("Tab");
  58  |     reached = await locator.evaluate((el) => document.activeElement === el).catch(() => false);
  59  |   }
  60  |   expect(reached, "control must be reachable by sequential Tab navigation").toBe(true);
  61  |   await expect(locator).toBeFocused();
  62  | 
  63  |   const focusStyle = await locator.evaluate((el) => {
  64  |     const style = window.getComputedStyle(el);
  65  |     return {
  66  |       outlineStyle: style.outlineStyle,
  67  |       outlineWidth: style.outlineWidth,
  68  |       boxShadow: style.boxShadow,
  69  |     };
  70  |   });
  71  | 
  72  |   const hasVisibleOutline =
  73  |     focusStyle.outlineStyle !== "none" &&
  74  |     focusStyle.outlineStyle !== "" &&
  75  |     focusStyle.outlineWidth !== "0px";
  76  |   const hasVisibleBoxShadow =
  77  |     focusStyle.boxShadow !== "none" && focusStyle.boxShadow !== "";
  78  | 
  79  |   expect(hasVisibleOutline || hasVisibleBoxShadow).toBe(true);
  80  | }
  81  | 
  82  | test.describe("Non-Workbook Accessibility & Keyboard Preflight (#561 Excluded)", () => {
  83  |   test.beforeAll(async () => {
  84  |     await ensureProofDir();
  85  |   });
  86  | 
  87  |   // --------------------------------------------------------------------------
  88  |   // 1. Welcome and Primary Entry Actions
  89  |   // --------------------------------------------------------------------------
  90  |   test("1. Welcome and primary entry actions accessibility & keyboard reachability", async ({
  91  |     page,
  92  |   }) => {
  93  |     await page.goto("/");
  94  |     const splash = page.locator('[data-testid="welcome-splash"]');
  95  |     await expect(splash).toBeVisible();
  96  | 
  97  |     // Verify main title heading
  98  |     const heading = page.locator("h1#lc-welcome-title");
> 99  |     await expect(heading).toContainText("La Cartilla de Gretel");
      |                           ^ Error: expect(locator).toContainText(expected) failed
  100 | 
  101 |     // Verify primary buttons and semantics
  102 |     const comenzarBtn = page.locator('[data-testid="wc-entrar"]');
  103 |     const maestroBtn = page.locator('a:has-text("Soy maestro")');
  104 | 
  105 |     await verifyElementAccessibility(page, '[data-testid="wc-entrar"]', "link");
  106 |     await verifyElementAccessibility(page, 'a:has-text("Soy maestro")', "link");
  107 | 
  108 |     // Keyboard Tab focus reachability & visible focus
  109 |     await verifyVisibleFocus(page, comenzarBtn);
  110 |     await verifyVisibleFocus(page, maestroBtn);
  111 | 
  112 |     // Screenshot proof
  113 |     await page.screenshot({
  114 |       path: path.join(PROOF_DIR, "01-welcome-primary-entry.png"),
  115 |       fullPage: true,
  116 |     });
  117 | 
  118 |     // Test secondary entry points: /entrar
  119 |     await page.goto("/entrar");
  120 |     await expect(page.locator("body")).toBeVisible();
  121 |     await page.screenshot({
  122 |       path: path.join(PROOF_DIR, "01b-entry-entrar.png"),
  123 |       fullPage: true,
  124 |     });
  125 |   });
  126 | 
  127 |   // --------------------------------------------------------------------------
  128 |   // 2. Teacher Shell and Navigation
  129 |   // --------------------------------------------------------------------------
  130 |   test("2. Teacher shell/navigation keyboard reachability, focus rings, and ARIA roles", async ({
  131 |     page,
  132 |   }) => {
  133 |     await page.goto("/cartilla/teacher/crm");
  134 |     await expect(page.locator(".crm-app")).toBeVisible();
  135 | 
  136 |     // Verify Sidebar navigation landmark & links
  137 |     const sidebar = page.locator("aside.crm-sidebar");
  138 |     await expect(sidebar).toBeVisible();
  139 | 
  140 |     const navLinks = [
  141 |       { text: "Tablero", href: "/cartilla/teacher/crm" },
  142 |       { text: "Alumnos", href: "/cartilla/teacher/roster" },
  143 |       { text: "Progreso", href: "/cartilla/teacher/progreso" },
  144 |       { text: "Lecciones", href: "/cartilla/teacher/lecciones" },
  145 |       { text: "Reportes", href: "/cartilla/teacher/reportes" },
  146 |       { text: "Arte", href: "/cartilla/teacher/crm/artwork" },
  147 |       { text: "Ayuda", href: "/cartilla/teacher/ayuda" },
  148 |     ];
  149 | 
  150 |     for (const link of navLinks) {
  151 |       const linkLoc = page.locator(`aside.crm-sidebar a:has-text("${link.text}")`).first();
  152 |       await expect(linkLoc).toBeVisible();
  153 |       await verifyVisibleFocus(page, linkLoc);
  154 |     }
  155 | 
  156 |     // Topbar controls
  157 |     const topbarBell = page.locator('a[aria-label="Ver progreso de la clase"]');
  158 |     await expect(topbarBell).toBeVisible();
  159 |     await verifyVisibleFocus(page, topbarBell);
  160 | 
  161 |     // Class selector focus
  162 |     const classSelect = page.locator("select").first();
  163 |     if (await classSelect.isVisible()) {
  164 |       await verifyVisibleFocus(page, classSelect);
  165 |     }
  166 | 
  167 |     // Screenshot proof
  168 |     await page.screenshot({
  169 |       path: path.join(PROOF_DIR, "02-teacher-shell-navigation.png"),
  170 |       fullPage: true,
  171 |     });
  172 |   });
  173 | 
  174 |   // --------------------------------------------------------------------------
  175 |   // 3. Guide Tabs and Sections
  176 |   // --------------------------------------------------------------------------
  177 |   test("3. Teacher guide tabs/sections keyboard reachability and visible focus", async ({
  178 |     page,
  179 |   }) => {
  180 |     await page.goto("/cartilla/teacher/guia");
  181 |     await expect(page.locator("h1.teacher-chrome__title")).toContainText("Guía del profesor");
  182 | 
  183 |     // Click into folder to access lesson guide view
  184 |     const folderBtn = page.locator("button", { hasText: "Guía del profesor" }).first();
  185 |     await expect(folderBtn).toBeVisible();
  186 |     await verifyVisibleFocus(page, folderBtn);
  187 |     await folderBtn.click();
  188 | 
  189 |     const scriptLink = page.locator("text=Ver guion completo de la lección").first();
  190 |     await expect(scriptLink).toBeVisible();
  191 |     await verifyVisibleFocus(page, scriptLink);
  192 | 
  193 |     // Go to lesson 1 guide
  194 |     await page.goto("/cartilla/teacher/guia/1");
  195 |     await expect(page).toHaveURL(/\/cartilla\/teacher\/guia\/1$/);
  196 | 
  197 |     // Check desktop tab buttons
  198 |     const tabs = ["Objetivos", "Procedimiento", "Vocabulario y Poema", "Evaluación"];
  199 |     for (const tabName of tabs) {
```