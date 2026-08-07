// @ts-nocheck -- plain JS project; window.storage is a runtime host-env API, not a real DOM type
import React from "react";
import ReactDOM from "react-dom/client";
import CsvMergeWorkbench from "./CsvMergeWorkbench.jsx";
import { createLocalStorageAdapter } from "./storage/localStorageAdapter.js";

// CsvMergeWorkbench was prototyped against a host environment that exposes
// window.storage as a persisted key-value store. Prefer that when present; in a
// plain browser, fall back to a localStorage-backed adapter. The chosen adapter
// is threaded down to useCollections, so nothing reaches for a global.
const storage = window.storage || createLocalStorageAdapter();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CsvMergeWorkbench storage={storage} />
  </React.StrictMode>
);
