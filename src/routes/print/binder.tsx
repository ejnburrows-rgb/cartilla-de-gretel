import { createFileRoute } from "@tanstack/react-router";
import { PrintBinder } from "@/components/StudentBook/PrintBinder";

export const Route = createFileRoute("/print/binder")({
  component: PrintFullBinder,
});

function PrintFullBinder() {
  return (
    <div className="w-full bg-white text-black print:bg-white print:text-black">
      <div className="no-print p-4 bg-gray-100 flex justify-between items-center">
        <h1 className="text-xl font-bold">Preview: Binder Completo</h1>
        <button 
          onClick={() => window.print()}
          className="px-4 py-2 bg-primary text-white rounded font-bold"
        >
          Imprimir Todo
        </button>
      </div>
      <PrintBinder />
    </div>
  );
}
