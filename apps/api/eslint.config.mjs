import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'generated/**'] },
  ...tseslint.configs.recommended,
  {
    rules: {
      // NestJS banyak memakai konstruktor berparameter dekorator; aturan ini
      // salah tangkap pada pola tersebut.
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);
