// @ts-nocheck -- plain JS project; window.storage is a runtime shim, not a real DOM type
import React from "react";
import ReactDOM from "react-dom/client";
import CsvMergeWorkbench from "./CsvMergeWorkbench.jsx";

// CsvMergeWorkbench was prototyped against a host environment that exposes
// window.storage as a persisted key-value store. A plain browser has no such
// API, so shim it onto localStorage to keep the component unchanged.
if (!window.storage) {
  window.storage = {
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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CsvMergeWorkbench />
  </React.StrictMode>
);
