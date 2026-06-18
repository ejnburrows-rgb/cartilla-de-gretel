export interface MockStudent {
  id: string;
  name: string;
  status: string;
  progress: number;
  lastActive: string;
  alert: boolean;
}

export interface MockTask {
  id: string;
  title: string;
  due: string;
  priority: string;
}

export const mockStudents: MockStudent[] = [];

export const mockTasks: MockTask[] = [];

export const kpis = {
  activeStudents: 0,
  averageProgress: "0%",
  needsAttention: 0,
  lessonsCompletedThisWeek: 0,
};
