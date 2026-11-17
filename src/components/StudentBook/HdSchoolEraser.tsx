/**
 * High-definition uncropped full-body classic chunky beveled pink school eraser.
 * Active rubbing corner sits at exact (0, 0) so motion paths and cursor
 * hotspots align 1:1 with no opacity-mask crop or edge clipping.
 */
export function HdSchoolEraserShape({
  uid,
  className = "workbook-pencil__eraser-hd",
}: {
  uid: string;
  className?: string;
}) {
  const g = (name: string) => `${uid}-${name}`;
  return (
    <g className={className}>
      <defs>
        <linearGradient id={g("top")} x1="0" y1="0" x2="144" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffdce4" />
          <stop offset="0.35" stopColor="#faabc0" />
          <stop offset="0.78" stopColor="#ef8ba4" />
          <stop offset="1" stopColor="#df708c" />
        </linearGradient>
        <linearGradient id={g("front")} x1="0" y1="12" x2="98" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ee88a2" />
          <stop offset="0.55" stopColor="#d76683" />
          <stop offset="1" stopColor="#b94a66" />
        </linearGradient>
        <linearGradient id={g("end")} x1="86" y1="56" x2="156" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c95774" />
          <stop offset="1" stopColor="#9c3852" />
        </linearGradient>
      </defs>
      {/* Soft paper contact shadow */}
      <path
        d="M 2 5 Q 6 24 14 33 L 97 89 Q 101 92 106 92 L 154 95 Q 160 93 157 87 L 145 64 L 88 57 Z"
        fill="#3b2a14"
        opacity="0.14"
      />
      {/* Front-left / bottom bevel face */}
      <path
        d="M 0.5 1.5 Q -0.2 5 2.5 12 L 10.5 27.5 Q 12.5 31.5 16.5 34 L 93.5 84.5 Q 98.5 88 101 84.5 L 87 56.5 L 3.5 2.5 Q 1.5 1 0.5 1.5 Z"
        fill={`url(#${g("front")})`}
        stroke="#9d3c56"
        strokeWidth="0.95"
        strokeLinejoin="round"
      />
      {/* Right-end bevel face */}
      <path
        d="M 86 56 L 98 85 Q 100 88.5 104.5 89 L 151 92.5 Q 157 93 155 87 L 145 63.5 Q 143.5 60 139 59.5 L 89.5 55.5 Z"
        fill={`url(#${g("end")})`}
        stroke="#8b3149"
        strokeWidth="0.95"
        strokeLinejoin="round"
      />
      {/* Top beveled pink rubber face */}
      <path
        d="M 1 0.8 Q 4 0 9 0.5 L 55 5.3 Q 60 5.8 64.5 8.8 L 142 59.5 Q 146 62 141.5 62.5 L 91 57.5 Q 86.5 57 82 54 L 4.5 3.2 Q 0.4 1 1 0.8 Z"
        fill={`url(#${g("top")})`}
        stroke="#b7506b"
        strokeWidth="0.95"
        strokeLinejoin="round"
      />
      {/* Crisp bevel highlight ridges */}
      <path
        d="M 3.5 2 L 85.5 55"
        fill="none"
        stroke="#fff5f8"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.76"
      />
      <path
        d="M 5 1.2 L 56 6.2"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.15"
        strokeLinecap="round"
        opacity="0.62"
      />
      {/* Subtle embossed classic school-eraser center lines */}
      <path
        d="M 42 16.5 L 96 51.5"
        fill="none"
        stroke="#cf5f7b"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.28"
      />
      <path
        d="M 43 15.7 L 97 50.7"
        fill="none"
        stroke="#ffeaf0"
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M 55 12.5 L 109 47.5"
        fill="none"
        stroke="#cf5f7b"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.22"
      />
      {/* Matte rubber micro-speckles */}
      <g fill="#a9445f" opacity="0.22">
        <circle cx="24" cy="8.5" r="0.75" />
        <circle cx="42" cy="12" r="0.6" />
        <circle cx="66" cy="23" r="0.8" />
        <circle cx="79" cy="34" r="0.65" />
        <circle cx="94" cy="40" r="0.7" />
        <circle cx="118" cy="52" r="0.75" />
        <circle cx="52" cy="26" r="0.6" />
        <circle cx="104" cy="49" r="0.65" />
        <circle cx="30" cy="31" r="0.65" />
        <circle cx="62" cy="52" r="0.7" />
        <circle cx="82" cy="65" r="0.6" />
      </g>
    </g>
  );
}
