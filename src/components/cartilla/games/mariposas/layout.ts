// Layout of the Mariposas scene, in px of the owner-approved mockup (1484 x 1060).
// Sprites are cut from that mockup only (see public/cartilla/art/mariposas-scene).
export const SCENE_W = 1484;
export const SCENE_H = 1060;
export type Tone = "g" | "y" | "b" | "p";
export type Slot = {
  id: string;
  sprite: string;
  x: number;
  y: number;
  w: number;
  h: number;
  chip: { x: number; y: number; w: number; h: number };
  tone: Tone;
};
export const SLOTS: Slot[] = [
  {
    id: "ma",
    sprite: "b-ma.webp",
    x: 277,
    y: 75,
    w: 181,
    h: 168,
    chip: {
      x: 405,
      y: 137,
      w: 91,
      h: 63,
    },
    tone: "g",
  },
  {
    id: "mo",
    sprite: "b-mo.webp",
    x: 608,
    y: 37,
    w: 169,
    h: 172,
    chip: {
      x: 719,
      y: 126,
      w: 90,
      h: 60,
    },
    tone: "g",
  },
  {
    id: "mi",
    sprite: "b-mi.webp",
    x: 944,
    y: 83,
    w: 153,
    h: 162,
    chip: {
      x: 1046,
      y: 149,
      w: 92,
      h: 64,
    },
    tone: "y",
  },
  {
    id: "Mu",
    sprite: "b-Mu.webp",
    x: 457,
    y: 218,
    w: 136,
    h: 147,
    chip: {
      x: 556,
      y: 280,
      w: 92,
      h: 61,
    },
    tone: "b",
  },
  {
    id: "pa",
    sprite: "b-pa.webp",
    x: 689,
    y: 263,
    w: 150,
    h: 160,
    chip: {
      x: 800,
      y: 330,
      w: 88,
      h: 60,
    },
    tone: "y",
  },
  {
    id: "po",
    sprite: "b-po.webp",
    x: 964,
    y: 248,
    w: 125,
    h: 138,
    chip: {
      x: 1069,
      y: 306,
      w: 87,
      h: 62,
    },
    tone: "g",
  },
  {
    id: "me",
    sprite: "b-me.webp",
    x: 172,
    y: 341,
    w: 137,
    h: 149,
    chip: {
      x: 277,
      y: 415,
      w: 93,
      h: 60,
    },
    tone: "g",
  },
  {
    id: "Pe",
    sprite: "b-Pe.webp",
    x: 518,
    y: 397,
    w: 131,
    h: 141,
    chip: {
      x: 621,
      y: 458,
      w: 90,
      h: 62,
    },
    tone: "y",
  },
  {
    id: "pi",
    sprite: "b-pi.webp",
    x: 838,
    y: 434,
    w: 126,
    h: 137,
    chip: {
      x: 949,
      y: 485,
      w: 91,
      h: 60,
    },
    tone: "p",
  },
  {
    id: "Pu",
    sprite: "b-Pu.webp",
    x: 1213,
    y: 332,
    w: 174,
    h: 143,
    chip: {
      x: 1302,
      y: 425,
      w: 90,
      h: 58,
    },
    tone: "b",
  },
];
