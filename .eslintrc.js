module.exports = {
  extends: ['standard', 'prettier', 'prettier/standard'],
  plugins: ['import', 'mocha'],
  env: {
    mocha: true
  },
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/test/**/*.js',
          '**/bootstrap-unexpected-markdown.js'
        ],
        optionalDependencies: false,
        peerDependencies: false
      }
    ],
    'mocha/no-exclusive-tests': 'error',
    'mocha/no-nested-tests': 'error',
    'mocha/no-identical-title': 'error'
  }
};
