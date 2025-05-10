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
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', 'jsx-a11y', 'prettier'],
  rules: {
    // React specific rules
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    quotes: ['off', 'single', { avoidEscape: false }], // Enforce single quotes
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // Allow console in dev, warn in prod
    // General rules
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Warn about unused variables
    indent: ['warn', 2, { SwitchCase: 1 }], // Enforce 2-space indentation
    semi: ['warn', 'always'], // Require semicolons
    'prettier/prettier': ['warn', {}, { usePrettierrc: true }],
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
