// Shared helper: drop keys from a file-keyed map when files are removed.
// Returns the same reference when nothing changed so callers can use it inside
// setState without triggering needless re-renders.
export function pruneByKey(map, validIds) {
  let changed = false;
  const next = {};
  for (const k of Object.keys(map)) {
    if (validIds.has(k)) next[k] = map[k];
    else changed = true;
  }
  return changed ? next : map;
}
