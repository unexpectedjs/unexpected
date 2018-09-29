/*global unexpected:true, expect:true, expectWithUnexpectedMagicPen:true, setImmediate:true, weknowhow, jasmine*/
/* eslint no-unused-vars: "off" */
unexpected =
  typeof weknowhow === 'undefined'
    ? require('../lib/').clone()
    : weknowhow.expect.clone();

unexpected.output.preferredWidth = 80;

unexpected
  .addAssertion('<any> to inspect as <string>', (expect, subject, value) => {
    expect(expect.inspect(subject).toString(), 'to equal', value);
  })
  .addAssertion(
    '<any> when delayed a little bit <assertion>',
    (expect, subject) => {
      return expect.promise(run => {
        setTimeout(
          run(() => {
            return expect.shift();
          }),
          1
        );
      });
    }
  )
  .addAssertion(
    '<any> when delayed <number> <assertion>',
    (expect, subject, value) => {
      return expect.promise(run => {
        setTimeout(
          run(() => {
            return expect.shift();
          }),
          value
        );
      });
    }
  );

expect = unexpected.clone();

expectWithUnexpectedMagicPen = unexpected
  .clone()
  .use(
    typeof weknowhow === 'undefined'
      ? require('unexpected-magicpen')
      : weknowhow.unexpectedMagicPen
  );

if (typeof setImmediate !== 'function') {
  setImmediate = function(cb) {
    setTimeout(cb, 0);
  };
}

if (typeof jasmine !== 'undefined') {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
}
