// Mapping of interactive hotspots for specific physical book pages.
// x, y, w, h are percentages (0-100) relative to the page dimensions.

export type Hotspot = {
  word: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export const PAGE_HOTSPOTS: Record<number, Hotspot[]> = {
  // Page 19 (Printed page 13, Lección 5 - Vocal I grid)
  19: [
    { word: "iglú", x: 12, y: 29, w: 16, h: 10 },
    { word: "avión", x: 29, y: 29, w: 16, h: 10 },
    { word: "iguana", x: 46, y: 29, w: 16, h: 10 },
    { word: "abanico", x: 63, y: 29, w: 16, h: 10 },

    { word: "oso", x: 12, y: 40, w: 16, h: 10 },
    { word: "indio", x: 29, y: 40, w: 16, h: 10 },
    { word: "alas", x: 46, y: 40, w: 16, h: 10 },
    { word: "invierno", x: 63, y: 40, w: 16, h: 10 },

    { word: "olas", x: 12, y: 52, w: 16, h: 10 },
    { word: "imán", x: 29, y: 52, w: 16, h: 10 },
    { word: "uno", x: 46, y: 52, w: 16, h: 10 },
    { word: "isla", x: 63, y: 52, w: 16, h: 10 },

    { word: "uña", x: 12, y: 64, w: 16, h: 10 },
    { word: "igual", x: 29, y: 64, w: 16, h: 10 },
    { word: "insecto", x: 46, y: 64, w: 16, h: 10 },
    { word: "olla", x: 63, y: 64, w: 16, h: 10 },
  ],
};
