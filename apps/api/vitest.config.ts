import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    root: '.',
  },
  plugins: [
    // Wajib, bukan sekadar pilihan: dependency injection NestJS membaca
    // metadata tipe konstruktor saat runtime. esbuild (transformer bawaan
    // Vitest) tidak memancarkan metadata itu, sehingga DI gagal tanpa SWC.
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        target: 'es2022',
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
      },
    }),
  ],
});
