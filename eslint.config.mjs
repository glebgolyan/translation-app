import { FlatCompat } from '@eslint/eslintrc';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'coverage/**'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  // Feature-Sliced Design layering: app -> widgets -> features -> entities ->
  // shared. `shared` is the foundation layer and must not import from
  // anything above it — it previously imported from both `entities` and
  // `widgets` (shared/ui/StatusBadge.tsx), which meant any consumer of a
  // "shared" component silently pulled in a whole domain widget.
  {
    files: ['shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/entities/*', '@/features/*', '@/widgets/*', '@/app/*'],
              message: 'shared/ is the base FSD layer — it must not import from entities, features, widgets, or app.',
            },
          ],
        },
      ],
    },
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
];
