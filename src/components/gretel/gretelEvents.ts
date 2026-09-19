/**
 * Global event emitter for Gretel animation system.
 * Provides a centralized way to trigger Gretel reactions from anywhere in the app.
 */

export type GretelEventName =
  | "mount"
  | "correct"
  | "wrong"
  | "hint-show"
  | "hint-hide"
  | "complete"
  | "talk-start"
  | "talk-stop"
  | "page-flip";

type EventListener = () => void;

class SimpleEmitter {
  private listeners: Map<GretelEventName, Set<EventListener>> = new Map();

  on(eventName: GretelEventName, listener: EventListener): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventName)?.delete(listener);
    };
  }

  emit(eventName: GretelEventName): void {
    this.listeners.get(eventName)?.forEach((listener) => listener());
  }
}

// Global singleton instance
export const gretelEmitter = new SimpleEmitter();

// Convenience function to emit events
export function gretelEvent(name: GretelEventName): void {
  gretelEmitter.emit(name);
}
