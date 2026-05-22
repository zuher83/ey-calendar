import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

const reactVersion = "19.2.6";

const defaultMainRules = {
  ...typescript.configs.recommended.rules,
  ...react.configs.recommended.rules,
  ...reactHooks.configs.recommended.rules,
  "react/react-in-jsx-scope": "off",
  "react/prop-types": "off",
  "no-undef": "off",
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/no-unused-vars": [
    "warn",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
    },
  ],
};

const defaultTestRules = {
  ...typescript.configs.recommended.rules,
  ...react.configs.recommended.rules,
  ...reactHooks.configs.recommended.rules,
  "react/react-in-jsx-scope": "off",
  "react/prop-types": "off",
  "@typescript-eslint/no-explicit-any": "warn",
};

export function createBaseEslintConfig({
  files,
  ignores,
  extraRules = {},
  includeTests = false,
  testFiles = ["**/__tests__/**/*.{ts,tsx}", "**/*.test.{ts,tsx}"],
  testExtraRules = {},
}) {
  const config = [
    js.configs.recommended,
    {
      files,
      languageOptions: {
        parser: typescriptParser,
        parserOptions: {
          ecmaVersion: "latest",
          sourceType: "module",
          ecmaFeatures: {
            jsx: true,
          },
        },
        globals: {
          ...globals.browser,
          ...globals.node,
          ...globals.es2021,
        },
      },
      plugins: {
        "@typescript-eslint": typescript,
        react,
        "react-hooks": reactHooks,
      },
      rules: {
        ...defaultMainRules,
        ...extraRules,
      },
      settings: {
        react: {
          // eslint-plugin-react 7.37.5 is not compatible with ESLint 10 auto-detection.
          version: reactVersion,
        },
      },
    },
  ];

  if (includeTests) {
    config.push({
      files: testFiles,
      languageOptions: {
        parser: typescriptParser,
        parserOptions: {
          ecmaVersion: "latest",
          sourceType: "module",
          ecmaFeatures: {
            jsx: true,
          },
        },
        globals: {
          describe: "readonly",
          it: "readonly",
          test: "readonly",
          expect: "readonly",
          jest: "readonly",
          beforeEach: "readonly",
          afterEach: "readonly",
          beforeAll: "readonly",
          afterAll: "readonly",
        },
      },
      plugins: {
        "@typescript-eslint": typescript,
        react,
        "react-hooks": reactHooks,
      },
      rules: {
        ...defaultTestRules,
        ...testExtraRules,
      },
      settings: {
        react: {
          version: reactVersion,
        },
      },
    });
  }

  config.push({ ignores });

  return config;
}
