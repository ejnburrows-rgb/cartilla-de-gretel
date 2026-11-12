import { afterEach, describe, expect, it } from "vitest";
import { CURSOR_MODE_KEY, getLastPointer, readCursorMode, recordPointer } from "../cursor-mode";

afterEach(() => { localStorage.clear(); history.replaceState(null, "", "/"); });
describe("cursor comparison mode", () => {
  it("defaults to the normal system cursor", () => expect(readCursorMode()).toBe("normal"));
  it("stores and restores an explicit choice", () => {
    history.replaceState(null, "", "/?cursor=tip");
    expect(readCursorMode()).toBe("tip");
    expect(localStorage.getItem(CURSOR_MODE_KEY)).toBe("tip");
    history.replaceState(null, "", "/");
    expect(readCursorMode()).toBe("tip");
    history.replaceState(null, "", "/?cursor=normal");
    expect(readCursorMode()).toBe("normal");
  });
  it("ignores invalid choices", () => {
    history.replaceState(null, "", "/?cursor=other");
    expect(readCursorMode()).toBe("normal");
  });
  it("records the last pointer location", () => {
    recordPointer(20, 30);
    expect(getLastPointer()).toEqual({ x: 20, y: 30 });
  });
});
