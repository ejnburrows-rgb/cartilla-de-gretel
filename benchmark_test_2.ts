import { performance } from 'perf_hooks';

// Mock data
const numStudents = 10000;
const numAssignments = 500;

const assignments = Array.from({ length: numAssignments }, (_, i) => ({
  lesson_id: `lesson_${i}`,
  title: `Assignment ${i}`,
}));

const studentLearning = Array.from({ length: numStudents }, (_, i) => ({
  student: { id: `student_${i}`, display_name: `Student ${i}` },
  progress: {
    lessonProgress: Array.from({ length: 200 }, (_, j) => ({
      lesson_id: `lesson_${Math.floor(Math.random() * numAssignments)}`,
      status: Math.random() > 0.5 ? 'completed' : 'started',
    })),
  },
  insight: null,
}));

// Baseline
const startBaseline = performance.now();
const assignmentRowsBaseline = assignments.map((assignment) => ({
  ...assignment,
  completed: studentLearning.filter((row) =>
    row.progress?.lessonProgress.some(
      (lesson) => lesson.lesson_id === assignment.lesson_id && lesson.status === "completed",
    ),
  ).length,
}));
const endBaseline = performance.now();
console.log(`Baseline time: ${(endBaseline - startBaseline).toFixed(2)} ms`);

// Optimized
const startOptimized = performance.now();

// Build a Set of completed student IDs for each lesson to avoid O(N*M)
// Using Map<string, Set<string>> where key is lesson_id and value is Set of student_ids
const completedLessonsMap = new Map<string, Set<string>>();

for (const row of studentLearning) {
  if (!row.progress?.lessonProgress) continue;

  for (const lesson of row.progress.lessonProgress) {
    if (lesson.status === 'completed') {
      let studentSet = completedLessonsMap.get(lesson.lesson_id);
      if (!studentSet) {
        studentSet = new Set<string>();
        completedLessonsMap.set(lesson.lesson_id, studentSet);
      }
      studentSet.add(row.student.id);
    }
  }
}

const assignmentRowsOptimized = assignments.map((assignment) => {
  const completedCount = completedLessonsMap.get(assignment.lesson_id)?.size || 0;
  return {
    ...assignment,
    completed: completedCount,
  };
});

const endOptimized = performance.now();
console.log(`Optimized time: ${(endOptimized - startOptimized).toFixed(2)} ms`);

// Verification
let isCorrect = true;
for (let i = 0; i < assignments.length; i++) {
  if (assignmentRowsBaseline[i].completed !== assignmentRowsOptimized[i].completed) {
    console.error(`Mismatch for assignment ${assignments[i].lesson_id}: Baseline=${assignmentRowsBaseline[i].completed}, Optimized=${assignmentRowsOptimized[i].completed}`);
    isCorrect = false;
  }
}

if (isCorrect) {
  console.log('Results match perfectly!');
} else {
  console.log('Results DO NOT match!');
}
