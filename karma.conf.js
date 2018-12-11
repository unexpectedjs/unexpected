module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],

    exclude: ['build/test/external.spec.js'],

    files: [
      'vendor/es5-shim.js',
      'vendor/es5-sham.js',
      'vendor/rsvp.js',
      'vendor/unexpected-magicpen.min.js',
      'build/test/promisePolyfill.js',
      'unexpected.js',
      'build/test/common.js',
      'build/test/**/*.spec.js'
    ],

    browsers: ['ChromeHeadlessNoSandbox'],

    client: {
      mocha: {
        reporter: 'html'
      }
    },

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },

    reporters: ['progress']
  });
};
