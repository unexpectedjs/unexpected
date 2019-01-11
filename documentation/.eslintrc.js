module.exports = {
  root: false,
  plugins: ['markdown'],
  globals: {
    expect: false
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
