// Collections persistence over an injected storage adapter.
//
// This is the testable seam: the async load/save logic lives here with no
// React dependency, so useCollections is just a thin wrapper. The adapter
// follows the window.storage contract — get(key) → { value } | null,
// set(key, value) → bool — so the host environment's own window.storage can be
// passed straight through (see main.jsx).
const DEFAULT_KEY = "csv-merge-collections";

export function createCollectionsStore(storage, key = DEFAULT_KEY) {
  return {
    // Returns the saved collections, or [] when nothing is saved / corrupt /
    // the adapter rejects. Never throws — load failure is treated as "empty".
    async load() {
      try {
        const res = await storage.get(key, false);
        if (res && res.value) return JSON.parse(res.value);
      } catch (e) {
        // no saved sets yet, or corrupt entry — treat as empty
      }
      return [];
    },

    // Persists collections; logs but does not throw on adapter failure.
    async save(collections) {
      try {
        await storage.set(key, JSON.stringify(collections), false);
      } catch (e) {
        console.error("儲存集合失敗", e);
      }
    },
  };
}
