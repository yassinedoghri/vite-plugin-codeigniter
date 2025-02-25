import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: "esm",
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  minify: !options.watch,
}));
