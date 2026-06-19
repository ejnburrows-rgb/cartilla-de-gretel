import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import "../../styles/student-login.css";

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
    <main className="student-login-scene">
      {/* Infinite Looping Sky & Clouds */}
      <div className="scene-sky" />
      <div className="scene-clouds loop-slow" />
      <div className="scene-clouds loop-fast" />

      {/* Infinite Looping Garden Background */}
      <div className="scene-garden-back loop-medium" />
      <div className="scene-garden-front loop-fast" />

      {/* Big Happy Family Characters */}
      <div className="family-container">
        <img src="/art/hd/animal_1.png" className="family-member animal-1 breath-slow" alt="Gretel Character" />
        <img src="/art/hd/animal_2.png" className="family-member animal-2 breath-medium" alt="Gretel Character" />
        <img src="/art/hd/animal_3.png" className="family-member animal-3 breath-fast" alt="Gretel Character" />
        <img src="/art/hd/animal_4.png" className="family-member animal-4 breath-medium-alt" alt="Gretel Character" />
        <img src="/art/hd/animal_5.png" className="family-member animal-5 breath-slow-alt" alt="Gretel Character" />
      </div>

      {/* Login Box */}
      <div className="login-box-container z-50">
        <div className="relative bg-white/95 backdrop-blur-md rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-10 sm:p-14 max-w-md w-full border-8 border-white">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#fde047] text-[#854d0e] font-black text-xl px-8 py-3 rounded-full shadow-lg border-4 border-white rotate-[-3deg] hover:rotate-0 transition-transform cursor-default">
            ¡Bienvenidos!
          </div>

          <div className="relative z-10 mt-6">
            <h1 className="text-4xl sm:text-5xl font-black text-center mb-2 text-[#3b2a12] font-fredoka">
              ¿Cómo te llamas?
            </h1>
            <p className="text-center text-[#9a3412] font-bold mb-8 text-sm">
              ¡La familia de Gretel te espera para jugar!
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Escribe tu nombre..."
                className="w-full px-6 py-5 text-2xl font-black rounded-2xl border-4 border-[#fed7aa] bg-[#fff7ed] focus:border-[#f97316] focus:ring-4 focus:ring-[#fdba74] outline-none transition-all text-center text-[#9a3412] placeholder:text-[#fdba74]"
                required
                autoFocus
              />

              <button
                type="submit"
                disabled={!studentName.trim()}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c] text-white font-black text-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-95 shadow-[0_10px_20px_rgba(234,88,12,0.3)]"
                style={{ fontFamily: "'Fredoka', ui-rounded, system-ui, sans-serif" }}
              >
                ¡Entrar a la Aventura!
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
