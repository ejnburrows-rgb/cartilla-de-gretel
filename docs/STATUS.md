# STATUS — La Cartilla de Gretel

Updated: 2026-09-19

- Production source of truth: `main`.
- Active Git history is intentionally lean and does not inherit obsolete scan/proof history.
- Active tree is below 25 MB.
- Only QA-PASS faithful crops are retained from `public/cartilla/art/faithful`.
- Failed crops, duplicate originals, recrop scratch, raw/restored scan masters, screenshots, generated proofs, archived source clutter, and stale agent instructions are excluded.
- Workbook PDF, workbook scan fallbacks, and teacher flipchart scan/delivery families remain available at runtime through the immutable Vercel asset snapshot in `vercel.json`.
- Build path: TypeScript check → unit tests → Vite build.
- Supabase remains the cloud data/auth backend.
- No paid AI API is required.
