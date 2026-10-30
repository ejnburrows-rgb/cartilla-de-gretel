# Proof of Work: Vowels Curriculum Rollout (Track A)

Date: 2026-10-29
Branch: swarm/wb-vowels-curriculum

## 1. Summary of Completed Deliverables
- **Writing Lines**: Uppercase O (Lesson 2, p6), U (Lesson 6, p18), E (Lesson 4, p12), and I (Lesson 5, p15) render interactive guided trace with tap/drag checkpoints. Lowercase o, u, e, i render interactive freehand drawing canvases responding to stylus/mouse input. Blank repeat writing lines inherit the model text from preceding lines.
- **Vowel Line Matching**: Direct pencil connection with center buttons (Oo, Ee, Ii, Uu) and neutral retry styling (`.is-retry`) on mismatched pairs. Correct pairs connect and persist (`.is-connected`). Approved wooden pencil & pink eraser only; zero rope/lasso elements.
- **Learner Session Isolation**: Fully validated Student A -> Student B -> Student A isolation across line matches, letter traces, and freehand canvases. Zero state leakage between learners; full restoration on return.
- **Strict Invariants**:
  - Zero artwork mutations (no `pnpm prepare:art`, no crop modifications).
  - Master audio locked (`Gretel_558674_Original.m4a`).
  - Pages 86–87 strictly SOURCE_BLOCKED.

## 2. Evidence Artifacts
- **Videos**:
  - [375px Playthrough](docs/proofs/vowels-curriculum/375-vowels-curriculum.webm)
  - [768px Playthrough](docs/proofs/vowels-curriculum/768-vowels-curriculum.webm)
  - [1280px Playthrough](docs/proofs/vowels-curriculum/1280-vowels-curriculum.webm)
- **Screenshots (375px, 768px, 1280px)**:
  - Vowel Line Match Connected: `375-vowel-line-match-connected.png`, `768-vowel-line-match-connected.png`, `1280-vowel-line-match-connected.png`
  - Writing Lines Completed: `375-writing-lines-completed.png`, `768-writing-lines-completed.png`, `1280-writing-lines-completed.png`
  - Session Isolation (Student B Empty): `375-isolation-learner-b-empty.png`, `768-isolation-learner-b-empty.png`, `1280-isolation-learner-b-empty.png`
  - Session Isolation (Student A Restored): `375-isolation-learner-a-restored.png`, `768-isolation-learner-a-restored.png`, `1280-isolation-learner-a-restored.png`
  - Vocal E Rollout: `375-vocal-e-rollout.png`, `768-vocal-e-rollout.png`, `1280-vocal-e-rollout.png`
  - Vocal I Rollout: `375-vocal-i-rollout.png`, `768-vocal-i-rollout.png`, `1280-vocal-i-rollout.png`
  - Vocal U Rollout: `375-vocal-u-rollout.png`, `768-vocal-u-rollout.png`, `1280-vocal-u-rollout.png`
  - Vowels Intro Rollout: `375-vowels-intro-rollout.png`, `768-vowels-intro-rollout.png`, `1280-vowels-intro-rollout.png`
