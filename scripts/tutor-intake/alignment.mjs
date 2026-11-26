/**
 * Spanish transcript normalization, batch similarity matching, and
 * Needleman-Wunsch global sequence alignment DP.
 *
 * CRITICAL INVARIANT: Never assume the nth heard sentence corresponds to the nth
 * expected line. Every segment is matched via transcript similarity and
 * aligned via Needleman-Wunsch DP to detect missing, repeated, reordered, and
 * wrong lines.
 */

const DRAFT_PREFIX_RE = /^\[DRAFT\s+—\s+owner to approve\]\s*/i;
const REUSE_SUFFIX_RE = /\s*\(reuse:\s*[A-Za-zÀ-ÿ0-9_ -]+\)$/i;

/** Normalize Spanish text for deterministic comparison and matching. */
export function normalizeSpanishText(text, { foldAccents = true } = {}) {
  let clean = String(text ?? "")
    .replace(DRAFT_PREFIX_RE, "")
    .replace(REUSE_SUFFIX_RE, "")
    .toLocaleLowerCase("es")
    .trim();

  if (foldAccents) {
    // Preserve ñ while folding vowel diacritics, or fold all combining marks cleanly
    clean = clean
      .replace(/ñ/g, "\u0000")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\u0000/g, "ñ");
  }

  return clean
    .replace(/[¡!¿?.,;:"'()[\]{}—–\-_/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeSpanish(text, options = {}) {
  const norm = normalizeSpanishText(text, options);
  return norm ? norm.split(" ") : [];
}

function bigrams(str) {
  const padded = ` ${str} `;
  const map = new Map();
  for (let i = 0; i < padded.length - 1; i++) {
    const bg = padded.slice(i, i + 2);
    map.set(bg, (map.get(bg) ?? 0) + 1);
  }
  return map;
}

function diceBigramSimilarity(a, b) {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  if (a === b) return 1;
  const ba = bigrams(a);
  const bb = bigrams(b);
  let overlap = 0;
  let totalA = 0;
  let totalB = 0;
  for (const v of ba.values()) totalA += v;
  for (const v of bb.values()) totalB += v;
  for (const [k, v] of ba.entries()) {
    overlap += Math.min(v, bb.get(k) ?? 0);
  }
  return (2 * overlap) / (totalA + totalB);
}

/**
 * Needleman-Wunsch global sequence alignment DP over token arrays.
 * Detects exact matches, substitutions (wrong words), deletions (missing words),
 * and insertions (extra/repeated words).
 */
export function needlemanWunschAlign(
  expectedTokens,
  heardTokens,
  { matchScore = 2, mismatchPenalty = -1.5, gapPenalty = -1 } = {},
) {
  const n = expectedTokens.length;
  const m = heardTokens.length;

  const dp = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  const dir = Array.from({ length: n + 1 }, () => new Uint8Array(m + 1)); // 1=diag, 2=up(del/missing), 3=left(ins/extra)

  for (let i = 1; i <= n; i++) {
    dp[i][0] = dp[i - 1][0] + gapPenalty;
    dir[i][0] = 2;
  }
  for (let j = 1; j <= m; j++) {
    dp[0][j] = dp[0][j - 1] + gapPenalty;
    dir[0][j] = 3;
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const same = expectedTokens[i - 1] === heardTokens[j - 1];
      const diag = dp[i - 1][j - 1] + (same ? matchScore : mismatchPenalty);
      const up = dp[i - 1][j] + gapPenalty;
      const left = dp[i][j - 1] + gapPenalty;

      if (diag >= up && diag >= left) {
        dp[i][j] = diag;
        dir[i][j] = 1;
      } else if (up >= left) {
        dp[i][j] = up;
        dir[i][j] = 2;
      } else {
        dp[i][j] = left;
        dir[i][j] = 3;
      }
    }
  }

  const operations = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    const move = dir[i][j];
    if (i > 0 && j > 0 && move === 1) {
      const exp = expectedTokens[i - 1];
      const hrd = heardTokens[j - 1];
      operations.push({
        type: exp === hrd ? "match" : "substitute",
        expected: exp,
        heard: hrd,
        expectedIndex: i - 1,
        heardIndex: j - 1,
      });
      i -= 1;
      j -= 1;
    } else if (i > 0 && (j === 0 || move === 2)) {
      operations.push({
        type: "missing",
        expected: expectedTokens[i - 1],
        heard: null,
        expectedIndex: i - 1,
        heardIndex: null,
      });
      i -= 1;
    } else {
      operations.push({
        type: "extra",
        expected: null,
        heard: heardTokens[j - 1],
        expectedIndex: null,
        heardIndex: j - 1,
      });
      j -= 1;
    }
  }
  operations.reverse();

  const maxScore = Math.max(n, m, 1) * matchScore;
  const similarity = Math.max(0, Math.min(1, dp[n][m] / maxScore));
  const matchedTokens = operations.filter((o) => o.type === "match").length;
  const missingTokens = operations.filter((o) => o.type === "missing").map((o) => o.expected);
  const extraTokens = operations.filter((o) => o.type === "extra").map((o) => o.heard);
  const substitutedTokens = operations
    .filter((o) => o.type === "substitute")
    .map((o) => ({ expected: o.expected, heard: o.heard }));

  return {
    score: Number(dp[n][m].toFixed(3)),
    similarity: Number(similarity.toFixed(4)),
    matchedTokens,
    expectedCount: n,
    heardCount: m,
    missingTokens,
    extraTokens,
    substitutedTokens,
    operations,
  };
}

