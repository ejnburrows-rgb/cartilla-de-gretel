import { exerciseForPage, type ExerciseSeed } from "../../content/exercise-seed";
import { getLessonForPage } from "../../content/lesson-meta";
import { sentencesForPage } from "../../content/sentence-bank";
import { pictureForWord } from "../../content/picture-catalog";

export type ExerciseHostProps = {
	pageNumber: number;
	lang?: "es" | "en";
};

export function ExerciseHost({ pageNumber, lang = "es" }: ExerciseHostProps) {
	const seed = exerciseForPage(pageNumber);
	const lesson = getLessonForPage(pageNumber);
	if (!seed || !lesson) return null;

	const instruction = lang === "es" ? seed.instructionEs : seed.instructionEn;
	const accent = lesson.accent;

	return (
		<section
			className="cartilla-reveal"
			style={{
				padding: "16px 20px 20px",
				borderTop: `3px solid ${accent}`,
				background: "rgba(255,255,255,0.92)",
				borderRadius: "0 0 14px 14px",
			}}
			aria-label={`Ejercicio: ${seed.kind}`}
		>
			<header style= display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 >
				<span style= fontSize: 12, fontWeight: 700, color: accent, letterSpacing: 0.5, textTransform: "uppercase" >
					Lecci\u00f3n {lesson.n} \u00b7 P\u00e1gina {pageNumber}
				</span>
			</header>
			<p style= fontSize: 18, fontWeight: 600, color: "#23201d", margin: "0 0 14px" >{instruction}</p>
			<ExerciseBody seed={seed} accent={accent} letter={lesson.letter.toLowerCase()} pageNumber={pageNumber} />
		</section>
	);
}

function ExerciseBody({
	seed,
	accent,
	letter,
	pageNumber,
}: {
	seed: ExerciseSeed;
	accent: string;
	letter: string;
	pageNumber: number;
}) {
	if (seed.kind === "intro") {
		return (
			<div style= color: "#5b5550", fontSize: 15, lineHeight: 1.5 >
				Gretel te acompa\u00f1a en cada p\u00e1gina. Toca \u201cSiguiente\u201d cuando est\u00e9s list@.
			</div>
		);
	}
	if (seed.kind === "syllable-tap") {
		return (
			<div style= display: "flex", flexWrap: "wrap", gap: 10 >
				{(seed.syllables ?? []).map((s) => (
					<button
						key={s}
						type="button"
						style={{
							padding: "14px 22px",
							borderRadius: 12,
							border: `2px solid ${accent}`,
							background: "#fff",
							color: accent,
							fontSize: 22,
							fontWeight: 700,
							cursor: "pointer",
							minWidth: 64,
						}}
						aria-label={`S\u00edlaba ${s}`}
					>
						{s}
					</button>
				))}
			</div>
		);
	}
	if (seed.kind === "word-match") {
		return (
			<div style= display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 >
				{(seed.pairs ?? []).map((p) => {
					const pic = pictureForWord(letter, p.word);
					return (
						<button
							key={p.imageKey}
							type="button"
							style={{
								aspectRatio: "1",
								borderRadius: 14,
								border: `2px solid ${accent}33`,
								background: "#fff",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
								gap: 6,
								padding: 10,
								cursor: "pointer",
							}}
							aria-label={`Presiona ${p.word}`}
						>
							{pic ? (
								<img
									src={pic.primaryUrl}
									alt={p.word}
									onError={(e) => {
										(e.currentTarget as HTMLImageElement).src = pic.fallbackUrl;
									}}
									style= maxWidth: "75%", maxHeight: "75%", objectFit: "contain" 
								/>
							) : (
								<span style= fontSize: 28, color: accent >{letter.toUpperCase()}</span>
							)}
							<span style= fontSize: 13, color: "#3a2820", fontWeight: 600 >{p.word}</span>
						</button>
					);
				})}
			</div>
		);
	}
	if (seed.kind === "drag-build") {
		return (
			<div style= display: "flex", flexDirection: "column", gap: 14 >
				{(seed.words ?? []).map((w) => (
					<div key={w} style= display: "flex", alignItems: "center", gap: 12 >
						<span style= minWidth: 90, color: accent, fontWeight: 700 >{w}</span>
						<div style= display: "flex", gap: 8, flexWrap: "wrap" >
							{splitSyllables(w).map((syl, i) => (
								<span
									key={`${w}-${i}`}
									style={{
										padding: "8px 14px",
										borderRadius: 10,
										background: `${accent}1f`,
										color: "#23201d",
										fontWeight: 700,
										cursor: "grab",
									}}
									draggable
								>
									{syl}
								</span>
							))}
						</div>
					</div>
				))}
			</div>
		);
	}
	if (seed.kind === "reading") {
		const sentences = sentencesForPage(pageNumber);
		return (
			<div style= display: "flex", flexDirection: "column", gap: 10 >
				{sentences.map((s, i) => (
					<p key={i} style= margin: 0, fontSize: 18, color: "#23201d", lineHeight: 1.5 >
						{s.text}
					</p>
				))}
			</div>
		);
	}
	return null;
}

// Rough syllable splitter for the drag-build display. Good enough for known
// workbook words; not a general-purpose hyphenator.
function splitSyllables(word: string): string[] {
	const vowels = /[aeiou\u00e1\u00e9\u00ed\u00f3\u00fa]/i;
	const out: string[] = [];
	let buf = "";
	for (let i = 0; i < word.length; i++) {
		buf += word[i];
		if (vowels.test(word[i]) && i < word.length - 1) {
			out.push(buf);
			buf = "";
		}
	}
	if (buf) out.push(buf);
	return out;
}
