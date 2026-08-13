import { useRef, useEffect, useCallback } from "react";

let nextRequestId = 0;

// Lazily creates a single Worker (src/workers/mergeWorker.js) and exposes a
// request(type, payload) -> Promise interface, routing responses by request
// id instead of by a single onmessage handler — so two callers (useMerge,
// useDataQuality) can share one worker without one's response handler
// clobbering the other's, even if both requests are in flight at once.
export function useSharedWorker() {
  const workerRef = useRef(null);
  const pendingRef = useRef(new Map()); // id -> { resolve, reject }

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      pendingRef.current.clear();
    };
  }, []);

  const request = useCallback((type, payload) => {
    if (!workerRef.current) {
      const worker = new Worker(new URL("../workers/mergeWorker.js", import.meta.url), { type: "module" });
      worker.onmessage = (event) => {
        const pending = pendingRef.current.get(event.data.id);
        if (!pending) return; // superseded — its caller already stopped waiting
        pendingRef.current.delete(event.data.id);
        pending.resolve(event.data.result);
      };
      worker.onerror = (err) => {
        // onerror isn't tied to one request id — reject everything in flight
        // so none of them hang forever waiting for a response that won't come
        for (const { reject } of pendingRef.current.values()) reject(err);
        pendingRef.current.clear();
      };
      workerRef.current = worker;
    }
    const id = ++nextRequestId;
    return new Promise((resolve, reject) => {
      pendingRef.current.set(id, { resolve, reject });
      workerRef.current.postMessage({ id, type, payload });
    });
  }, []);

  return request;
}