/** Combined Spanish phrase similarity (token Needleman-Wunsch DP + character bigram Dice). */
export function computeTranscriptSimilarity(expectedText, heardText) {
  const expExact = normalizeSpanishText(expectedText, { foldAccents: false });
  const hrdExact = normalizeSpanishText(heardText, { foldAccents: false });
  const expFolded = normalizeSpanishText(expectedText, { foldAccents: true });
  const hrdFolded = normalizeSpanishText(heardText, { foldAccents: true });

  const expTokens = expFolded ? expFolded.split(" ") : [];
  const hrdTokens = hrdFolded ? hrdFolded.split(" ") : [];

  const nw = needlemanWunschAlign(expTokens, hrdTokens);
  const charSim = diceBigramSimilarity(expFolded, hrdFolded);
  const exactBonus = expExact === hrdExact && expExact.length > 0 ? 1 : 0;

  // For single-token word models, character similarity helps distinguish close words
  const tokenWeight = Math.max(expTokens.length, hrdTokens.length) <= 1 ? 0.5 : 0.75;
  const combined = tokenWeight * nw.similarity + (1 - tokenWeight) * charSim;

  return {
    similarity: Number(Math.min(1, combined).toFixed(4)),
    exactTextMatch: exactBonus === 1,
    foldedTextMatch: expFolded === hrdFolded && expFolded.length > 0,
    tokenAlignment: nw,
    charSimilarity: Number(charSim.toFixed(4)),
  };
}

/**
 * Identify which candidate batch/script best matches a continuous recording's
 * heard segments via transcript similarity (never assuming positional order).
 */
export function matchBatchByTranscriptSimilarity(
  heardSegments,
  candidateBatches,
  { minLineSimilarity = 0.55 } = {},
) {
  const ranked = candidateBatches.map((batch) => {
    const lines = batch.lines ?? [];
    const matchedLineIds = new Set();
    let similaritySum = 0;

    for (const seg of heardSegments) {
      let bestSim = 0;
      let bestLine = null;
      for (const line of lines) {
        const sim = computeTranscriptSimilarity(line.text, seg.text ?? "").similarity;
        if (sim > bestSim) {
          bestSim = sim;
          bestLine = line;
        }
      }
      similaritySum += bestSim;
      if (bestLine && bestSim >= minLineSimilarity) {
        matchedLineIds.add(bestLine.id ?? bestLine.lineId);
      }
    }

    const avgSegSimilarity = heardSegments.length > 0 ? similaritySum / heardSegments.length : 0;
    const batchCoverage = lines.length > 0 ? matchedLineIds.size / lines.length : 0;
    const score = 0.65 * avgSegSimilarity + 0.35 * batchCoverage;

    return {
      batchId: batch.batchId,
      score: Number(score.toFixed(4)),
      avgSegSimilarity: Number(avgSegSimilarity.toFixed(4)),
      batchCoverage: Number(batchCoverage.toFixed(4)),
      matchedLinesCount: matchedLineIds.size,
      totalLinesCount: lines.length,
    };
  });

  ranked.sort((a, b) => b.score - a.score);
  return {
    bestBatch: ranked[0] ?? null,
    ranked,
  };
}

/**
 * Align heard segments against expected batch lines without assuming nth sentence = nth line.
 * Detects:
 * - matched lines (and token-level Needleman-Wunsch diffs)
 * - missing lines (expected but never spoken)
 * - repeated lines (expected line spoken >1 times)
 * - reordered lines (spoken out of expected sequence)
 * - wrong lines (heard speech fails similarity or contains wrong/substituted/missing/extra words)
 */
