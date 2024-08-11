// vite.config.js

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  build: {
    sourcemap: true, // Enable source maps for production builds
  },
  resolve: {
    alias: {
      "@": "/src", // Adjust this if your source folder is different
    },
  },
});
