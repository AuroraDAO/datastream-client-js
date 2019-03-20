module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: './packages',
    project: 'tsconfig.base.json',
  },
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  rules: {
    '@typescript-eslint/no-use-before-define': 'off',
    // cant handle Category$Name at the moment, although
    // pascal case should be enforced.
    '@typescript-eslint/class-name-casing': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'consistent-return': 'off',
    'no-restricted-syntax': 'off',
    'no-multi-assign': 'off',
    'no-use-before-define': 'off',
    'no-console': 'off',
    'no-underscore-dangle': 'off',
    // typescript type imports suffer from this
    'import/no-cycle': 'off',
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['dev/**'] },
    ],
  },
  plugins: ['import', 'promise', 'prettier', '@typescript-eslint'],
  settings: {
    'import/extensions': ['.ts', '.tsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        directory: './packages/tsconfig.base.json',
      },
    },
  },
};
