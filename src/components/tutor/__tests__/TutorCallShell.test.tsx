import { useEffect } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TutorCallShell } from "../TutorCallShell";
import {
  deriveSessionState,
  pickSafePipCorner,
  TUTOR_STATE_LABELS,
  TutorSessionController,
  type TutorSessionState,
} from "@/lib/tutor-session";

describe("TutorCallShell & TutorSessionController (Milestone 6)", () => {
  it("keeps ONE persistent avatar DOM node and ONE mic DOM node across all 4 layout switches and PiP minimize/restore", () => {
    let avatarMountCount = 0;
    let micMountCount = 0;

    function AvatarProbe() {
      useEffect(() => {
        avatarMountCount += 1;
      }, []);
      return <div data-testid="persistent-avatar">Gretel Avatar</div>;
    }

    function MicProbe() {
      useEffect(() => {
        micMountCount += 1;
      }, []);
      return (
        <button type="button" data-testid="persistent-mic">
          Mic
        </button>
      );
    }

    const onInterrupt = vi.fn();
    const controller = new TutorSessionController({
      sessionId: "test-session",
      lesson: 1,
      onInterrupt,
    });

    // Simulate active playback + mic session before switching layouts
    controller.beginSpeaking("l1-a", "Esta es la letra a");
    controller.updatePlaybackPosition(1.25, 3.0, "l1-a", "D");
    controller.setRealState("speaking");

    render(
      <TutorCallShell
        controller={controller}
        lessonTitle="Lección 1 · Introducción"
        avatar={<AvatarProbe />}
        card={<div data-testid="word-card">a</div>}
        mic={<MicProbe />}
        flipchartSlot={<div data-testid="flipchart-slot">Flipchart</div>}
        practiceSlot={<div data-testid="practice-slot">Practice</div>}
      />,
    );

    const avatarElInitial = screen.getByTestId("persistent-avatar");
    const micElInitial = screen.getByTestId("persistent-mic");
    expect(avatarMountCount).toBe(1);
    expect(micMountCount).toBe(1);

    // Switch Mode A -> Mode B (split)
    fireEvent.click(screen.getByRole("button", { name: "Pantalla dividida" }));
    expect(screen.getByTestId("persistent-avatar")).toBe(avatarElInitial);
    expect(screen.getByTestId("persistent-mic")).toBe(micElInitial);
    expect(screen.getByTestId("flipchart-slot")).toBeTruthy();

    // Switch Mode B -> Mode C (flipchart-pip)
    fireEvent.click(screen.getByRole("button", { name: "Rotafolio + ventana" }));
    expect(screen.getByTestId("persistent-avatar")).toBe(avatarElInitial);
    expect(screen.getByTestId("persistent-mic")).toBe(micElInitial);

    // Minimize & restore PiP — still the exact same DOM node!
    fireEvent.click(screen.getByRole("button", { name: "Minimizar ventana de Gretel" }));
    expect(screen.getByTestId("persistent-avatar")).toBe(avatarElInitial);
    fireEvent.click(screen.getByRole("button", { name: "Restaurar ventana de Gretel" }));
    expect(screen.getByTestId("persistent-avatar")).toBe(avatarElInitial);

    // Switch Mode C -> Mode D (practice side -> practice pip -> back to call)
    fireEvent.click(screen.getByRole("button", { name: "Práctica guiada" }));
    expect(screen.getByTestId("persistent-avatar")).toBe(avatarElInitial);
    expect(screen.getByTestId("practice-slot")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Gretel flotante/ }));
    expect(screen.getByTestId("persistent-avatar")).toBe(avatarElInitial);

    fireEvent.click(screen.getByRole("button", { name: "Llamada" }));
    expect(screen.getByTestId("persistent-avatar")).toBe(avatarElInitial);
    expect(screen.getByTestId("persistent-mic")).toBe(micElInitial);

    // Mounted exactly once, playback continuity completely intact
    expect(avatarMountCount).toBe(1);
    expect(micMountCount).toBe(1);
    expect(onInterrupt).not.toHaveBeenCalled();
    const snap = controller.getSnapshot();
    expect(snap.linePlaying).toBe(true);
    expect(snap.playbackTime).toBe(1.25);
    expect(snap.activeLineId).toBe("l1-a");
    expect(snap.viseme).toBe("D");
    expect(snap.layoutSwitchCount).toBe(4);
  });

  it("supports Mode A controls: camera off by default, captions, transcript + text input, mute, interrupt, replay, end", () => {
    const onMuteChange = vi.fn();
    const onInterrupt = vi.fn();
    const onReplayLast = vi.fn();
    const onTextSubmit = vi.fn();
    const onEndCall = vi.fn();

    const controller = new TutorSessionController({
      sessionId: "test-mode-a",
      lesson: 2,
      onMuteChange,
      onInterrupt,
    });
    controller.beginSpeaking("l2-o", "Repite conmigo: oso");
    controller.setRealState("speaking");

    render(
      <TutorCallShell
        controller={controller}
        lessonTitle="Lección 2 · La vocal O"
        avatar={<div>Gretel</div>}
        card={<div>oso</div>}
        mic={<button type="button">Mic</button>}
        cameraSlot={<div data-testid="student-camera">Cámara local</div>}
        onReplayLast={onReplayLast}
        onTextSubmit={onTextSubmit}
        onEndCall={onEndCall}
      />,
    );

    // Camera is OFF by default
    expect(screen.queryByTestId("student-camera")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Encender cámara" }));
    expect(screen.getByTestId("student-camera")).toBeTruthy();

    // Captions visible by default, toggle hides them
    expect(screen.getByText("Repite conmigo: oso")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Ocultar subtítulos" }));
    expect(screen.queryByText("Repite conmigo: oso")).toBeNull();

    // Transcript drawer opens and accepts text input
    fireEvent.click(screen.getByRole("button", { name: "Abrir transcripción" }));
    const input = screen.getByLabelText("Escribir respuesta o pregunta");
    fireEvent.change(input, { target: { value: "oso" } });
    fireEvent.submit(input.closest("form")!);
    expect(onTextSubmit).toHaveBeenCalledWith("oso");
    expect(controller.getSnapshot().transcript.some((t) => t.speaker === "student" && t.text === "oso")).toBe(true);

    // Mute, Replay, Interrupt, End
    fireEvent.click(screen.getByRole("button", { name: "Silenciar" }));
    expect(onMuteChange).toHaveBeenCalledWith(true);

    fireEvent.click(screen.getByRole("button", { name: "Escuchar otra vez" }));
    expect(onReplayLast).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Interrumpir a Gretel" }));
    expect(onInterrupt).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Terminar llamada" }));
    expect(onEndCall).toHaveBeenCalledTimes(1);
  });

  it("supports Mode B keyboard resizing and Mode C PiP snap/resize/protected-region avoidance", () => {
    const controller = new TutorSessionController({
      sessionId: "test-modes-bc",
      lesson: 7,
      initialLayoutMode: "split",
    });

    const { container } = render(
      <TutorCallShell
        controller={controller}
        lessonTitle="Lección 7 · La M"
        avatar={<div>Gretel</div>}
        card={<div>mama</div>}
        mic={<button type="button">Mic</button>}
        flipchartSlot={<div>Lámina 15</div>}
      />,
    );

    // Mode B keyboard resizing
    const divider = screen.getByRole("separator");
    const initialRatio = controller.getSnapshot().splitRatio;
    fireEvent.keyDown(divider, { key: "ArrowRight" });
    expect(controller.getSnapshot().splitRatio).toBeGreaterThan(initialRatio);
    fireEvent.keyDown(divider, { key: "ArrowLeft" });
    expect(controller.getSnapshot().splitRatio).toBeCloseTo(initialRatio, 2);

    // Mode C protected region avoidance: protect bottom-right -> snaps to bottom-left
    act(() => {
      controller.setProtectedRegions([{ x: 0.65, y: 0.6, width: 0.35, height: 0.4, label: "art" }]);
      controller.setLayoutMode("flipchart-pip");
    });
    expect(controller.getSnapshot().pip.corner).toBe("bottom-left");

    // Manual snap + size cycle
    fireEvent.click(screen.getByRole("button", { name: "Acoplar ventana abajo a la derecha" }));
    expect(controller.getSnapshot().pip.corner).toBe("bottom-right");

    fireEvent.click(screen.getByRole("button", { name: "Cambiar tamaño de la ventana de Gretel" }));
    expect(controller.getSnapshot().pip.size).toBe("lg");

    const avatarHost = container.querySelector("[data-tutor-avatar-slot]");
    expect(avatarHost?.getAttribute("data-pip-corner")).toBe("bottom-right");
    expect(avatarHost?.getAttribute("data-pip-size")).toBe("lg");
  });

  it("avoids important Flip Chart regions cleanly with pickSafePipCorner", () => {
    expect(
      pickSafePipCorner([{ x: 0.72, y: 0.68, width: 0.25, height: 0.3 }], "bottom-right"),
    ).toBe("bottom-left");
    expect(
      pickSafePipCorner([{ x: 0.02, y: 0.68, width: 0.25, height: 0.3 }], "bottom-left"),
    ).toBe("bottom-right");
  });

  it("derives ONLY real session states across all 10 allowed states", () => {
    const cases: Array<[Parameters<typeof deriveSessionState>[0], TutorSessionState]> = [
      [{ hasBrain: false, micCapturing: false, linePlaying: false, presenting: false, thinking: false, analyzing: false, recovering: false, ended: false }, "preparing"],
      [{ hasBrain: true, brainPhase: "GREET", micCapturing: false, linePlaying: false, presenting: false, thinking: false, analyzing: false, recovering: false, ended: false }, "ready"],
      [{ hasBrain: true, brainPhase: "LISTEN", micCapturing: true, linePlaying: false, presenting: false, thinking: false, analyzing: false, recovering: false, ended: false }, "listening"],
      [{ hasBrain: true, brainPhase: "RESPOND", micCapturing: false, linePlaying: false, presenting: false, thinking: true, analyzing: false, recovering: false, ended: false }, "thinking"],
      [{ hasBrain: true, brainPhase: "MODEL", micCapturing: false, linePlaying: true, presenting: false, thinking: false, analyzing: false, recovering: false, ended: false }, "speaking"],
      [{ hasBrain: true, brainPhase: "MODEL", micCapturing: false, linePlaying: true, presenting: true, thinking: false, analyzing: false, recovering: false, ended: false }, "presenting"],
      [{ hasBrain: true, brainPhase: "LISTEN", micCapturing: false, linePlaying: false, presenting: false, thinking: false, analyzing: false, recovering: false, ended: false }, "waiting"],
      [{ hasBrain: true, brainPhase: "LISTEN", micCapturing: false, linePlaying: false, presenting: false, thinking: false, analyzing: true, recovering: false, ended: false }, "analyzing"],
      [{ hasBrain: true, brainPhase: "LISTEN", micCapturing: false, linePlaying: false, presenting: false, thinking: false, analyzing: false, recovering: true, ended: false }, "recovering"],
      [{ hasBrain: true, brainPhase: "ENDED", micCapturing: false, linePlaying: false, presenting: false, thinking: false, analyzing: false, recovering: false, ended: true }, "ended"],
    ];

    for (const [input, expected] of cases) {
      const result = deriveSessionState(input);
      expect(result).toBe(expected);
      expect(TUTOR_STATE_LABELS[result].length).toBeGreaterThan(0);
    }
  });
});
