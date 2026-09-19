import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// Hoisted Styles for double-brace JSX styling ban compliance
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)", // Backdrop dim
  zIndex: 100,
};

const sheetStyle: React.CSSProperties = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  top: 0,
  backgroundColor: "#ffffff",
  borderTopLeftRadius: "1.5rem",
  borderTopRightRadius: "1.5rem",
  padding: "1rem",
  paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))",
  boxShadow: "0 -10px 25px -5px rgba(0, 0, 0, 0.15)",
  zIndex: 101,
  touchAction: "none",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const handleContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  paddingTop: "0.25rem",
  paddingBottom: "0.85rem",
  cursor: "grab",
  width: "100%",
  flexShrink: 0,
};

const handleStyle: React.CSSProperties = {
  width: "3.5rem",
  height: "0.35rem",
  backgroundColor: "#e2e8f0",
  borderRadius: "9999px",
};

const sheetContentStyle: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
};

// 3-detent snapped variants based on viewport percentage offsets
const detentVariants = {
  closed: { y: "100%" },
  peek: { y: "70%" },
  half: { y: "40%" },
  full: { y: "5%" },
};

export function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  const [detent, setDetent] = useState<"peek" | "half" | "full">("half");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setDetent("half"); // Reset to middle detent when opened
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const currentY = info.point.y;
    const viewportHeight = window.innerHeight;
    const relativeY = currentY / viewportHeight; // Value between 0.0 and 1.0

    // Targets map to relative positions on A4 canvas
    const targets: Array<{ name: "closed" | "peek" | "half" | "full"; val: number }> = [
      { name: "full", val: 0.05 },
      { name: "half", val: 0.4 },
      { name: "peek", val: 0.7 },
      { name: "closed", val: 0.95 },
    ];

    // Snaps to the closest target
    const closest = targets.reduce((prev, curr) => {
      return Math.abs(curr.val - relativeY) < Math.abs(prev.val - relativeY) ? curr : prev;
    });

    if (closest.name === "closed" || info.velocity.y > 600) {
      onClose();
    } else {
      setDetent(closest.name);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop dimming overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={overlayStyle}
            onClick={onClose}
            className="no-print"
          />

          {/* Touch-drag bottom sheet with spring physics */}
          <motion.div
            initial="closed"
            animate={detent}
            exit="closed"
            variants={detentVariants}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            style={sheetStyle}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.95 }}
            onDragEnd={handleDragEnd}
            className="no-print"
          >
            <div style={handleContainerStyle}>
              <div style={handleStyle} />
            </div>
            <div style={sheetContentStyle}>{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
export type BottomSheetDetent = "peek" | "half" | "full";
