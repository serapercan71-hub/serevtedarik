import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // try/catch'te kullanılmayan hata parametresini sorun sayma
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
    },
  },
  // API dosyaları Vercel'de Node.js ortamında çalışır → Node global'leri tanımlı
  {
    files: ['api/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  // Context dosyaları bilinçli olarak hem Provider hem hook export eder;
  // react-refresh uyarısı bu desende geçerli değil (yalnızca geliştirme HMR ile ilgili)
  {
    files: ['src/context/**/*.jsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
