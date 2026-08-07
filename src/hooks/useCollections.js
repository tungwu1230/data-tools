import { useState, useEffect, useCallback, useMemo } from "react";
import { nextId } from "../utils/ids.js";
import { createCollectionsStore } from "../utils/collectionsStore.js";

// global, persisted named column sets ("collections"). The storage adapter is
// injected (threaded from main.jsx) so the hook is testable through its
// interface; the async load/persist logic itself lives in collectionsStore.js.
export function useCollections(storage) {
  const [collections, setCollections] = useState([]);
  const [collectionsLoaded, setCollectionsLoaded] = useState(false);
  const store = useMemo(() => createCollectionsStore(storage), [storage]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await store.load();
      if (!cancelled) {
        setCollections(loaded);
        setCollectionsLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [store]);

  const persistCollections = useCallback(async (next) => {
    setCollections(next);
    await store.save(next);
  }, [store]);

  const createCollection = useCallback((name, columns) => {
    persistCollections([...collections, { id: nextId(), name, columns }]);
  }, [collections, persistCollections]);

  const deleteCollection = useCallback((id) => {
    persistCollections(collections.filter((c) => c.id !== id));
  }, [collections, persistCollections]);

  const updateCollection = useCallback((id, name, columns) => {
    persistCollections(collections.map((c) => (c.id === id ? { ...c, name, columns } : c)));
  }, [collections, persistCollections]);

  return { collections, collectionsLoaded, createCollection, deleteCollection, updateCollection };
}
