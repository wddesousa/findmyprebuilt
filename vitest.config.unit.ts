import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    include: ["**/*.test.ts*", "!tests"],
    setupFiles: ["app/singleton.ts"],
    environment: "jsdom",
  },
});
