module.exports = {
  root: false,
  plugins: ['markdown'],
  rules: {
    // Some snippets reference variables from previous ones
    // but eslint-plugin-markdown lints them independently.
    // Disable the rules that this causes trouble with:
    'no-unused-vars': 0,
    'no-undef': 0,
  },
  parserOptions: {
    sourceType: 'script', // Otherwise globalReturn won't work, we use that for the async snippets
  },
};
