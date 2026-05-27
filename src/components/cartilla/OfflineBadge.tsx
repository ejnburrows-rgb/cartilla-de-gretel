import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

// Hoisted Styles for double-brace JSX styling ban compliance
const badgeStyle: React.CSSProperties = {
  position: "fixed",
  top: "1rem",
  right: "1rem",
  zIndex: 9999,
  backgroundColor: "#fef2f2",
  border: "1.5px solid #fecaca",
  borderRadius: "9999px",
  padding: "0.4rem 0.85rem",
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  pointerEvents: "none",
};

const textStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: "bold",
  color: "#b91c1c",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

export function OfflineBadge() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div style={badgeStyle} className="animate-pulse no-print" role="alert" aria-live="assertive">
      <WifiOff className="w-3.5 h-3.5 text-red-600" />
      <span style={textStyle}>Sin conexión</span>
    </div>
  );
}
