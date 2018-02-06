/*global expect*/
describe('to be ok/truthy assertion', function() {
  it('assert that the value is truthy', function() {
    expect(1, 'to be ok');
    expect(true, 'to be ok');
    expect({}, 'to be truthy');
    expect(0, 'not to be ok');
  });

  it('throws when the assertion fails', function() {
    expect(
      function() {
        expect(0, 'to be ok');
      },
      'to throw exception',
      'expected 0 to be ok'
    );
  });

  it('throws with message when the assertion fails', function() {
    expect(
      function() {
        expect(2 < 1, 'to be truthy', '2 < 1');
      },
      'to throw exception',
      "expected false to be truthy 2 < 1'"
    );
  });
});
