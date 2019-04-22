var expect = require('../lib')
  .clone()
  .addAssertion('<any> to be a number after a (short|long) delay', function(
    expect,
    subject
  ) {
    return expect.promise(function(run) {
      setTimeout(
        run(function() {
          expect(subject, 'to be a number');
        }),
        expect.alternations[0] === 'short' ? 0 : 10
      );
    });
  });

it('should succeed', () => {
  return expect.promise.race([
    expect(42, 'to be a number after a long delay'),
    expect(42, 'to be a number after a short delay')
  ]);
});
