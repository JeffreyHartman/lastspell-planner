import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginVue.configs["vue3-recommended"],
  {
    files: ["**/*.vue"],
    rules: {
      // Any Vue-specific rules
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.vue"],
    rules: {
      // Any TypeScript-specific rules
    },
  },
  eslintConfigPrettier,
];
