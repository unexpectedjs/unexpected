module.exports = {
  root: false,
  plugins: ['markdown'],
  globals: {
    expect: true // One of the snippets overwrites the global
  },
  rules: {
    'no-unused-vars': 0,
    'no-undef': 0
  },
  parser: 'esprima',
  parserOptions: {
    tolerant: true
  }
};
