import React, { useState, useEffect, useMemo } from "react";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";
import { BottomSheet } from "./BottomSheet";
import { Download, Share, PlusSquare } from "lucide-react";

export function InstallPrompt() {
  const { promptEvent, isStandalone, isIOS, setPromptEvent } = useInstallPrompt();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Check if current agent represents a mobile viewport
  const isMobile = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }, []);

  useEffect(() => {
    // Check if dismissed before
    const isDismissed = localStorage.getItem("cartilla:install-dismissed-v1") === "true";
    if (isDismissed || isStandalone) {
      return;
    }

    // Install prompt: bottom sheet appears on first visit after 5s on mobile
    if (isMobile && (promptEvent || (isIOS && !isStandalone))) {
      // Smooth 5-second entrance delay on mobile viewports
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [promptEvent, isStandalone, isIOS, isMobile]);

  const handleDismiss = () => {
    localStorage.setItem("cartilla:install-dismissed-v1", "true");
    setIsOpen(false);
  };

  const handleInstall = async () => {
    if (!promptEvent) return;

    // Trigger the native prompt
    await promptEvent.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await promptEvent.userChoice;
    
    if (outcome === "accepted") {
      // Reset prompt event
      setPromptEvent(null);
      localStorage.setItem("cartilla:install-dismissed-v1", "true");
    }
    setIsOpen(false);
  };

  if (isStandalone) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={handleDismiss}>
      <div className="flex flex-col items-center text-center p-4">
        {/* Header Icon */}
        <div className="w-14 h-14 bg-amber-50 dark:bg-stone-900 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
          <Download className="w-7 h-7 text-amber-600 dark:text-amber-400" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-stone-850 dark:text-stone-100 mb-2">
          Instalar La Cartilla de Gretel
        </h3>

        {/* Content */}
        {promptEvent ? (
          <>
            <p className="text-stone-600 dark:text-stone-300 text-sm mb-6 max-w-sm">
              Descarga la aplicación oficial de la Cartilla de Gretel para poder acceder a tus lecciones y ejercicios interactivos sin conexión a internet.
            </p>

            {/* Actions */}
            <div className="flex flex-col w-full gap-2">
              <button
                onClick={handleInstall}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 active:scale-95 shadow-sm cursor-pointer"
              >
                Instalar ahora
              </button>
              <button
                onClick={handleDismiss}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-850 dark:hover:bg-stone-800 dark:text-stone-300 font-semibold py-3 px-4 rounded-xl transition duration-200 cursor-pointer"
              >
                Ahora no
              </button>
            </div>
          </>
        ) : isIOS ? (
          <>
            <p className="text-stone-600 dark:text-stone-300 text-sm mb-6 max-w-sm">
              Instala la aplicación en tu iPhone o iPad para poder abrirla en pantalla completa y trabajar sin conexión.
            </p>

            {/* iOS Instructions */}
            <div className="w-full text-left bg-stone-50 dark:bg-stone-900/50 p-4 rounded-xl mb-6 space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-lg p-1.5 mt-0.5">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-850 dark:text-stone-200">Paso 1</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Toca el botón <strong className="text-stone-700 dark:text-stone-300">Compartir</strong> en la barra inferior de Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-lg p-1.5 mt-0.5">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-850 dark:text-stone-200">Paso 2</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Selecciona <strong className="text-stone-700 dark:text-stone-300">Añadir a pantalla de inicio</strong> en la lista de opciones.
                  </p>
                </div>
              </div>
            </div>

            {/* iOS Close Button */}
            <button
              onClick={handleDismiss}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 active:scale-95 cursor-pointer"
            >
              Entendido
            </button>
          </>
        ) : null}
      </div>
    </BottomSheet>
  );
}
