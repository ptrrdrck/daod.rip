const browserGlobals = {
  window: "readonly",
  document: "readonly",
  localStorage: "readonly",
  navigator: "readonly",
  location: "readonly",
  console: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  getComputedStyle: "readonly",
  Node: "readonly",
  URLSearchParams: "readonly",
};

const nodeGlobals = {
  console: "readonly",
  process: "readonly",
  URL: "readonly",
};

export default [
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: browserGlobals,
    },
    rules: { "no-undef": "error", "no-unused-vars": "warn" },
  },
  {
    /* tools/ runs in Node only: it reads the corpus modules and prints. */
    files: ["tools/**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: nodeGlobals,
    },
    rules: { "no-undef": "error", "no-unused-vars": "warn" },
  },
  {
    /* Test files are Node modules, but the bodies of page.evaluate()
     * callbacks run in the browser, so both sets of globals are in play. */
    files: ["test/**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...nodeGlobals, ...browserGlobals },
    },
    rules: { "no-undef": "error", "no-unused-vars": "warn" },
  },
];
