import React from "react";

interface KioskoBigButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  sublabel?: string;
  color?: string;
  icon?: React.ReactNode;
}

// Hoisted Styles for double-brace JSX styling ban compliance
const baseBtnStyle = (color: string): React.CSSProperties => ({
  minHeight: "90px",
  borderRadius: "1.25rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  border: `3px solid ${color}35`,
  backgroundColor: "rgba(255, 255, 255, 0.04)",
  color: "#fff8de",
  textAlign: "center",
  padding: "0.75rem",
  width: "100%",
  boxSizing: "border-box",
});

const labelStyle: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: "800",
  margin: 0,
};

const sublabelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "rgba(255, 248, 222, 0.6)",
  marginTop: "0.2rem",
};

const iconWrapperStyle: React.CSSProperties = {
  marginBottom: "0.3rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export function KioskoBigButton({
  label,
  sublabel,
  color = "#78350f",
  icon,
  style,
  ...props
}: KioskoBigButtonProps) {
  const dynamicStyle = {
    ...baseBtnStyle(color),
    ...style,
  };

  return (
    <button
      style={dynamicStyle}
      className="kiosko-big-button hover:bg-white/10 hover:border-white/20 active:scale-95"
      {...props}
    >
      {icon && <div style={iconWrapperStyle}>{icon}</div>}
      <span style={labelStyle}>{label}</span>
      {sublabel && <span style={sublabelStyle}>{sublabel}</span>}
    </button>
  );
}
