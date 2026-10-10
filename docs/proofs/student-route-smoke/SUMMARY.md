# Student Route Smoke Test Proof Summary

## Overview
This document records proof for the student route smoke suite outside the `#561` cuaderno/viewer ownership.

## Verified Scenarios
- **Student Entry (`/cartilla`)**: Loads splash screen, Gretel identity artwork, and primary navigation buttons cleanly without console exceptions.
- **Lesson List (`/cartilla/lecciones`)**: Displays total lesson progress, lesson grid catalog (24 lessons), and active/completed states.
- **Legacy Login Redirect (`/cartilla/student-login`)**: Redirects through join flow and lands safely on `/cartilla/lecciones`.
- **Progress Page (`/cartilla/mi-progreso`)**: Displays progress summary, chart, badges, local/session progress, and export links without blank screens or stuck spinners.
- **Navigation & Back Paths**: Navigation links (`Cartilla`, `Lecciones`) and browser history `goBack()` transition routes smoothly.
- **Reload Resilience**: Page reloads preserve route rendering and application state without unhandled exceptions.
- **404 / Broken Link Handling**: Navigating to an invalid route (`/cartilla/esta-ruta-no-existe`) renders the 404 boundary gracefully and allows clean back-navigation.
- **Console & Network Error Tracking**: Zero unhandled console errors or unexpected network failures across test runs.

## Viewports Tested & Visual Proofs
Tests were run and verified across three device viewports:

1. **Phone (375 x 667)**
   - Entry: `docs/proofs/student-route-smoke/phone-entry.png`
   - Lecciones: `docs/proofs/student-route-smoke/phone-lecciones.png`
   - Progreso: `docs/proofs/student-route-smoke/phone-progreso.png`

2. **Tablet (768 x 1024)**
   - Entry: `docs/proofs/student-route-smoke/tablet-entry.png`
   - Lecciones: `docs/proofs/student-route-smoke/tablet-lecciones.png`
   - Progreso: `docs/proofs/student-route-smoke/tablet-progreso.png`

3. **Laptop (1280 x 720)**
   - Entry: `docs/proofs/student-route-smoke/laptop-entry.png`
   - Lecciones: `docs/proofs/student-route-smoke/laptop-lecciones.png`
   - Progreso: `docs/proofs/student-route-smoke/laptop-progreso.png`

## Test Results
- `pnpm vitest run src/routes/__tests__/student-routing.test.tsx` -> **10 passed**
- `pnpm exec playwright test tests/e2e/student-route-smoke.spec.ts` -> **3 passed (Phone, Tablet, Laptop)**
- `pnpm typecheck` -> **0 errors**
