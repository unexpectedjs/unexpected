/* global expect */
describe('to have length assertion', () => {
  function toArguments() {
    return arguments;
  }

  it('asserts array .length', () => {
    expect([]).toHaveLength(0);
    expect([1, 2, 3]).toHaveLength(3);
    expect([1, 2, 3]).notToHaveLength(4);
    expect(toArguments(1, 2, 3, 4)).toHaveLength(4);
  });

  it('asserts string .length', () => {
    expect('abc').toHaveLength(3);
    expect('').toHaveLength(0);
  });

  it('assert sparse array length', () => {
    const sparse = [];
    sparse[1] = 'foo';
    expect(function () {
      expect(sparse).toHaveLength(2);
    }).notToThrow();
  });

  it('throws when the assertion fails', () => {
    expect(function () {
      expect([1, 2]).toHaveLength(3);
    }).toThrowException(
      'expected [ 1, 2 ] to have length 3\n' + '  expected 2 to be 3'
    );

    expect(function () {
      expect(null).toHaveLength(4);
    }).toThrowException(
      'expected null to have length 4\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <null> to have length <number>\n' +
        '  did you mean:\n' +
        '    <string|array-like> [not] to have length <number>'
    );

    expect(function () {
      expect({ length: 4 }).toHaveLength(4);
    }).toThrowException(
      'expected { length: 4 } to have length 4\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <object> to have length <number>\n' +
        '  did you mean:\n' +
        '    <string|array-like> [not] to have length <number>'
    );
  });

  if (typeof Buffer !== 'undefined') {
    it('asserts Buffer .length', () => {
      expect(Buffer.from('æ', 'utf-8')).toHaveLength(2);
      expect(Buffer.from([])).toHaveLength(0);
    });
  }

  if (typeof Uint8Array !== 'undefined') {
    it('asserts length for Uint8Array', () => {
      expect(new Uint8Array([0x45, 0x59])).toHaveLength(2);
    });
  }

  if (typeof Uint16Array !== 'undefined') {
    it('asserts length for Uint16Array', () => {
      expect(new Uint16Array([0x4545, 0x5945])).toHaveLength(2);
    });
  }
});
