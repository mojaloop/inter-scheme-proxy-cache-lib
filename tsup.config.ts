import { defineConfig } from 'tsup';

export default defineConfig({
  format: ['cjs', 'esm'],
  // entry: ['./src/index.ts'],
  entry: ['./src/**/*.ts'],
  outDir: 'dist',
  dts: true,
  sourcemap: true,
  shims: true,
  skipNodeModulesBundle: true,
  clean: true,
});
