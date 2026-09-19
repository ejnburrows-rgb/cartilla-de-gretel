// sticker-pack.ts — sticker rewards shown on the student profile.
// Different from badges — stickers are pure reward art (no criteria copy).
// Students earn them by completing pages; family + teacher routes can also
// grant them manually. Visual only.

export type StickerId =
  | "star-gold"
  | "star-silver"
  | "heart-red"
  | "heart-pink"
  | "smile"
  | "thumbs-up"
  | "sun"
  | "moon"
  | "flower"
  | "butterfly"
  | "rainbow"
  | "sparkle"
  | "trophy"
  | "medal"
  | "crown"
  | "book"
  | "rocket"
  | "balloon"
  | "music-note"
  | "high-five";

export type Sticker = {
  id: StickerId;
  emoji: string;
  labelEs: string;
  labelEn: string;
  rarity: "common" | "rare" | "epic";
};

export const STICKERS: Sticker[] = [
  {
    id: "star-gold",
    emoji: "\u2b50",
    labelEs: "Estrella dorada",
    labelEn: "Gold star",
    rarity: "rare",
  },
  {
    id: "star-silver",
    emoji: "\ud83c\udf1f",
    labelEs: "Estrella plateada",
    labelEn: "Silver star",
    rarity: "common",
  },
  {
    id: "heart-red",
    emoji: "\u2764\ufe0f",
    labelEs: "Coraz\u00f3n rojo",
    labelEn: "Red heart",
    rarity: "common",
  },
  {
    id: "heart-pink",
    emoji: "\ud83d\udc97",
    labelEs: "Coraz\u00f3n rosa",
    labelEn: "Pink heart",
    rarity: "common",
  },
  { id: "smile", emoji: "\ud83d\ude0a", labelEs: "Sonrisa", labelEn: "Smile", rarity: "common" },
  {
    id: "thumbs-up",
    emoji: "\ud83d\udc4d",
    labelEs: "Bien hecho",
    labelEn: "Well done",
    rarity: "common",
  },
  { id: "sun", emoji: "\u2600\ufe0f", labelEs: "Sol", labelEn: "Sun", rarity: "common" },
  { id: "moon", emoji: "\ud83c\udf19", labelEs: "Luna", labelEn: "Moon", rarity: "common" },
  { id: "flower", emoji: "\ud83c\udf38", labelEs: "Flor", labelEn: "Flower", rarity: "common" },
  {
    id: "butterfly",
    emoji: "\ud83e\udd8b",
    labelEs: "Mariposa",
    labelEn: "Butterfly",
    rarity: "rare",
  },
  {
    id: "rainbow",
    emoji: "\ud83c\udf08",
    labelEs: "Arco iris",
    labelEn: "Rainbow",
    rarity: "rare",
  },
  { id: "sparkle", emoji: "\u2728", labelEs: "Brillos", labelEn: "Sparkles", rarity: "common" },
  { id: "trophy", emoji: "\ud83c\udfc6", labelEs: "Trofeo", labelEn: "Trophy", rarity: "epic" },
  {
    id: "medal",
    emoji: "\ud83c\udf96\ufe0f",
    labelEs: "Medalla",
    labelEn: "Medal",
    rarity: "epic",
  },
  { id: "crown", emoji: "\ud83d\udc51", labelEs: "Corona", labelEn: "Crown", rarity: "epic" },
  { id: "book", emoji: "\ud83d\udcd6", labelEs: "Libro", labelEn: "Book", rarity: "common" },
  { id: "rocket", emoji: "\ud83d\ude80", labelEs: "Cohete", labelEn: "Rocket", rarity: "rare" },
  { id: "balloon", emoji: "\ud83c\udf88", labelEs: "Globo", labelEn: "Balloon", rarity: "common" },
  {
    id: "music-note",
    emoji: "\ud83c\udfb5",
    labelEs: "Nota musical",
    labelEn: "Music note",
    rarity: "common",
  },
  {
    id: "high-five",
    emoji: "\u270b",
    labelEs: "\u00a1Choca esos cinco!",
    labelEn: "High five",
    rarity: "common",
  },
];

export function stickerById(id: StickerId): Sticker | null {
  return STICKERS.find((s) => s.id === id) ?? null;
}

export function stickersByRarity(rarity: Sticker["rarity"]): Sticker[] {
  return STICKERS.filter((s) => s.rarity === rarity);
}
