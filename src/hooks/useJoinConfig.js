import { useState, useEffect } from "react";
import { pruneByKey } from "../utils/state.js";

// per-file (non-base) join key configuration; drops stale entries when a file is removed
export function useJoinConfig(files) {
  const [joinConfig, setJoinConfig] = useState({});
  const [joinType, setJoinType] = useState("left");

  useEffect(() => {
    const validIds = new Set(files.map((f) => f.id));
    setJoinConfig((prev) => pruneByKey(prev, validIds));
  }, [files]);

  return { joinConfig, setJoinConfig, joinType, setJoinType };
}
