/* global unexpected:true, expect:true, expectWithUnexpectedMagicPen:true, weknowhow, jasmine */
/* eslint no-unused-vars: "off" */
const unexpected =
  typeof window === 'undefined' || !window.weknowhow
    ? require('../lib/').clone()
    : window.weknowhow.expect.clone();

unexpected.output.preferredWidth = 80;

unexpected
  .addAssertion(
    '<any> to inspect as <string>',
    function (expect, subject, value) {
      expect(expect.inspect(subject).toString()).toEqual(value);
    }
  )
  .addAssertion(
    '<any> when delayed a little bit <assertion>',
    function (expect, subject) {
      return expect.promise(function (run) {
        setTimeout(
          run(function () {
            return expect.shift();
          }),
          1
        );
      });
    }
  )
  .addAssertion(
    '<any> when delayed <number> <assertion>',
    function (expect, subject, value) {
      return expect.promise(function (run) {
        setTimeout(
          run(function () {
            return expect.shift();
          }),
          value
        );
      });
    }
  );

const expect = unexpected.clone();

const expectWithUnexpectedMagicPen = unexpected
  .clone()
  .use(
    typeof weknowhow === 'undefined'
      ? require('unexpected-magicpen')
      : weknowhow.unexpectedMagicPen
  );

(function (root) {
  // expose require globals
  root.unexpected = unexpected;
  root.expect = expect;
  root.expectWithUnexpectedMagicPen = expectWithUnexpectedMagicPen;

  if (!root.setImmediate) {
    // eslint-disable-next-line no-global-assign
    root.setImmediate = function (cb) {
      setTimeout(cb, 0);
    };
  }

  if (root.jasmine) {
    root.jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
  }
})(typeof window !== 'undefined' ? window : global);
