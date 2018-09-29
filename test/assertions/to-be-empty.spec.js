/*global expect*/
describe('empty assertion', () => {
  it('asserts the array-like objects have a non-zero length', () => {
    expect([], 'to be empty');
    expect('', 'to be empty');
    expect([1, 2, 3], 'not to be empty');
    expect('foobar', 'not to be empty');
    expect([1, 2, 3], 'to be non-empty');
  });

  it('asserts that objects (i.e. {}) are empty', () => {
    expect({}, 'to be empty');
    expect({ a: 'b' }, 'not to be empty');
  });

  it('throws when the assertion fails', () => {
    expect(
      () => {
        expect([1, 2, 3], 'to be empty');
      },
      'to throw exception',
      'expected [ 1, 2, 3 ] to be empty'
    );

    expect(
      () => {
        expect('', 'to be non-empty');
      },
      'to throw exception',
      "expected '' to be non-empty"
    );

    expect(
      () => {
        expect(null, 'to be empty');
      },
      'to throw exception',
      'expected null to be empty\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <null> to be empty\n' +
        '  did you mean:\n' +
        '    <object> [not] to be empty\n' +
        '    <string|array-like> [not] to be empty'
    );

    expect(
      () => {
        expect({ a: 'b' }, 'to be empty');
      },
      'to throw exception',
      "expected { a: 'b' } to be empty" +
        '\n' +
        '\n' +
        '{\n' +
        "  a: 'b' // should be removed\n" +
        '}'
    );

    expect(
      () => {
        expect({}, 'not to be empty');
      },
      'to throw exception',
      'expected {} not to be empty'
    );
  });
});
