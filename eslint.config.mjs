import js from '@eslint/js';
import ts from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default ts.config(
  { ignores: ['dist/**', '.astro/**', 'node_modules/**', '.vercel/**', 'qa-artifacts/**'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...astro.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
  },
);
