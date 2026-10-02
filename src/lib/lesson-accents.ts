/** Book-derived lesson color groups for the demo UI. */
export const LESSON_ACCENTS: readonly string[] = [
  "#bf3040", // 1 intro
  "#bf3040", // 2 O
  "#bf3040", // 3 A
  "#bf3040", // 4 E
  "#bf3040", // 5 I
  "#bf3040", // 6 U
  "#c24d75", // 7 M
  "#c24d75", // 8 P
  "#c24d75", // 9 S
  "#c24d75", // 10 T
  "#7756a8", // 11 D
  "#7756a8", // 12 L
  "#7756a8", // 13 N
  "#7756a8", // 14 Ñ
  "#356fbd", // 15 B
  "#356fbd", // 16 V
  "#607d96", // 17 R
  "#607d96", // 18 RR
  "#1f9e94", // 19 G
  "#1f9e94", // 20 F
  "#536f8a", // 21 J
  "#c24d75", // 22 C
  "#1f9e94", // 23 Y
  "#1f9e94", // 24 Z
];

export function getLessonAccent(n: number): string {
  return LESSON_ACCENTS[n - 1] ?? "#1f9e94";
}
