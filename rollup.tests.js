module.exports = {
  input: 'build/test/**/*.js',
  output: {
    format: 'esm'
  },
  plugins: require('rollup-plugin-multi-entry')({ exports: false })
};
