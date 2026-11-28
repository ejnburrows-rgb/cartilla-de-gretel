/**
 * @vitest-environment jsdom
 *
 * Unit tests for TutorCameraPanel (Milestone 9):
 * - Camera OFF by default (never calls getUserMedia on mount)
 * - Camera on/off toggle & front/rear facingMode toggle
 * - Permission state indicators (off, granted, denied, unavailable)
 * - Explicit snapshot capture & image upload
 * - Honest fallback notice when local vision is unavailable
 * - Privacy contract: never infers emotion/intelligence/disability/attention/engagement
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import {
  CAMERA_PRIVACY_POLICY,
  TutorCameraPanel,
  type CameraSnapshot,
} from "../TutorCameraPanel";

describe("TutorCameraPanel (Milestone 9)", () => {
  let getUserMedia: ReturnType<typeof vi.fn>;
  let trackStop: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    trackStop = vi.fn();
    getUserMedia = vi.fn(async () => ({
      getTracks: () => [{ stop: trackStop }],
    }));
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });
  });

  afterEach(() => {
    cleanup();
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: undefined,
    });
  });

  it("starts with camera OFF by default and never calls getUserMedia on mount", () => {
    const { container } = render(<TutorCameraPanel />);
    const panel = container.querySelector("[data-tutor-camera-panel]")!;
    expect(panel.getAttribute("data-permission")).toBe("off");
    expect(getUserMedia).not.toHaveBeenCalled();
    expect(container.querySelector("[data-camera-preview]")).toBeNull();
    expect(container.querySelector("[data-camera-vision-fallback]")).not.toBeNull();
  });

  it("enforces the non-negotiable facial-inference privacy policy", () => {
    expect(CAMERA_PRIVACY_POLICY.cameraOffByDefault).toBe(true);
    expect(CAMERA_PRIVACY_POLICY.localOnlyPreview).toBe(true);
    expect(CAMERA_PRIVACY_POLICY.explicitCaptureOnly).toBe(true);
    expect(CAMERA_PRIVACY_POLICY.forbiddenFaceInferences).toEqual([
      "emotion",
      "intelligence",
      "disability",
      "attention",
      "engagement",
    ]);

    const { container } = render(<TutorCameraPanel />);
    const note = container.querySelector("[data-camera-privacy-note]")?.textContent ?? "";
    expect(note.toLowerCase()).toContain("nunca analiza emociones");
  });

  it("opens local preview on toggle, switches front/rear facingMode, and stops tracks on turn-off", async () => {
    const onPermissionChange = vi.fn();
    const { container } = render(<TutorCameraPanel onPermissionChange={onPermissionChange} />);

    const toggleBtn = container.querySelector("[data-camera-toggle]")!;
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(getUserMedia).toHaveBeenCalledTimes(1);
    });
    expect(getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: expect.objectContaining({ facingMode: { ideal: "user" } }),
    });
    await waitFor(() => {
      expect(
        container.querySelector("[data-tutor-camera-panel]")?.getAttribute("data-permission"),
      ).toBe("granted");
    });

    // Toggle front -> rear
    const facingBtn = container.querySelector("[data-camera-facing-toggle]")!;
    fireEvent.click(facingBtn);

    await waitFor(() => {
      expect(getUserMedia).toHaveBeenCalledTimes(2);
    });
    expect(getUserMedia).toHaveBeenLastCalledWith({
      audio: false,
      video: expect.objectContaining({ facingMode: { ideal: "environment" } }),
    });

    // Turn off camera -> stops tracks
    fireEvent.click(toggleBtn);
    await waitFor(() => {
      expect(
        container.querySelector("[data-tutor-camera-panel]")?.getAttribute("data-permission"),
      ).toBe("off");
    });
    expect(trackStop).toHaveBeenCalled();
  });

  it("shows denied permission indicator and gentle fallback message when user denies permission", async () => {
    getUserMedia.mockRejectedValueOnce(Object.assign(new Error("denied"), { name: "NotAllowedError" }));
    const { container } = render(<TutorCameraPanel />);

    fireEvent.click(container.querySelector("[data-camera-toggle]")!);

    await waitFor(() => {
      expect(
        container.querySelector("[data-tutor-camera-panel]")?.getAttribute("data-permission"),
      ).toBe("denied");
    });
    expect(container.querySelector("[data-camera-error]")?.textContent).toContain("permiso");
  });

  it("captures an explicit snapshot only when the user clicks Tomar foto", async () => {
    const onSnapshot = vi.fn<(snap: CameraSnapshot) => void>();
    const { container } = render(<TutorCameraPanel onSnapshot={onSnapshot} />);

    const snapBtn = container.querySelector("[data-camera-snapshot-btn]") as HTMLButtonElement;
    expect(snapBtn.disabled).toBe(true);

    fireEvent.click(container.querySelector("[data-camera-toggle]")!);
    await waitFor(() => expect(snapBtn.disabled).toBe(false));

    expect(onSnapshot).not.toHaveBeenCalled();
    fireEvent.click(snapBtn);

    expect(onSnapshot).toHaveBeenCalledTimes(1);
    const snap = onSnapshot.mock.calls[0][0];
    expect(snap.source).toBe("camera-snapshot");
    expect(snap.dataUrl.startsWith("data:image/png")).toBe(true);
    expect(container.querySelector("[data-camera-snapshot-preview]")).not.toBeNull();
  });

  it("supports local image upload even while the camera stays off", async () => {
    const onSnapshot = vi.fn<(snap: CameraSnapshot) => void>();
    const { container } = render(<TutorCameraPanel onSnapshot={onSnapshot} />);

    const fileInput = container.querySelector("[data-camera-upload-input]") as HTMLInputElement;
    const file = new File(["fake-image-bytes"], "cuaderno.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => expect(onSnapshot).toHaveBeenCalledTimes(1));
    expect(onSnapshot.mock.calls[0][0]).toMatchObject({
      source: "image-upload",
      fileName: "cuaderno.png",
    });
    expect(getUserMedia).not.toHaveBeenCalled();
  });
});
