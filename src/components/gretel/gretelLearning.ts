/** Deterministic teaching policy; pose animation remains in gretelMachine. */
export type LearningState = { errors: number; assisted: boolean; retryPending: boolean; mastered: boolean };
export type LearningInput = 'wrong' | 'hint' | 'correct' | 'complete' | 'retry';
export type LearningReaction = 'cue' | 'hint' | 'demonstration' | 'independent-retry' | 'success' | 'mastery' | null;
export const freshLearningState = (): LearningState => ({ errors: 0, assisted: false, retryPending: false, mastered: false });
export function advanceLearning(state: LearningState, input: LearningInput): { state: LearningState; reaction: LearningReaction } {
  if (input === 'retry') return { state: { ...state, errors: 0, assisted: false, retryPending: false }, reaction: null };
  if (state.retryPending) return { state, reaction: null };
  if (input === 'wrong' || input === 'hint') {
    const errors = input === 'wrong' ? state.errors + 1 : Math.max(2, state.errors);
    const reaction = errors === 1 ? 'cue' : errors === 2 ? 'hint' : 'demonstration';
    return { state: { ...state, errors, assisted: state.assisted || errors >= 2, mastered: false }, reaction };
  }
  if ((input === 'correct' || input === 'complete') && state.assisted) {
    return { state: { ...state, retryPending: true }, reaction: 'independent-retry' };
  }
  if (input === 'correct') {
    return { state: { ...state, errors: 0 }, reaction: 'success' };
  }
  if (input === 'complete' && !state.assisted && !state.mastered) {
    return { state: { ...state, mastered: true }, reaction: 'mastery' };
  }
  return { state, reaction: null };
}
export const REACTION_TEXT = {
  cue: 'Mira otra vez y escucha el sonido inicial.',
  hint: 'Mira la pista marcada. Escucha y vuelve a intentar.',
  demonstration: 'Observa el ejemplo marcado. Después lo harás sin ayuda.',
  'independent-retry': 'Lo hicimos con ayuda. Ahora inténtalo tú, sin la pista.',
  success: '¡Lo lograste por tu cuenta!',
  mastery: '¡Actividad completada! Muy buen trabajo.',
} as const;
