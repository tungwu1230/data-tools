import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Pure-JS modules (Dataset, merge engine) are tested in the node environment —
// no DOM needed. The react plugin is kept so .jsx test files resolve if added later.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{js,jsx}"],
  },
});
