import { createBaseEslintConfig } from "../../tools/eslint/base-config.mjs";

export default createBaseEslintConfig({
  files: ["**/*.{ts,tsx,js,jsx}"],
  extraRules: {
    // Désactiver la règle set-state-in-effect pour le playground
    "react-hooks/set-state-in-effect": "off",
  },
  ignores: [
    "**/node_modules/**",
    "**/.next/**",
    "**/.turbo/**",
    "**/dist/**",
    "**/build/**",
  ],
});
