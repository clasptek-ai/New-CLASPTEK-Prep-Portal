const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const globals = require('globals');

module.exports = tseslint.config(
  // 1. Global Ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/reports/**',
      '**/public/**',
      '**/generated/**',
      '**/*.min.js',
      '**/*.d.ts',
    ],
  },

  // 2. Base ESLint and TypeScript recommended rules for all JS/TS files
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // 3. Defaults for all source code
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.es2021,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },

  // 4. Browser / React / Next.js Application Source Code & Monorepo Packages
  {
    files: ['apps/web/src/**/*.{js,jsx,ts,tsx}', 'packages/**/src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },

  // 5. Next.js API Routes (Node environment, allow dynamic imports/require)
  {
    files: ['apps/web/src/app/api/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  // 6. Node Scripts, Utilities, Database, Datasets, Scratch, Migrations, Tooling & Configs
  {
    files: [
      'scripts/**/*.{js,cjs,mjs,ts,cts,mts}',
      'scratch/**/*.{js,cjs,mjs,ts,cts,mts}',
      'database/**/*.{js,cjs,mjs,ts,cts,mts}',
      'datasets/**/*.{js,cjs,mjs,ts,cts,mts}',
      'archive/**/*.{js,cjs,mjs,ts,cts,mts}',
      '*.config.{js,cjs,mjs,ts}',
      '**/*.config.{js,cjs,mjs,ts}',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      'no-undef': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // 7. Test Files (Vitest / Jest / Architecture tests)
  {
    files: ['tests/**/*.{js,jsx,ts,tsx}', '**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.vitest,
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
        },
      ],
    },
  }
);
