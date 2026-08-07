import { useState, useEffect } from "react";

// per-file (non-base) join key configuration; drops stale entries when a file is removed
export function useJoinConfig(files) {
  const [joinConfig, setJoinConfig] = useState({});

  useEffect(() => {
    const validIds = new Set(files.map((f) => f.id));
    setJoinConfig((prev) => {
      let changed = false;
      const next = {};
      Object.keys(prev).forEach((fid) => {
        if (validIds.has(fid)) next[fid] = prev[fid];
        else changed = true;
      });
      return changed ? next : prev;
    });
  }, [files]);

  return { joinConfig, setJoinConfig };
}
