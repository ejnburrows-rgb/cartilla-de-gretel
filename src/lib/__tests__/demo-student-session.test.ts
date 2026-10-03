import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { startTeacherReview, getSeedClass, listSeedClasses, getSeedTeacherStudentProgress, signInSeedTeacher } from "../seed-data";
import { startDemoStudentSession, getDemoStudentSession, endDemoStudentSession, resetDemoClassroom } from "../demo-student-session";
import { learnerStorageKey } from "../learner-storage";
import { getStudentSession, recordEvent } from "../student-session";
vi.mock("../student.functions", () => ({logProgress:vi.fn()}));
import { logProgress } from "../student.functions";
beforeEach(() => {localStorage.clear(); sessionStorage.clear(); vi.stubEnv("VITE_CRM_REVIEW","true"); vi.clearAllMocks(); startTeacherReview();});
afterEach(() => vi.unstubAllEnvs());
function student() { const cls=listSeedClasses()[0]; return {cls,student:getSeedClass(cls.id).students[0]}; }
it("keeps demo work apart from anonymous/real work and logs only to the local roster", () => {
 const {cls,student:child}=student();
 localStorage.setItem("cartilla.student-session.v1",JSON.stringify({studentId:"real",classId:"real-class"}));
 localStorage.setItem("work","anonymous work");
 startDemoStudentSession(cls.id,child.id);
 expect(getStudentSession()).toBeNull();
 expect(localStorage.getItem("cartilla.student-session.v1")).toContain('real-class');
 expect(learnerStorageKey("work")).toBe(`work:demo:${cls.id}:${child.id}`);
 recordEvent({lessonId:"2",kind:"exercise",score:1,total:1,meta:{exercise:"vowel_pick_one",completed:true}});
 expect(getSeedTeacherStudentProgress(child.id).events[0].meta?.demo).toBe(true);
 expect(logProgress).not.toHaveBeenCalled();
 endDemoStudentSession(); expect(learnerStorageKey("work")).toBe("work:student:real-class:real"); expect(localStorage.getItem("work")).toBe("anonymous work");
});
it("rejects another teacher's sample student and disables demo selection in gated mode", () => {
 const {cls,student:child}=student();
 signInSeedTeacher("emilio","Novo2026!");
 expect(() => startDemoStudentSession(cls.id,child.id)).toThrow();
 vi.stubEnv("VITE_CRM_REVIEW","false");
 expect(getDemoStudentSession()).toBeNull(); expect(() => startDemoStudentSession(cls.id,child.id)).toThrow();
});
it("reset removes synthetic work while preserving anonymous and real student work", () => {
 localStorage.setItem("work:demo:seed-class:seed-student","sample");
 localStorage.setItem("work:student:real-class:real-student","real"); localStorage.setItem("work","anonymous");
 resetDemoClassroom();
 expect(localStorage.getItem("work:demo:seed-class:seed-student")).toBeNull();
 expect(localStorage.getItem("work:student:real-class:real-student")).toBe("real"); expect(localStorage.getItem("work")).toBe("anonymous");
});
