import { createBaseEslintConfig } from "./tools/eslint/base-config.mjs";

export default createBaseEslintConfig({
  files: ["**/*.{ts,tsx,js,cjs,mjs}"],
  includeTests: true,
  ignores: [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/.turbo/**",
    "**/build/**",
    "**/coverage/**",
  ],
});
