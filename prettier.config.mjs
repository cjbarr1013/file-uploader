/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */

const config = {
  arrowParens: "always",
  bracketSpacing: true,
  embeddedLanguageFormatting: "auto",
  endOfLine: "lf",
  experimentalTernaries: true,
  htmlWhitespaceSensitivity: "css",
  plugins: ["prettier-plugin-tailwindcss"],
  printWidth: 80,
  proseWrap: "preserve",
  quoteProps: "as-needed",
  semi: true,
  singleQuote: true,
  trailingComma: "es5",
  tabWidth: 2,
  tailwindConfig: "./tailwind.config.js",
  overrides: [
    {
      files: "*.ejs",
      options: {
        parser: "html",
      },
    },
  ],
};

export default config;
