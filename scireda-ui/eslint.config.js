import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactPlugin from 'eslint-plugin-react'
import prettier from 'eslint-config-prettier'

export default [
  { ignores: ['dist/**', '.tsbuild/**', 'playwright.config.d.ts'] },
  { languageOptions: { globals: { ...globals.browser, process: true } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  {
    settings: { react: { version: 'detect' } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  prettier,
]


