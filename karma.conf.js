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

    browsers: ['ChromeHeadlessNoSandbox', 'ie11'],

    client: {
      mocha: {
        reporter: 'html'
      }
    },

    browserStack: {
      video: false,
      project: 'unexpected'
    },

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      },
      ie11: {
        base: 'BrowserStack',
        browser: 'IE',
        browser_version: '11',
        os: 'Windows',
        os_version: '7'
      }
    },

    reporters: ['dots', 'BrowserStack']
  });
};
