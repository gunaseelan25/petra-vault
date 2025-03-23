import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["tests/lib/injection/index.ts"],
  outDir: "tests/lib/injection/build",
  splitting: false,
  sourcemap: false,
  platform: "browser",
  format: ["iife"],
  minify: true,
  shims: true,
  inject: ["tests/lib/injection/shims.ts"],
});
