/*global expect*/
describe('within assertion', () => {
  it('asserts a number within a range', () => {
    expect(0, 'to be within', 0, 4);
    expect(1, 'to be within', 0, 4);
    expect(4, 'to be within', 0, 4);
    expect('b', 'to be within', 'a', 'c');
    expect(-1, 'not to be within', 0, 4);
    expect(5, 'not to be within', 0, 4);
    expect('z', 'not to be within', 'a', 'c');
  });

  it('throws when the assertion fails', () => {
    expect(
      () => {
        expect(4, 'not to be within', 0, 4);
      },
      'to throw exception',
      'expected 4 not to be within 0..4'
    );
    expect(
      () => {
        expect(null, 'not to be within', 0, 4);
      },
      'to throw exception',
      'expected null not to be within 0, 4\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <null> not to be within <number> <number>\n' +
        '  did you mean:\n' +
        '    <number> [not] to be within <number> <number>\n' +
        '    <string> [not] to be within <string> <string>'
    );
  });

  it('throws with the correct error message when the end points are strings', () => {
    expect(
      () => {
        expect('a', 'to be within', 'c', 'd');
      },
      'to throw exception',
      "expected 'a' to be within 'c'..'d'"
    );
  });
});
