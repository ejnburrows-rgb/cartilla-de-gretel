import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gretelReducer, canTransition } from '../gretelMachine';
import type { GretelState } from '../gretelMachine';

describe('GretelMachine', () => {

  it('canTransition: validates legal transitions', () => {
    expect(canTransition('boot', { type: 'INIT' })).toBe(true);
    expect(canTransition('idle', { type: 'BLINK' })).toBe(true);
    expect(canTransition('idle', { type: 'SPEAK_START' })).toBe(true);
    expect(canTransition('talking', { type: 'SPEAK_STOP' })).toBe(true);
    expect(canTransition('waving', { type: 'IDLE' })).toBe(true);
  });

  it('canTransition: rejects illegal transitions', () => {
    expect(canTransition('boot', { type: 'IDLE' })).toBe(false);
    expect(canTransition('idle', { type: 'SPEAK_STOP' })).toBe(false);
    
    // Conflicting event test: WAVE during talking
    expect(canTransition('talking', { type: 'WAVE' })).toBe(false);
  });

  it('gretelReducer: handles legal transitions', () => {
    expect(gretelReducer('boot', { type: 'INIT' })).toBe('idle');
    expect(gretelReducer('idle', { type: 'SPEAK_START' })).toBe('talking');
    expect(gretelReducer('talking', { type: 'SPEAK_STOP' })).toBe('idle');
    expect(gretelReducer('idle', { type: 'WAVE' })).toBe('waving');
  });

  it('gretelReducer: applies conflict policy (heal to idle) on illegal transitions', () => {
    // Policy: Invalid transitions must log a warning and keep the current state or heal to idle
    // We chose: heal to idle
    const nextState = gretelReducer('talking', { type: 'WAVE' });
    expect(nextState).toBe('idle');
  });

  it('gretelReducer: handles missing asset recovery (ASSET_ERROR)', () => {
    // ASSET_ERROR from transient states heals to error
    expect(gretelReducer('talking', { type: 'ASSET_ERROR' })).toBe('error');
    expect(gretelReducer('idle', { type: 'ASSET_ERROR' })).toBe('error');
    
    // Recovery via RESET
    expect(gretelReducer('error', { type: 'RESET' })).toBe('idle');
  });

  it('gretelReducer: SPEAK_START + SPEAK_STOP returns to idle', () => {
    let state: GretelState = 'idle';
    state = gretelReducer(state, { type: 'SPEAK_START' });
    expect(state).toBe('talking');
    state = gretelReducer(state, { type: 'SPEAK_STOP' });
    expect(state).toBe('idle');
  });
});
