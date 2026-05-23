import { Sparkles, AlertTriangle, Info, BookOpen } from "lucide-react";
import {
	getBookFaithfulLesson,
	getSightWordsForLesson,
	lessonHasMiniStory,
	lessonHasEmptyPalabras,
	getEditorialNotesForLesson,
} from "@/lib/book-faithful";

/**
 * Conditional overlay that surfaces the book-faithful pedagogy facts for a
 * given lesson number, sourced from src/data/lessons.json via
 * src/lib/book-faithful.ts.
 *
 * Renders nothing when the lesson has no extra facts. Safe to drop into any
 * lesson view. Designed to be inserted into the live route
 * src/routes/cartilla/leccion.$n.tsx right beneath the h1 title:
 *
 *   <BookFaithfulOverlay n={n} />
 */
export function BookFaithfulOverlay({ n }: { n: number }) {
	const entry = getBookFaithfulLesson(n);
	if (!entry) return null;

	const sightWords = getSightWordsForLesson(n);
	const miniStory = lessonHasMiniStory(n);
	const emptyPalabras = lessonHasEmptyPalabras(n);
	const notes = getEditorialNotesForLesson(n);

	const hasAny =
		sightWords.length > 0 || miniStory || emptyPalabras || notes.length > 0;
	if (!hasAny) return null;

	return (
		<aside
			className="mt-3 flex flex-col gap-2"
			aria-label="Información de la lección"
		>
			{sightWords.length > 0 && (
				<div
					className="flex flex-wrap items-center gap-2"
					role="group"
					aria-label="Palabras de vista nuevas"
				>
					<span className="text-xs font-bold uppercase tracking-wide text-foreground/60 inline-flex items-center gap-1">
						<Sparkles className="w-3.5 h-3.5" /> Palabras de vista
					</span>
					{sightWords.map((w) => (
						<span
							key={w}
							aria-label={`Palabra de vista: ${w}`}
							className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20"
						>
							{w}
						</span>
					))}
				</div>
			)}

			{miniStory && (
				<div
					role="note"
					className="inline-flex items-start gap-2 rounded-xl border-2 border-success/30 bg-success/5 px-3 py-2 text-xs font-bold text-success"
				>
					<BookOpen className="w-4 h-4 shrink-0 mt-0.5" />
					<span>Esta lección tiene un mini-cuento.</span>
				</div>
			)}

			{emptyPalabras && (
				<div
					role="note"
					className="inline-flex items-start gap-2 rounded-xl border-2 border-foreground/15 bg-secondary px-3 py-2 text-xs font-bold text-foreground/70"
				>
					<Info className="w-4 h-4 shrink-0 mt-0.5" />
					<span>Esta lección no tiene sección de palabras.</span>
				</div>
			)}

			{notes.length > 0 && (
				<ul className="space-y-1.5">
					{notes.map((note) => {
						const tone =
							note.severity === "error"
								? "border-destructive/40 bg-destructive/5 text-destructive"
								: note.severity === "warning"
									? "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400"
									: "border-foreground/15 bg-secondary text-foreground/70";
						return (
							<li
								key={note.id}
								role="note"
								className={`flex items-start gap-2 rounded-xl border-2 px-3 py-2 text-xs font-bold ${tone}`}
							>
								<AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
								<div>
									<div className="leading-tight">{note.description}</div>
									<div className="text-[10px] opacity-70 mt-0.5 font-medium">
										{note.location}
									</div>
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</aside>
	);
}
