import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly'
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin
    },
    rules: {
      // React rules
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-key': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      
      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Accessibility rules
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      
      // General JavaScript rules
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-undef': 'error',
      'no-redeclare': 'error',
      'no-unreachable': 'error',
      'no-constant-condition': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
      'no-dupe-class-members': 'error',
      'no-dupe-else-if': 'error',
      'no-duplicate-imports': 'error',
      'no-empty': 'warn',
      'no-extra-semi': 'error',
      'no-irregular-whitespace': 'error',
      'no-multiple-empty-lines': ['error', { max: 2 }],
      'no-trailing-spaces': 'error',
      'no-unexpected-multiline': 'error',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'comma-dangle': ['error', 'never'],
      'indent': ['error', 2],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'space-before-function-paren': ['error', 'always'],
      'space-before-blocks': 'error',
      'keyword-spacing': 'error',
      'space-infix-ops': 'error',
      'eol-last': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }]
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    files: ['src/main.js', 'src/services/**/*.js'],
    languageOptions: {
      globals: {
        // Electron globals
        ipcMain: 'readonly',
        ipcRenderer: 'readonly',
        shell: 'readonly',
        dialog: 'readonly',
        app: 'readonly',
        BrowserWindow: 'readonly',
        Menu: 'readonly',
        Tray: 'readonly',
        Notification: 'readonly',
        clipboard: 'readonly',
        nativeImage: 'readonly',
        screen: 'readonly',
        desktopCapturer: 'readonly',
        webContents: 'readonly',
        session: 'readonly',
        protocol: 'readonly',
        powerMonitor: 'readonly',
        powerSaveBlocker: 'readonly',
        globalShortcut: 'readonly',
        inAppPurchase: 'readonly',
        net: 'readonly',
        netLog: 'readonly',
        contentTracing: 'readonly',
        crashReporter: 'readonly',
        autoUpdater: 'readonly'
      }
    },
    rules: {
      'no-console': 'off', // Allow console in main process
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'dist-renderer/**',
      'build/**',
      '*.min.js',
      'coverage/**',
      '.git/**',
      'scripts/**',
      '*.config.js',
      'vite.config.js',
      'tailwind.config.js',
      'postcss.config.cjs'
    ]
  }
];
