import { useEffect } from "react";

const ACKNOWLEDGEMENT = [
  "A mi hija Nora Bethsy, a mis sobrinas Sofía M. Destefano y Alexa G. Flores, a todos los niños que estudian español.",
  "Agradezco a la Editorial Double R Publishing su decisión y esfuerzo por publicar este sistema de lectura, a Silvia Diez y Aida Fernández por sus valiosas recomendaciones, a Claudina Monzón y René Sio por su asistencia técnica y a todos mis colegas que con sus observaciones enriquecieron mi trabajo y con entusiasmo alentaron mi proyecto.",
  "Este libro ha nacido en las aulas y a ellas quiero que vuelva. Mis alumnos señalaron el camino; de ellos he sido maestra y discípula. Con el mismo amor que fue creado, deseo ponerlo en las manos de los niños y niñas que vendrán a nuestras aulas para que aprendan a leer muy bien.",
];

export function FlipchartFrontmatter({
  pageNumber,
  decorative = false,
  onReady,
}: {
  pageNumber: 1 | 2;
  decorative?: boolean;
  onReady?: () => void;
}) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  if (pageNumber === 1) {
    return (
      <div
        className="fc-plate relative overflow-hidden bg-[#fffdf8] p-[5%]"
        style={{ aspectRatio: "1000 / 1311.373" }}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : "Portada de La Cartilla de Gretel"}
        aria-hidden={decorative || undefined}
        data-native-flipchart="true"
        data-source-page="1"
      >
        <div className="absolute right-[7%] top-[10%] w-[47%] rounded-[50%] bg-[#e1f4f8] px-[5%] py-[7%] text-center shadow-inner">
          <div className="font-black leading-[0.95] text-[#4b1637]" style={{ fontSize: "clamp(2rem, 6vw, 5.8rem)" }}>
            La Cartilla<br />de Gretel
          </div>
        </div>
        <div className="absolute bottom-[13%] left-[23%] w-[52%]">
          <img
            src="/cartilla/images/gretel/poses/gretel-idle.webp"
            alt=""
            draggable={false}
            className="mx-auto max-h-[64vh] w-auto object-contain drop-shadow-xl"
          />
        </div>
        <div className="absolute bottom-[4%] left-0 right-0 text-center font-bold text-stone-700" style={{ fontSize: "clamp(1rem, 2.5vw, 2.2rem)" }}>
          Autora: Leonor Lopetegui
        </div>
        <div className="fc-frontmatter__butterfly" aria-hidden>
          <span />
          <span />
        </div>
        <div className="fc-frontmatter__flower" aria-hidden>
          <i /><i /><i /><i /><b />
        </div>
      </div>
    );
  }

  return (
    <article
      className="fc-plate overflow-auto bg-white p-[6%] text-stone-800"
      style={{ aspectRatio: "1000 / 1343.922" }}
      aria-hidden={decorative || undefined}
      data-native-flipchart="true"
      data-source-page="2"
    >
      <div className="grid h-full gap-[5%] md:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-4 text-[clamp(.7rem,1.35vw,1.2rem)] leading-snug">
          <p><strong>Copyright © 2004</strong><br />Revisión 2010</p>
          <p><strong>Autor:</strong><br />Leonor Lopetegui</p>
          <p><strong>Contributors:</strong><br />Silvia Diez and Aida Fernández</p>
          <p><strong>Illustrator:</strong><br />Estela de Armas Plasencia<br />Additional Illustrations from Jupiter Images</p>
          <p><strong>Graphic Designer:</strong><br />María Artola</p>
          <p><strong>La Cartilla de Gretel</strong><br />ISBN 0-971-8696-7-7</p>
        </section>
        <section className="rounded-3xl border border-stone-200 bg-stone-50 p-[6%] text-[clamp(.72rem,1.45vw,1.25rem)] leading-relaxed shadow-sm">
          <h2 className="mb-5 rounded-xl bg-stone-600 px-4 py-2 text-center text-[clamp(1rem,2vw,1.8rem)] font-black italic text-white">
            Agradecimiento
          </h2>
          {ACKNOWLEDGEMENT.map((paragraph) => <p key={paragraph} className="mb-4">{paragraph}</p>)}
          <p className="font-bold italic">La autora</p>
        </section>
      </div>
    </article>
  );
}
