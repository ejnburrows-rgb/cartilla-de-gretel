import { PolishedPage } from "./PolishedPage";
import { ExerciseHost } from "./ExerciseHost";
import { getLessonForPage } from "../../content/lesson-meta";

export type LessonShellProps = {
	pageNumber: number;
	lang?: "es" | "en";
	side?: "student" | "teacher";
	hideBadge?: boolean;
	className?: string;
};

/**
 * LessonShell — single composed surface used by routes.
 *
 * Student side: pastel page background, polished workbook image on top,
 * interactive Spanish exercise below.
 *
 * Teacher side: vibrant kids-book background, large polished page only.
 * The teacher activity overlays are handled by maestro routes (Codex lane).
 */
export function LessonShell({
	pageNumber,
	lang = "es",
	side = "student",
	hideBadge = false,
	className = "",
}: LessonShellProps) {
	const lesson = getLessonForPage(pageNumber);
	if (!lesson) return null;

	const bgClass = side === "teacher" ? lesson.teacherBgClass : lesson.studentBgClass;

	return (
		<div
			className={`cartilla-lesson-shell ${bgClass} ${className}`.trim()}
			data-lesson={lesson.n}
			data-page={pageNumber}
			data-side={side}
			style=
				display: "flex",
				flexDirection: "column",
				gap: 18,
				padding: "22px 18px 30px",
				minHeight: "100%",
			
		>
			<div className="cartilla-page-premium">
				<PolishedPage
					pageNumber={pageNumber}
					lessonN={lesson.n}
					hideBadge={hideBadge}
				/>
			</div>
			{side === "student" ? <ExerciseHost pageNumber={pageNumber} lang={lang} /> : null}
		</div>
	);
}
