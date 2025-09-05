import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  outDir: 'lib',
  dts: {
    sourcemap: true,
  },
  clean: false,
});
