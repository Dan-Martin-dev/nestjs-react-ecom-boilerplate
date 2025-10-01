// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      'src/auth/strategies/facebook.strategy.ts',
      'src/auth/strategies/google.strategy.ts',
      'src/auth/strategies/instagram.strategy.ts',
      'src/auth/strategies/jwt.strategy.ts',
      'src/payments/**/*.ts',
      'test/**/*.ts'
    ],
  },

   // 1. Start with the base recommended configs.
  eslint.configs.recommended,

  // 2. Add the TypeScript configs. 
  // This is an ARRAY of configs that sets up the parser, plugins,
  // and crucially, the parserOptions to use your tsconfig.json.
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },

  // 3. Add Prettier.
  eslintPluginPrettierRecommended,

  // 4. Add ONE final object for your custom overrides and rules.
  // This configuration will apply to the TypeScript files already targeted
  // by the presets above.
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  {
    rules: {
      // Your custom rules go here.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/unbound-method': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'warn',

      // Set to warn for now so we can fix incrementally
      '@typescript-eslint/no-unsafe-assignment': 'warn', 
    },
  },
);