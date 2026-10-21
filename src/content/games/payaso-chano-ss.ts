// payaso-chano-ss.ts — Juego Payaso Chano (s/m/p word-building), verbatim from source.
// audioUrl/imageUrl are empty slots: wordAudio.ts no-ops safely until real assets land.
import type { GameContent } from "@/lib/games/gameContent";

export const PAYASO_CHANO_SS: GameContent = {
  id: "payaso-chano-ss",
  type: "payaso-chano",
  letter: "s/m/p",
  instructions: [
    "Presiona el símbolo de audio para escuchar la palabra.",
    "Arrastra la sílaba que necesitas para comenzar a formar la palabra.",
    "Colócala en la pizarra de Chano el payaso maestro.",
    "Arrastra y coloca las sílabas que necesitas para completar la palabra.",
    "Presiona la sombrilla para comprobar la palabra.",
    "Presiona el resorte para colocar las sílabas en su lugar otra vez.",
    "Presiona a Chano el payaso maestro para escuchar la próxima palabra.",
  ],
  words: [
    { word: "paso", syllables: ["pa", "so"], audioUrl: "/audio/voz/p/paso.mp3" },
    { word: "mesa", syllables: ["me", "sa"], audioUrl: "/audio/voz/m/mesa.mp3" },
    { word: "supo", syllables: ["su", "po"], audioUrl: "/audio/voz/s/supo.mp3" },
    { word: "asoma", syllables: ["a", "so", "ma"], audioUrl: "/audio/voz/a/asoma.mp3" },
    { word: "sopa", syllables: ["so", "pa"], audioUrl: "" },
    { word: "suma", syllables: ["su", "ma"], audioUrl: "/audio/voz/s/suma.mp3" },
    { word: "sapo", syllables: ["sa", "po"], audioUrl: "/audio/voz/s/sapo.mp3" },
    { word: "puso", syllables: ["pu", "so"], audioUrl: "/audio/voz/p/puso.mp3" },
  ],
  tiles: ["a", "ma", "me", "pa", "po", "pu", "sa", "so", "su"],
  assets: {
    board: "/cartilla/art/payaso-chano/pizarra.svg",
    props: {
      chano: "/cartilla/art/payaso-chano/chano.svg",
      sombrilla: "/cartilla/art/payaso-chano/sombrilla.svg",
      resorte: "/cartilla/art/payaso-chano/resorte.svg",
    },
  },
};
