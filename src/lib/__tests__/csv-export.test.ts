/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { exportClassProgressCsv, exportStudentProgressCsv } from "../csv-export";

function captureDownload() {
  let capturedBlob: Blob | null = null;
  let capturedFilename = "";
  const realCreateObjectURL = URL.createObjectURL;
  URL.createObjectURL = vi.fn((blob: Blob) => {
    capturedBlob = blob;
    return "blob:mock-url";
  });
  URL.revokeObjectURL = vi.fn();
  const realCreateElement = document.createElement.bind(document);
  const clickSpy = vi.fn();
  vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
    const el = realCreateElement(tag);
    if (tag === "a") {
      const realSetAttribute = el.setAttribute.bind(el);
      el.setAttribute = (name: string, value: string) => {
        if (name === "download") capturedFilename = value;
        return realSetAttribute(name, value);
      };
      el.click = clickSpy;
    }
    return el;
  });
  return {
    getBlob: () => capturedBlob,
    getFilename: () => capturedFilename,
    getClickCalled: () => clickSpy.mock.calls.length > 0,
    restore: () => {
      URL.createObjectURL = realCreateObjectURL;
      vi.restoreAllMocks();
    },
  };
}

async function blobText(blob: Blob): Promise<string> {
  return await blob.text();
}

describe("exportClassProgressCsv", () => {
  let capture: ReturnType<typeof captureDownload>;

  beforeEach(() => {
    capture = captureDownload();
  });

  afterEach(() => {
    capture.restore();
  });

  it("produces a CSV header + one row per student with accuracy as a percentage", async () => {
    exportClassProgressCsv("Mi Clase", [], {
      perStudent: [
        { id: "1", name: "Ana", lessonsCount: 5, accuracy: 0.8, timeSeconds: 600 },
        { id: "2", name: "Beto", lessonsCount: 0, accuracy: null, timeSeconds: 0 },
      ],
    });

    expect(capture.getClickCalled()).toBe(true);
    const text = await blobText(capture.getBlob()!);
    const lines = text.trim().split("\n");
    expect(lines[0]).toBe("Nombre Alumno,Lecciones Completas,Precision Promedio,Tiempo Total (m)");
    expect(lines[1]).toBe('"Ana",5,80%,10');
    expect(lines[2]).toBe('"Beto",0,N/A,0');
  });

  it("sanitizes the class name into a safe filename", () => {
    exportClassProgressCsv("3° Grado — Sección A!", [], { perStudent: [] });
    expect(capture.getFilename()).toBe("reporte_clase_3_grado__seccin_a.csv");
  });

  it("falls back to a default filename when the class name has no safe characters", () => {
    exportClassProgressCsv("!!!", [], { perStudent: [] });
    expect(capture.getFilename()).toBe("reporte_clase_sin_nombre.csv");
  });
});

describe("exportStudentProgressCsv", () => {
  let capture: ReturnType<typeof captureDownload>;

  beforeEach(() => {
    capture = captureDownload();
  });

  afterEach(() => {
    capture.restore();
  });

  it("produces a CSV header + one row per event", async () => {
    exportStudentProgressCsv("Sofía Ramírez", [
      {
        created_at: "2026-01-15T00:00:00Z",
        event_kind: "exercise",
        lesson_id: "3",
        score: 9,
        total: 10,
        time_seconds: null,
      },
      {
        created_at: "2026-01-16T00:00:00Z",
        event_kind: "lesson_completed",
        lesson_id: "3",
        score: null,
        total: null,
        time_seconds: null,
      },
    ]);

    const text = await blobText(capture.getBlob()!);
    const lines = text.trim().split("\n");
    expect(lines[0]).toBe("Fecha,Evento,Leccion,Puntuacion,Total,Tiempo (s)");
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain("exercise,3,9,10,0");
    expect(lines[2]).toContain("lesson_completed,3,0,0,0");
  });

  it("sanitizes the student name into a safe filename", () => {
    exportStudentProgressCsv("Sofía Ramírez", []);
    expect(capture.getFilename()).toBe("reporte_sofa_ramrez.csv");
  });
});
