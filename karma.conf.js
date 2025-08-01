module.exports = function (config) {
  config.set({
    frameworks: ['mocha'],

    exclude: ['build/test/external.spec.js'],

    files: [
      'vendor/rsvp.js',
      'vendor/unexpected-magicpen.min.js',
      'build/test/promisePolyfill.js',
      'unexpected.js',
      'build/test/common.js',
      'build/test/**/*.spec.js',
    ],

    browsers: ['ChromeHeadlessNoSandbox', 'ie11'],

    browserDisconnectTimeout: '360000',
    browserNoActivityTimeout: '360000',

    client: {
      mocha: {
        reporter: 'html',
        timeout: 360000,
      },
    },

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
    },

    reporters: ['dots'],
  });
};
