# Palabras por minuto scene

Full-screen cork-board scene for the Palabras por minuto game. Layout and art follow the owner-approved mockup; all
pictures are crops of that mockup. Audio slots (voice) are empty, see `docs/audio-gaps/palabras-minuto.md`.

## Credits

- Background music loop `public/cartilla/games/palabras-minuto/music-happy-adventure.mp3`: "Happy Adventure (Loop)" by
  TinyWorlds, licensed CC0 (public domain dedication), from OpenGameArt:
  https://opengameart.org/content/happy-adventure-loop . The file here is a 30 second cut of the loop supplied by the owner.
  The mp3's embedded tags read "The Fish is Blue" / "Rick Hoppmann", the same tags as the original download on that page.
  The CC0 license is the one stated on the OpenGameArt page.
- Music plays at volume 0.12, loops, starts after the first tap, has an on/off button (bottom center) and stays silent
  when the app is muted (`cartilla:audio:muted`). The on/off choice is stored in `cartilla:ppm:music`.
