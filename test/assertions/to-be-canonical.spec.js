/*global expect*/
describe('to be a canonical object assertion', function() {
  it('asserts that an object is canonical', function() {
    expect({ a: 123, b: 456 }, 'to be canonical');
  });

  it('asserts that a deep object is canonical', function() {
    expect(
      { a: 123, b: 456, c: [1, 3, 4, { a: 123, b: 456 }] },
      'to be canonical'
    );
  });

  it('works with a circular object', function() {
    var obj = { a: 123, b: {} };
    obj.b.a = obj;
    expect(obj, 'to be canonical');
  });

  it('fails when the assertion fails', function() {
    expect(
      function() {
        expect({ b: 456, a: 123 }, 'to be canonical');
      },
      'to throw exception',
      'expected { b: 456, a: 123 } to be canonical'
    );

    expect(
      function() {
        expect({ foo: { b: 456, a: 123 } }, 'to be canonical');
      },
      'to throw exception',
      'expected { foo: { b: 456, a: 123 } } to be canonical'
    );
  });
});
