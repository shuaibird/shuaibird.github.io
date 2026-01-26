const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const eslintPluginAstro = require("eslint-plugin-astro");

module.exports = [
  js.configs.recommended,

  // TypeScript rules (safe even if you barely use TS)
  ...tseslint.configs.recommended,

  // Astro flat config (IMPORTANT: use flat/recommended)
  ...eslintPluginAstro.configs["flat/recommended"],

  {
    ignores: ["dist/**", ".astro/**", "node_modules/**"],
  },
];
