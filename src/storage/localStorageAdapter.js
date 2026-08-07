// Production storage adapter backed by localStorage.
//
// Mirrors the window.storage contract the app was prototyped against:
//   get(key) → { value } | null
//   set(key, value) → true
//
// main.jsx prefers a host-provided window.storage when present and only falls
// back to this adapter in a plain browser. Extra positional args (the host
// env's scope flag, passed as the collections store's `false` second arg) are
// accepted and ignored here.
export function createLocalStorageAdapter() {
  return {
    async get(key) {
      const value = localStorage.getItem(key);
      return value === null ? null : { value };
    },
    async set(key, value) {
      localStorage.setItem(key, value);
      return true;
    },
  };
}
