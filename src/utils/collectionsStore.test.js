import { describe, it, expect, vi } from "vitest";
import { createCollectionsStore } from "./collectionsStore.js";

// In-memory adapter — the test substitute for the localStorage adapter.
// Mirrors the window.storage contract: get(key) → { value } | null, set → true.
function createMemoryAdapter(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    async get(key) {
      return map.has(key) ? { value: map.get(key) } : null;
    },
    async set(key, value) {
      map.set(key, value);
      return true;
    },
    _raw(key) {
      return map.get(key);
    },
  };
}

describe("createCollectionsStore — load()", () => {
  it("returns [] when nothing is saved", async () => {
    const store = createCollectionsStore(createMemoryAdapter());
    expect(await store.load()).toEqual([]);
  });

  it("round-trips collections through save() then load()", async () => {
    const adapter = createMemoryAdapter();
    const store = createCollectionsStore(adapter);
    const cols = [
      { id: "1", name: "Countries", columns: ["country", "code"] },
      { id: "2", name: "Metrics", columns: ["revenue"] },
    ];
    await store.save(cols);
    expect(await store.load()).toEqual(cols);
  });

  it("returns [] when the stored value is corrupt JSON", async () => {
    const adapter = createMemoryAdapter({ "csv-merge-collections": "not json {{{" });
    const store = createCollectionsStore(adapter);
    expect(await store.load()).toEqual([]);
  });

  it("returns [] when the adapter rejects (never throws)", async () => {
    const adapter = {
      async get() { throw new Error("boom"); },
      async set() {},
    };
    const store = createCollectionsStore(adapter);
    await expect(store.load()).resolves.toEqual([]);
  });
});

describe("createCollectionsStore — save()", () => {
  it("logs but does not throw when the adapter rejects", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const adapter = {
      async get() { return null; },
      async set() { throw new Error("boom"); },
    };
    const store = createCollectionsStore(adapter);
    await expect(store.save([])).resolves.toBeUndefined();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("writes JSON to the adapter under the storage key", async () => {
    const adapter = createMemoryAdapter();
    const store = createCollectionsStore(adapter);
    await store.save([{ id: "1", name: "A", columns: ["x"] }]);
    expect(adapter._raw("csv-merge-collections")).toBe(
      JSON.stringify([{ id: "1", name: "A", columns: ["x"] }])
    );
  });
});

describe("createCollectionsStore — custom key", () => {
  it("uses the provided key instead of the default", async () => {
    const adapter = createMemoryAdapter();
    const store = createCollectionsStore(adapter, "my-key");
    await store.save([{ id: "1", name: "A", columns: [] }]);
    expect(adapter._raw("my-key")).toBeDefined();
    expect(adapter._raw("csv-merge-collections")).toBeUndefined();
    expect(await store.load()).toEqual([{ id: "1", name: "A", columns: [] }]);
  });
});