export function alignBatchSegments({
  expectedLines,
  heardSegments,
  minMatchSimilarity = 0.55,
  strictExactSimilarity = 0.999,
}) {
  const indexedExpected = expectedLines.map((line, index) => ({
    ...line,
    id: line.id ?? line.lineId,
    expectedIndex: index,
    seq: line.seq ?? index + 1,
  }));

  const segmentsWithBestMatch = heardSegments.map((seg, segIndex) => {
    let best = null;
    for (const exp of indexedExpected) {
      const result = computeTranscriptSimilarity(exp.text, seg.text ?? "");
      if (!best || result.similarity > best.similarity) {
        best = { exp, ...result };
      }
    }

    const isMatched = Boolean(best && best.similarity >= minMatchSimilarity);
    const hasWordDeviations =
      !best ||
      best.tokenAlignment.missingTokens.length > 0 ||
      best.tokenAlignment.extraTokens.length > 0 ||
      best.tokenAlignment.substitutedTokens.length > 0;

    return {
      segmentIndex: segIndex,
      startSec: seg.startSec ?? null,
      endSec: seg.endSec ?? null,
      heardText: seg.text ?? "",
      matchedLineId: isMatched ? best.exp.id : null,
      expectedIndex: isMatched ? best.exp.expectedIndex : null,
      expectedText: best ? best.exp.text : null,
      bestCandidateLineId: best ? best.exp.id : null,
      similarity: best ? best.similarity : 0,
      exactTextMatch: best ? best.exactTextMatch : false,
      foldedTextMatch: best ? best.foldedTextMatch : false,
      tokenAlignment: best ? best.tokenAlignment : null,
      status: !isMatched
        ? "wrong"
        : best.similarity >= strictExactSimilarity || !hasWordDeviations
          ? "matched-exact"
          : "matched-with-word-diffs",
    };
  });

  // Group matched segments by expected lineId to detect repetitions and select primary
  const byLineId = new Map();
  for (const seg of segmentsWithBestMatch) {
    if (!seg.matchedLineId) continue;
    const list = byLineId.get(seg.matchedLineId) ?? [];
    list.push(seg);
    byLineId.set(seg.matchedLineId, list);
  }

  const missing = [];
  const repeated = [];
  const matchedPrimary = [];

  for (const exp of indexedExpected) {
    const hits = byLineId.get(exp.id) ?? [];
    if (hits.length === 0) {
      missing.push({ lineId: exp.id, seq: exp.seq, text: exp.text });
      continue;
    }
    // Prefer exact match, then highest similarity, then latest retake
    const rankedHits = [...hits].sort((a, b) => {
      if (b.similarity !== a.similarity) return b.similarity - a.similarity;
      return b.segmentIndex - a.segmentIndex;
    });
    const primary = rankedHits[0];
    matchedPrimary.push(primary);

    if (hits.length > 1) {
      repeated.push({
        lineId: exp.id,
        count: hits.length,
        segmentIndices: hits.map((h) => h.segmentIndex),
        chosenSegmentIndex: primary.segmentIndex,
      });
      for (const hit of hits) {
        if (hit.segmentIndex !== primary.segmentIndex) {
          hit.isDuplicateRetake = true;
        }
      }
    }
  }

  // Detect reordered primary segments relative to expectedIndex order
  const orderedBySpoken = [...matchedPrimary].sort((a, b) => a.segmentIndex - b.segmentIndex);
  const reordered = [];
  let maxExpectedSeen = -1;
  for (const item of orderedBySpoken) {
    if (item.expectedIndex < maxExpectedSeen) {
      reordered.push({
        lineId: item.matchedLineId,
        segmentIndex: item.segmentIndex,
        expectedIndex: item.expectedIndex,
        previousMaxExpectedIndex: maxExpectedSeen,
      });
      item.isReordered = true;
    } else {
      maxExpectedSeen = item.expectedIndex;
      item.isReordered = false;
    }
  }

  const wrong = segmentsWithBestMatch.filter(
    (s) => s.status === "wrong" || s.status === "matched-with-word-diffs",
  );

  return {
    segments: segmentsWithBestMatch,
    matchedPrimary,
    missing,
    repeated,
    reordered,
    wrong,
    summary: {
      expectedCount: indexedExpected.length,
      heardCount: heardSegments.length,
      matchedCount: matchedPrimary.length,
      missingCount: missing.length,
      repeatedCount: repeated.length,
      reorderedCount: reordered.length,
      wrongCount: wrong.length,
    },
  };
}
