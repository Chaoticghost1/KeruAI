// vitest.client.config.ts
// Separate Vitest config for client (React) component tests.
// Requires dev deps: @testing-library/react, @testing-library/jest-dom,
// @testing-library/user-event, happy-dom  ->  npm i -D <these>

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./client/test/setup.ts"],
    include: ["client/**/*.test.{ts,tsx}"],
    css: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
});
