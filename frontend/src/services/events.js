/**
 * Lightweight Client Event Bus
 * ----------------------------
 * Replaces the obsolete in-memory mock database event emitter.
 * Provides real-time re-rendering triggers for React components when
 * mutations happen (e.g. toggling a favorite, updating profile, adding listing).
 */

const listeners = new Set();
let version = 0;

export function getVersion() {
  return version;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emit(event = 'update') {
  version += 1;
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (err) {
      console.error('Error in event listener:', err);
    }
  });
}
