import React, { useEffect, useState } from "react";
import { feelBus } from "../../lib/feel-bus";

interface ToastMessage {
  id: number;
  es: string;
  en: string;
}

export function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = React.useRef(0);

  useEffect(() => {
    const unsubscribe = feelBus.onFeel((detail) => {
      if (detail.kind === "toast" && detail.meta) {
        const newToast: ToastMessage = {
          id: nextId.current++,
          es: detail.meta.es || "",
          en: detail.meta.en || "",
        };
        setToasts((prev) => [...prev, newToast]);

        // Auto-dismiss after 3.5s
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, 3500);
      }
    });

    return unsubscribe;
  }, []);

  const handleDismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="feel-toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="feel-toast-item">
          <div className="flex flex-col text-left">
            <span className="text-stone-100 font-semibold">{toast.es}</span>
            <span className="text-stone-400 text-xs mt-0.5">{toast.en}</span>
          </div>
          <button
            onClick={() => handleDismiss(toast.id)}
            className="feel-toast-close"
            aria-label="Cerrar / Close"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toast;
