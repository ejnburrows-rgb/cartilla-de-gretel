import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ActivityContext,
  useActivityEvents,
  useActivityState,
  type ActivityContextValue,
} from "../activity-events";
import { learnerStorageKey } from "../learner-storage";
import { gretelEvent } from "../gretel-bus";
import { recordEvent } from "../student-session";
vi.mock("../gretel-bus", () => ({ gretelEvent: vi.fn() }));
vi.mock("../student-session", () => ({ recordEvent: vi.fn() }));
function Control() {
  const { emit, record } = useActivityEvents();
  const [value, setValue] = useActivityState("count", 0);
  return (
    <button
      onClick={() => {
        setValue((v) => v + 1);
        emit("activity:complete");
        record({ lessonId: "3", kind: "exercise", score: 1, total: 1 });
      }}
    >
      {value}
    </button>
  );
}
function mount(context: ActivityContextValue) {
  return render(
    <ActivityContext.Provider value={context}>
      <Control />
    </ActivityContext.Provider>,
  );
}
afterEach(cleanup);
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
describe("isolated activity boundary", () => {
  it("keeps preview events local, ignores learner state, records nothing and resets on remount", () => {
    const key = learnerStorageKey("cartilla.activity-state.v1:collision:count");
    localStorage.setItem(key, "42");
    const onEvent = vi.fn();
    const context = { activityId: "collision", isCurrent: () => true, isolated: true, onEvent };
    const view = mount(context);
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    expect(screen.getByRole("button", { name: "1" })).toBeTruthy();
    expect(onEvent).toHaveBeenCalledWith("activity:complete", undefined);
    expect(gretelEvent).not.toHaveBeenCalled();
    expect(recordEvent).not.toHaveBeenCalled();
    expect(localStorage.getItem(key)).toBe("42");
    expect(localStorage.length).toBe(1);
    view.unmount();
    mount(context);
    expect(screen.getByRole("button", { name: "0" })).toBeTruthy();
  });
  it("preserves the production event, record and persistence contract by default", () => {
    const key = learnerStorageKey("cartilla.activity-state.v1:real:count");
    localStorage.setItem(key, "2");
    mount({ activityId: "real", pageNumber: 7, isCurrent: () => true });
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(gretelEvent).toHaveBeenCalledWith("activity:complete", {
      activityId: "real",
      pageNumber: 7,
    });
    expect(recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({ meta: { activityId: "real", pageNumber: 7 } }),
    );
    expect(localStorage.getItem(key)).toBe("3");
  });
  it("does not complete inactive isolated activities", () => {
    const onEvent = vi.fn();
    mount({ activityId: "inactive", isolated: true, isCurrent: () => false, onEvent });
    fireEvent.click(screen.getByRole("button"));
    expect(onEvent).not.toHaveBeenCalled();
    expect(gretelEvent).not.toHaveBeenCalled();
    expect(recordEvent).not.toHaveBeenCalled();
  });
});
