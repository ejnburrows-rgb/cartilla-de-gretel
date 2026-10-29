# Butterfly Garden (mariposas-p)

`/cartilla/juego/mariposas-p` renders `ButterflyGarden` (src/components/cartilla/games/ButterflyGarden.tsx) using the owner-approved garden artwork. Other `type: "mariposas"` content still uses `CoreGame`; `MariposasGame` code is unchanged.

- Rules (pure, tested): src/lib/games/butterflyGarden.ts, tests in src/lib/games/__tests__/butterflyGarden.test.ts. Words from the art's sign: mapa, pomo, Mupi, Pepe, puma, Pupi; 3 slots; syllables checked in order, ignoring case (same as MariposasGame).
- Art: src/assets/games/butterfly-garden/ — clean background, 10 butterflies with and without syllable cards, flower heads, grass, sign, sun, watering can, all cut from the approved illustration (ASSET_FIDELITY_POLICY: cleanup/transparency/motion only).
- Styles: namespaced `bfg-*` block at the end of src/styles.css.
- Audio: deferred by the owner. Hooks in src/lib/games/butterflyGardenAudio.ts are intentionally empty; fill only with owner-approved recordings (no TTS, never the rejected 67-clip set).
