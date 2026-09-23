import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Cloudflare Quick Tunnels generate a different temporary hostname each run.
    allowedHosts: true,
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
