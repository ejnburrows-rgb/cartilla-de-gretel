import { beforeEach, expect, it } from "vitest";
import { act, fireEvent, render, screen, cleanup } from "@testing-library/react";
import { GretelActivity } from "@/components/gretel/GretelActivity";
import { useActivityState } from "../activity-events";
import { setStudentSession } from "../student-session";
import { gretelEvent, isGretelAssistedAttempt } from "../gretel-bus";
import { markPageActivityCompleted, getCompletedPageActivities, markLessonCompleted, isLessonCompleted } from "../lesson-progress";
const student = (id: string) => ({ studentId: id, classId: "class", studentName: id, studentCode: id, className: "Class" });
beforeEach(() => { cleanup(); localStorage.clear(); });
function Control() {
  const [solved, setSolved] = useActivityState("solved", false);
  return <button onClick={() => setSolved(true)}>{solved ? "Finished" : "Work"}</button>;
}
it("switching learners restores only their own work, including returning to A", () => {
  setStudentSession(student("A"));
  render(<GretelActivity id="page-5-p5-grid" pageNumber={5} kind="picture-grid"><Control /></GretelActivity>);
  fireEvent.click(screen.getByText("Work"));
  act(() => setStudentSession(student("B")));
  expect(screen.getByText("Work")).toBeTruthy();
  act(() => setStudentSession(student("A")));
  expect(screen.getByText("Finished")).toBeTruthy();
});
it("assistance and page/lesson completion stay with their learner", () => {
  setStudentSession(student("A"));
  gretelEvent("guide:reaction", { activityId: "same", reaction: "cue" });
  markPageActivityCompleted(5, "same"); markLessonCompleted(2);
  setStudentSession(student("B"));
  expect(isGretelAssistedAttempt("same")).toBe(false);
  expect(getCompletedPageActivities(5)).toEqual([]);
  expect(isLessonCompleted(2)).toBe(false);
  setStudentSession(student("A"));
  expect(isGretelAssistedAttempt("same")).toBe(true);
  expect(getCompletedPageActivities(5)).toEqual(["same"]);
  expect(isLessonCompleted(2)).toBe(true);
});
it("anonymous saved work is never attributed to a signed-in learner", () => {
  markPageActivityCompleted(5, "anonymous-work");
  gretelEvent("guide:reaction", { activityId: "same", reaction: "hint" });
  localStorage.setItem("cartilla.activity-state.v1:page-5-p5-grid:solved", "true");
  setStudentSession(student("new"));
  render(<GretelActivity id="page-5-p5-grid" pageNumber={5} kind="picture-grid"><Control /></GretelActivity>);
  expect(screen.getByText("Work")).toBeTruthy();
  expect(getCompletedPageActivities(5)).toEqual([]);
  expect(isGretelAssistedAttempt("same")).toBe(false);
});

it("writing and syllable controls restore only their learner's content", async () => {
  const { WorkbookWritingResponse } = await import("@/components/cartilla/WorkbookWritingResponse");
  const { SyllableWordCircle } = await import("@/cartilla/interactions/SyllableWordCircle");
  const { learnerStorageKey } = await import("../learner-storage");
  setStudentSession(student("A"));
  localStorage.setItem(learnerStorageKey("cartilla-writing-page-90"), "Mi oración");
  localStorage.setItem(learnerStorageKey("cartilla-circle-scope-test"), "[0]");
  const region = { id: "scope-test", fontRole: "body" as const, regionType: "syllable-match" as const, order: 0, syllable: "ma", matchRows: [[{ word: "mamá", correct: true }]] };
  render(<><GretelActivity id="writing" pageNumber={90} kind="writing-response"><WorkbookWritingResponse pageNumber={90} interactive /></GretelActivity><GretelActivity id="circle" pageNumber={26} kind="syllable-match"><SyllableWordCircle region={region} /></GretelActivity></>);
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Mi oración");
  expect(screen.getByRole("button", { name: "mamá" }).getAttribute("aria-pressed")).toBe("true");
  act(() => setStudentSession(student("B")));
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("");
  expect(screen.getByRole("button", { name: "mamá" }).getAttribute("aria-pressed")).toBe("false");
  act(() => setStudentSession(student("A")));
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Mi oración");
  expect(screen.getByRole("button", { name: "mamá" }).getAttribute("aria-pressed")).toBe("true");
});
