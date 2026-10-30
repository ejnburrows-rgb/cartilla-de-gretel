const fs = require('fs');

const content = fs.readFileSync('src/features/teacher-crm/TeacherDailyHome.tsx', 'utf8');

const searchStr = `  const assignmentRows = useMemo(() => {
    return assignments.map((assignment) => ({
      ...assignment,
      completed: studentLearning.filter((row) =>
        row.progress?.lessonProgress.some(
          (lesson) => lesson.lesson_id === assignment.lesson_id && lesson.status === "completed",
        ),
      ).length,
    }));
  }, [assignments, studentLearning]);`;

const replaceStr = `  const assignmentRows = useMemo(() => {
    const completedLessonsMap = new Map<string, Set<string>>();
    for (const row of studentLearning) {
      if (!row.progress?.lessonProgress) continue;
      for (const lesson of row.progress.lessonProgress) {
        if (lesson.status === "completed") {
          let studentSet = completedLessonsMap.get(lesson.lesson_id);
          if (!studentSet) {
            studentSet = new Set<string>();
            completedLessonsMap.set(lesson.lesson_id, studentSet);
          }
          studentSet.add(row.student.id);
        }
      }
    }

    return assignments.map((assignment) => ({
      ...assignment,
      completed: completedLessonsMap.get(assignment.lesson_id)?.size || 0,
    }));
  }, [assignments, studentLearning]);`;

if (content.includes(searchStr)) {
  fs.writeFileSync('src/features/teacher-crm/TeacherDailyHome.tsx', content.replace(searchStr, replaceStr));
  console.log("Successfully replaced");
} else {
  console.log("Search string not found!");
}
