# Gretel Tutor — Private Preview Access Guide

> **Branch:** `feat/gretel-tutor-l1-3` (Draft PR `#1073`)  
> **Production safety:** `vercel.json` intentionally sets `"git": { "deploymentEnabled": false }`. Do **not** deploy this branch to production or enable automatic Vercel Git deployments.

---

## 1. Recommended: Local Production-Build Preview (`localhost` / `127.0.0.1`)

Because the offline Service Worker (`/sw.js`), Vosk WASM on-device speech recognition, and browser microphone permissions (`getUserMedia`) require a **secure context** (`https://` or `http://localhost` / `http://127.0.0.1`), running the production build locally via Vite preview is the cleanest way for the owner to test every feature on this Mac.

```bash
cd /Users/ejn/Desktop/Gretel/gretel-tutor

# 1. Build the production bundle (never sets VITE_TUTOR_EARS=stub)
pnpm exec vite build

# 2. Serve the production bundle locally on loopback
pnpm exec vite preview --host 127.0.0.1 --port 4185 --strictPort
```

Open in your browser:

- **Tutor (Lesson 1 · Las vocales):** `http://127.0.0.1:4185/tutor/1` (or `http://localhost:4185/tutor/1`)
- **Tutor (Lesson 8 · Pp):** `http://127.0.0.1:4185/tutor/8`
- **Tutor Hub / All 24 Lessons:** `http://127.0.0.1:4185/tutor`
- **Teacher CRM & Structured Session Replay:** `http://127.0.0.1:4185/cartilla/teacher/crm/<classId>/<studentId>/sesiones`

> **Note:** Never pass `VITE_TUTOR_EARS=stub` when previewing for real microphone/Vosk testing; `StubEars` is strictly for automated Playwright E2E fixtures (`vite-tutor-pack.ts` also blocks building when `VITE_TUTOR_EARS=stub`).

---

## 2. Testing from Another Device on the Same Wi-Fi / LAN

You can bind `vite preview` to all local interfaces to open the app from a phone or tablet on the same local network:

```bash
cd /Users/ejn/Desktop/Gretel/gretel-tutor
pnpm exec vite build
pnpm exec vite preview --host 0.0.0.0 --port 4185 --strictPort
```

On this machine (`en0` local IP at check time: `192.168.1.242`), the LAN URL is:

- `http://192.168.1.242:4185/tutor/1`

### Important Browser Secure-Context Caveat for LAN HTTP

Plain `http://<LAN-IP>:4185` is **not** a browser secure context. On remote LAN HTTP:
- Visual layout, Flip Chart, Workbook, games, and audio playback work, **but**
- `navigator.mediaDevices.getUserMedia` (microphone) and `navigator.serviceWorker` (offline pack) are blocked by browsers on non-localhost HTTP.

To test **microphone + offline Service Worker** from another device safely without deploying to production, use one of:
1. **SSH tunnel from a laptop/desktop on the LAN** (maps remote `localhost:4185` to this Mac's loopback, preserving secure context):
   ```bash
   ssh -L 4185:127.0.0.1:4185 <user>@192.168.1.242
   ```
   Then open `http://localhost:4185/tutor/1` on the second computer.
2. **Private HTTPS tunnel** (e.g. Tailscale Serve `tailscale serve https / http://127.0.0.1:4185` or Cloudflare Quick Tunnel) if testing mic + SW from an iPad/iPhone.

---

## 3. Non-Production Vercel Preview CLI (Status & Guardrails)

- **Local CLI check:** `vercel` CLI is not installed or linked (`.vercel/` is absent) in this workspace.
- **Git-triggered deployments:** Intentionally disabled in `vercel.json` (`"git": { "deploymentEnabled": false }`) — do **not** modify `vercel.json`.
- If the owner later chooses to publish an unlisted non-production Vercel **Preview** (never `--prod`) from a machine with an authenticated Vercel account:
  ```bash
  # Preview deployment ONLY — NEVER pass --prod
  npx vercel deploy --prebuilt
  ```
  Wait until Vercel finishes and open the generated `*.vercel.app` **preview** URL (keep Deployment Protection enabled in Vercel so the preview remains private).

---

## 4. Safe Demo Data & Supabase Guardrails

- When testing Teacher CRM & Structured Replay locally without touching real student records in Supabase, export/import synthetic demo sessions or launch dev preview with dead Supabase pins:
  ```bash
  VITE_ALLOW_DEMO_MODE=true \
  VITE_SUPABASE_URL=http://127.0.0.1:54321 \
  VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_e2e_not_a_real_key \
  pnpm dev --port 5175 --host 127.0.0.1
  ```
- Student device audio recordings stay strictly local on the student's browser/device and are never automatically uploaded to the teacher's device.
