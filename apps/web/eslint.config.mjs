import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

// eslint-config-next 16 sudah mengekspor flat config langsung, jadi FlatCompat
// tidak dipakai — selain tak perlu, pembungkus itu juga gagal pada konfigurasi
// ini karena plugin react di dalamnya punya referensi melingkar.
const config = [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default config;
