export default {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 80,
  plugins: ['prettier-plugin-tailwindcss'],
  proseWrap: 'always',
  overrides: [
    // One line per register entry: editors soft-wrap these documents.
    { files: 'documentation/**/*.md', options: { proseWrap: 'preserve' } },
  ],
};
