/* global expect */
describe('empty assertion', () => {
  it('asserts the array-like objects have a non-zero length', () => {
    expect([]).toBeEmpty();
    expect('').toBeEmpty();
    expect([1, 2, 3]).notToBeEmpty();
    expect('foobar').notToBeEmpty();
    expect([1, 2, 3]).toBeNonEmpty();
  });

  it('asserts that objects (i.e. {}) are empty', () => {
    expect({}).toBeEmpty();
    expect({ a: 'b' }).notToBeEmpty();
  });

  it('throws when the assertion fails', () => {
    expect(function () {
      expect([1, 2, 3]).toBeEmpty();
    }).toThrowException('expected [ 1, 2, 3 ] to be empty');

    expect(function () {
      expect('').toBeNonEmpty();
    }).toThrowException("expected '' to be non-empty");

    expect(function () {
      expect(null).toBeEmpty();
    }).toThrowException(
      'expected null to be empty\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <null> to be empty\n' +
        '  did you mean:\n' +
        '    <object> [not] to be empty\n' +
        '    <string|array-like> [not] to be empty'
    );

    expect(function () {
      expect({ a: 'b' }).toBeEmpty();
    }).toThrowException(
      "expected { a: 'b' } to be empty" +
        '\n' +
        '\n' +
        '{\n' +
        "  a: 'b' // should be removed\n" +
        '}'
    );

    expect(function () {
      expect({}).notToBeEmpty();
    }).toThrowException('expected {} not to be empty');
  });
});
