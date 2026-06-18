import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/cartilla/student-login")({
  component: StudentLogin,
  head: () => ({ meta: [{ title: "¿Cómo te llamas? — La Cartilla de Gretel" }] }),
});

function StudentLogin() {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    // If student already logged in, go straight to workbook
    const savedName = sessionStorage.getItem("studentName");
    if (savedName) {
      navigate({ to: "/cartilla/student/lecciones" });
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName.trim()) {
      sessionStorage.setItem("studentName", studentName.trim());
      navigate({ to: "/cartilla/student/lecciones" });
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background:
          "linear-gradient(135deg, #f5e6d3 0%, #e8d4b8 50%, #d4c4a8 100%)",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c4a882' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      }}
    >
      <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full border-4 border-amber-200/50">
        {/* Parchment texture overlay */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2" style={{ fontFamily: "'Fredoka', ui-rounded, system-ui, sans-serif" }}>
            ¿Cómo te llamas?
          </h1>
          <p className="text-center text-amber-800/70 mb-8 text-sm">
            Escribe tu nombre para empezar a leer
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Tu nombre..."
              className="w-full px-6 py-4 text-2xl rounded-xl border-3 border-amber-300 bg-amber-50/80 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 outline-none transition-all text-center"
              style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              required
              autoFocus
            />

            <button
              type="submit"
              disabled={!studentName.trim()}
              className="w-full py-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg"
              style={{ fontFamily: "'Fredoka', ui-rounded, system-ui, sans-serif" }}
            >
              ¡Entrar!
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
