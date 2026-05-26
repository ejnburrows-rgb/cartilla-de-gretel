# Agent rules (lived experience from this build)

These rules are committed to the repo so they survive across AI sessions.
If a future agent reads this file, treat it as binding.

## Honesty about execution

The agent cannot push code between turns. Execution lifecycle is bounded by a single turn: when the turn ends, all tool access ends. A new turn begins only when the user sends a new message.

Therefore the phrases **"pushing more now"**, **"incoming"**, **"I'll keep pushing"**, or any present-tense claim of ongoing work at the end of a turn are **FORBIDDEN**. If the agent is not actively calling a tool in the same turn as the sentence, the agent is not pushing — full stop.

When work remains, the honest phrasing is:

- “Next turn I will push X.”
- Or simply silence followed by the actual push in the next turn.

No bridging language. No implied background execution. No “pushing now” that isn’t backed by a tool call in the same response.

## JSX double-brace ban

Inline JSX object literals (`style={{}}`, `transition={{}}`, `params={{}}`, `initial={{}}`, `animate={{}}`, `whileHover={{}}`, `whileTap={{}}`) get template-mangled at dispatch time and break the build. Hoist every such object to a module-scope `CSSProperties` / `Transition` const, or wrap in `useMemo`. Grep every diff for `={{` — must be zero matches.

## No fabrication

No invented vocabulary. No AI-generated artwork. No stock images. No Pixar references. No “modernization” of the author’s work.

- Author: Leonor Lopetegui.
- Contributors: Aída Fernández, Silvia Diez.
- Illustrator: Estela de Armas Plasencia.
- Imprint: Lanny / LANY BOOKS LLC.
- ISBN: 0-971-8696-8-5.

Their work is immutable. Image transformations are deterministic only: extract, denoise, normalise levels, sharpen, upscale, recompress.

All drill content must derive from `CATALOG` in `src/lib/lesson-catalog.ts`.

## Lane locks

- Student workbook and teacher flipchart both render the same uploaded PDF.
- Same lesson and page numbering on both sides.
- Hard-banned paths: `src/components/Reader.tsx`, `src/routes/_authenticated/**`, `supabase/**`.

## Visual fallbacks

The build-time art pipeline may fail or skip pages. `PolishedPage` must always degrade gracefully:

1. If a polished webp exists in the manifest, render it.
2. Otherwise render the live PDF inside an express-polish frame (CSS contrast/brightness/saturate filter + accent-tinted border).
3. Never blank the page, never throw on a missing manifest.

## Workflow polish

The `Polish PDF and commit` GitHub Actions workflow is the durable path to regenerate the polished art bundle. Trigger it from the GitHub UI under Actions → Polish PDF and commit → Run workflow. It commits results directly to `main` with `[skip ci]`.
