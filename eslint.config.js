import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import ts_parser from "@typescript-eslint/parser";

export default [
    { ignores: ["dist"] },
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            parser: ts_parser,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: "latest",
                ecmaFeatures: { jsx: true },
                sourceType: "module",
                // parser: "@typescript-eslint/parser",
                // project: ["./tsconfig.node.json", "./tsconfig.app.json"],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        settings: { react: { version: "18.3" } },
        plugins: {
            react,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...react.configs["jsx-runtime"].rules,
            ...reactHooks.configs.recommended.rules,
            "react/jsx-no-target-blank": "off",
            "react-refresh/only-export-components": ["warn", { allowConstantExport: true },],
            "no-unused-vars": "error",
            "indent": ["error", 4],
            "react/jsx-indent": ["error", 4],
            "semi": ["error", "always", { "omitLastInOneLineBlock": true }],
            "no-trailing-spaces":"error",
            "comma-dangle": "off",
            "jsx-quotes": ["error", "prefer-double"],
            "quotes": ["error", "double"],
            "function-paren-newline": ["error", "consistent"],
            "max-statements-per-line": ["error", { "max": 1 }],
            "array-element-newline": ["error", { "multiline": true, "minItems": 4 }],
            "array-bracket-newline": ["error", { "multiline": true }],
            "react/jsx-max-props-per-line": [1, { "maximum": 4 }],
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "error",
            "newline-per-chained-call": ["error", { "ignoreChainWithDepth": 2 }],
            "react/no-unknown-property": ["off", { "ignore": ["JSX"] }],
        },
    },
];
