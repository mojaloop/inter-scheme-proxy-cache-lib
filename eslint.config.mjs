import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from "globals";

export default [
    {
        files: ['**/*.ts', '**/*.tsx'], // Target TypeScript files
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2022, // Support modern JavaScript
            sourceType: 'module',  // Enable ESModules
            globals: {
                ...globals.node,
            }
        },
        plugins: {
            '@typescript-eslint': ts,
        },
        rules: {
            ...js.configs.recommended.rules, // Include recommended JavaScript rules
            ...ts.configs.recommended.rules, // Include recommended TypeScript rules
            '@typescript-eslint/no-explicit-any': 'off', // Disable "no-explicit-any"
            '@typescript-eslint/no-var-requires': 'off', // Disable "no-var-requires"
            '@typescript-eslint/no-require-imports': 'off', // Disable "no-require-imports"
        },
        ignores: ["**/coverage", "**/templates"]
    },
]