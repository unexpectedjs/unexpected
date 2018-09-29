var expect = require('../lib');

expect.addAssertion(
  '<any> when delayed a little bit <assertion?>',
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
);

it('should magically change', () => {
  return expect('abc', 'when delayed a little bit', 'to equal', 'def');
});
