import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
    {
        files: ['**/*.ts'], // Target TypeScript files
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
            '@typescript-eslint/no-explicit-any': 'error',
            'no-console': 'error',
            indent: ['error', 2, { SwitchCase: 1 }],
        },
        env: {
            node: true,
            jest: true,
        },
        ignores: ["**/coverage", "**/templates"],
        overrides: [
            {
                files: ['test/**/*.ts'],
                env: {
                    jest: true,
                },
                rules: {
                    // add here any rules specific to test files
                },
            },
            {
                extends: ['plugin:@typescript-eslint/disable-type-checked'],
                files: ['./**/*.js'],
            },
        ],
    },
]
