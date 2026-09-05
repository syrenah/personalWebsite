import js from '@eslint/js';
import react from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    ignores: ['dist', 'node_modules']
  },

  js.configs.recommended,

  {
    files: ['**/*.{js,jsx}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },

      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        FileReader: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly'
      }
    },

    plugins: {
      react,
      import: importPlugin
    },

    settings: {
      react: {
        version: 'detect'
      }
    },

    rules: {
      ...react.configs.recommended.rules,

      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Tell ESLint to detect missing imports
      'import/no-unresolved': 'error',

      // Warn when an imported variable doesn't actually exist
      'no-undef': 'error',

      // Unused variables are allowed
      'no-unused-vars': 'off'
    }
  }
];