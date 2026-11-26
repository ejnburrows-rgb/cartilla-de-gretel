# Gretel Tutor — Private Preview Access Audit & Real-Device Checklist

> **Branch:** `feat/gretel-tutor-l1-3` (Draft PR `#1073`)  
> **Production safety:** `vercel.json` intentionally sets `"git": { "deploymentEnabled": false }`. Do **not** deploy this branch to production or enable automatic Vercel Git deployments.

---

## 1. Honest Private HTTPS Preview Audit (PR #1073)

**Current status: No authorized private HTTPS preview URL exists yet for PR `#1073`.**

Exact access blockers verified on this machine (without purchasing or installing paid services):

1. **Git-triggered Vercel previews are intentionally disabled:** `vercel.json` has `"git": { "deploymentEnabled": false }`. We must not modify `vercel.json`.
2. **No authenticated Vercel CLI on this machine:** `vercel` is not installed (`which vercel` → not found) and `.vercel/` is absent in this workspace.
3. **No HTTPS tunnel binary installed on this machine:** `cloudflared`, `ngrok`, `tailscale`, and `localtunnel` (`lt`) are all absent (`which ...` → not found).
4. **No GitHub CLI on this machine:** `gh` is not installed (`which gh` → not found), so no external PR preview deployment URL is attached or provisioned from this host.

**Conclusion:** Until the owner authorizes either an authenticated non-production Vercel Preview CLI deployment (`vercel deploy` without `--prod` + Vercel Deployment Protection) or installs a private HTTPS tunnel (`tailscale serve` / `cloudflared`), real-device testing over HTTPS from iPhone/iPad/Android is blocked from this machine; full secure-context testing (`localhost` / `127.0.0.1`) is available immediately on this Mac.

---

## 2. Recommended Today: Local Production-Build Preview (`localhost` / `127.0.0.1`)

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
- **Tutor (All 24 Lessons):** `http://127.0.0.1:4185/tutor/1` through `http://127.0.0.1:4185/tutor/24`
- **Web-Accessible Avatar Approval Preview (real approved audio + live Rhubarb viseme sync):** `http://127.0.0.1:4185/tutor-avatar-preview.html`
- **Teacher CRM & Structured Session Replay:** `http://127.0.0.1:4185/cartilla/teacher/crm/<classId>/<studentId>/sesiones`

> **Honesty note on speech recognition:** Automated Playwright suites (`chromium-tutor`) run with `VITE_TUTOR_EARS=stub` (`StubEars` scripted fixtures) and **do not** measure real on-device Vosk Spanish recognition accuracy. Never pass `VITE_TUTOR_EARS=stub` when previewing for real microphone/Vosk testing (`vite-tutor-pack.ts` also blocks building when `VITE_TUTOR_EARS=stub`).

---

## 3. Testing from Another Device on the Same Wi-Fi / LAN

You can bind `vite preview` to all local interfaces to inspect layout and audio from a phone or tablet on the same local network:

```bash
cd /Users/ejn/Desktop/Gretel/gretel-tutor
pnpm exec vite build
pnpm exec vite preview --host 0.0.0.0 --port 4185 --strictPort
```

### Browser Secure-Context Caveat for LAN HTTP

Plain `http://<LAN-IP>:4185` is **not** a browser secure context. On remote LAN HTTP:
- Visual layout, `/tutor-avatar-preview.html`, Flip Chart, Workbook, games, and audio playback work, **but**
- `navigator.mediaDevices.getUserMedia` (microphone) and `navigator.serviceWorker` (offline pack) are blocked by browsers on non-localhost HTTP.

To test **microphone + offline Service Worker** from another device safely without deploying to production:
1. **SSH tunnel from a laptop/desktop on the LAN** (maps remote `localhost:4185` to this Mac's loopback, preserving secure context):
   ```bash
   ssh -L 4185:127.0.0.1:4185 <user>@<mac-lan-ip>
   ```
   Then open `http://localhost:4185/tutor/1` on the second computer.
2. **Owner-authorized private HTTPS preview** (once available):
   - Private HTTPS tunnel (e.g. `tailscale serve https / http://127.0.0.1:4185` or Cloudflare Tunnel), **or**
   - Unlisted non-production Vercel **Preview** (NEVER `--prod`) with Vercel Deployment Protection enabled from an authenticated machine:
     ```bash
     # Preview deployment ONLY — NEVER pass --prod
     npx vercel deploy --prebuilt
     ```

---

## 4. Real-Device Verification Checklist (Required Once Private HTTPS Preview Is Available)

Run each check on physical hardware against a real production build (NO `VITE_TUTOR_EARS=stub`):

- [ ] **iPhone (Safari / iOS)**
  - Open `/tutor/1`, `/tutor/8`, `/tutor/24`, and `/tutor-avatar-preview.html`.
  - Verify zero horizontal overflow in portrait (`390×844` class) and landscape, readable Flip Chart & Workbook handoff, and smooth Call → Split → Flip Chart PiP → Practice transitions without avatar flicker/remount.
  - Tap play on `abeja`, `abanico`, `oso` in `/tutor-avatar-preview.html` and confirm real audio playback + live mouth-shape sync.
- [ ] **iPad (Safari / iPadOS)**
  - Verify split-screen layout (Flip Chart + persistent Gretel avatar), touch targets for children, and Workbook/game handoff in both landscape and portrait.
- [ ] **Android (Chrome)**
  - Verify `/tutor/1`–`/tutor/24`, audio playback, microphone capture, and persistent avatar across all layout modes.
- [ ] **Airplane-Mode Cold Restart (Offline Pack / Service Worker)**
  - Download/warm the offline pack while online, confirm completion marker, enable **Airplane Mode**, fully close and reopen the browser, and load `/tutor/1` cleanly with audio and Flip Chart assets intact and zero external network calls.
- [ ] **Microphone Denial (`NotAllowedError`)**
  - Explicitly deny microphone permission in the browser prompt; confirm the app renders an honest Spanish explanation without crashing, does not loop permission prompts, and allows the learner to complete items via typed answer in the Transcript drawer (`gumCallCount === 0` after denial).
- [ ] **Background Interruption**
  - Mid-lesson, lock the screen, switch to another app for 30 seconds, or trigger an incoming call/notification; return to the browser and verify audio/mic recover cleanly without stuck `"Pensando…"` status or lost progress.
- [ ] **Real Offline On-Device Speech Recognition (Vosk WASM)**
  - With Airplane Mode ON (or network disconnected), speak Spanish vowels, syllables, and words (`a`, `abeja`, `pa`, `papá`) into the real device microphone; verify Vosk WASM recognizes child/adult Spanish speech locally with zero cloud STT requests and records honest progress events.

---

## 5. Safe Demo Data & Supabase Guardrails

- When testing Teacher CRM & Structured Replay locally without touching real student records in Supabase, use dead Supabase pins:
  ```bash
  VITE_ALLOW_DEMO_MODE=true \
  VITE_SUPABASE_URL=http://127.0.0.1:54321 \
  VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_e2e_not_a_real_key \
  pnpm dev --port 5175 --host 127.0.0.1
  ```
- Student device audio recordings stay strictly local on the student's browser/device and are never automatically uploaded to the teacher's device.
