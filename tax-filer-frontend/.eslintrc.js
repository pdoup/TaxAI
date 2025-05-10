// tax-filer-frontend/.eslintrc.js
module.exports = {
  env: {
    node: true,
    browser: true,
    es2021: true,
    jest: true, // For Jest global variables
  },
  extends: [
    'eslint:recommended', // Basic ESLint recommendations
    'plugin:react/recommended', // React-specific linting rules
    'plugin:react-hooks/recommended', // Rules for React Hooks
    'plugin:jsx-a11y/recommended', // Accessibility rules for JSX
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y',
  ],
  rules: {
    // React specific rules
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',

    // General rules
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Warn about unused variables
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // Allow console in dev, warn in prod
    'indent': ['warn', 2, { SwitchCase: 1 }], // Enforce 2-space indentation
    'quotes': ['warn', 'single'], // Enforce single quotes
    'semi': ['warn', 'always'], // Require semicolons

    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
  },
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
  },
  ignorePatterns: ['node_modules/', 'build/', 'dist/', 'public/'], // Directories to ignore
};
