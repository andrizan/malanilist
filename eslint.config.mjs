import tsParser from '@typescript-eslint/parser'
import typescriptPlugin from '@typescript-eslint/eslint-plugin'
import solidPlugin from 'eslint-plugin-solid'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import importPlugin from 'eslint-plugin-import'
import prettierPlugin from 'eslint-config-prettier'

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'src/vite-env.d.ts', 'vite.config.ts'], // Ignore specific directories
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser, // Changed from string to imported parser object
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.app.json', // Ensure this path is correct
        tsconfigRootDir: '.',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      solid: solidPlugin,
      'jsx-a11y': jsxA11yPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'no-unused-vars': [
        'error',
        { vars: 'all', args: 'after-used', ignoreRestSiblings: true, argsIgnorePattern: '^_' },
      ],
      quotes: ["error", "single"]
    },
    settings: {
      solid: { version: 'detect' },
      'import/resolver': {
        typescript: true,
        node: {
          paths: ['src'],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
]
