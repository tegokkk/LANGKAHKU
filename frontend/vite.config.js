import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  server: {
    strictPort: true,
    proxy: {
      "/api":
        loadEnv(mode, process.cwd(), "").VITE_API_TARGET ||
        "http://127.0.0.1:3001",
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.js"],
    testTimeout: 15000,
  },
}));
