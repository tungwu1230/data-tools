// @ts-nocheck -- plain JS project; window.storage is a runtime shim, not a real DOM type
import { useState, useEffect, useCallback } from "react";
import { nextId } from "../utils/csv.js";

const STORAGE_KEY = "csv-merge-collections";

// global, persisted named column sets ("collections")
export function useCollections() {
  const [collections, setCollections] = useState([]);
  const [collectionsLoaded, setCollectionsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        if (res && res.value) setCollections(JSON.parse(res.value));
      } catch (e) {
        // no saved sets yet
      } finally {
        setCollectionsLoaded(true);
      }
    })();
  }, []);

  const persistCollections = useCallback(async (next) => {
    setCollections(next);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(next), false);
    } catch (e) {
      console.error("儲存集合失敗", e);
    }
  }, []);

  const createCollection = useCallback((name, columns) => {
    persistCollections([...collections, { id: nextId(), name, columns }]);
  }, [collections, persistCollections]);

  const deleteCollection = useCallback((id) => {
    persistCollections(collections.filter((c) => c.id !== id));
  }, [collections, persistCollections]);

  return { collections, collectionsLoaded, createCollection, deleteCollection };
}
