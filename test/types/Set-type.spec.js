/* global expect */
describe('Set type', () => {
  it('should inspect a Set instance correctly', () => {
    expect(new Set([1, 2]), 'to inspect as', 'new Set([ 1, 2 ])');
  });

  it('should diff two Set instances correctly', () => {
    expect(
      [new Set([1, 2]), new Set([2, 3])],
      'to produce a diff of',
      'new Set([\n' +
        '  1, // should be removed\n' +
        '  2\n' +
        '  // missing 3\n' +
        '])'
    );
  });

  it('should diff two Set instances with complex items correctly', () => {
    expect(
      [
        new Set([1, new Date('2020-01-01T12:34:56.789Z')]),
        new Set([new Date('2020-01-01T12:34:56.789Z'), 3]),
      ],
      'to produce a diff of',
      'new Set([\n' +
        '  1, // should be removed\n' +
        "  new Date('2020-01-01T12:34:56.789Z')\n" +
        '  // missing 3\n' +
        '])'
    );
  });

  describe('equality', () => {
    it('should consider two empty sets equal', () => {
      expect(new Set(), 'to equal', new Set());
    });

    it('should consider two sets with the same primitive item equal', () => {
      expect(new Set(['abc']), 'to equal', new Set(['abc']));
    });

    it('should consider two sets with the same complex item equal', () => {
      expect(
        new Set([new Date('2020-01-01T12:34:56.789Z')]),
        'to equal',
        new Set([new Date('2020-01-01T12:34:56.789Z')])
      );
    });

    it('should consider two sets with a different item unequal', () => {
      expect(new Set(['abc']), 'not to equal', new Set(['def']));
    });

    it('should consider two sets with a common and a different item unequal', () => {
      expect(new Set(['abc', 'def']), 'not to equal', new Set(['abc', 'ghi']));
    });

    it('should consider two sets with a different number of items unequal', () => {
      expect(new Set(['abc']), 'not to equal', new Set(['abc', 'def']));
      expect(new Set(['abc', 'def']), 'not to equal', new Set(['abc']));
    });
  });

  describe('with a subtype that disables indentation', () => {
    const clonedExpect = expect.clone();

    clonedExpect.addType({
      base: 'Set',
      name: 'bogusSet',
      identify(obj) {
        return obj && obj.constructor && obj.constructor.name === 'Set';
      },
      prefix(output) {
        return output;
      },
      suffix(output) {
        return output;
      },
      indent: false,
    });

    it('should not render the indentation when an instance is inspected in a multi-line context', () => {
      expect(
        clonedExpect
          .inspect(
            new Set([
              'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
              'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
            ])
          )
          .toString(),
        'to equal',
        "'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',\n" +
          "'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'"
      );
    });

    it('should not render the indentation when an instance is diffed', () => {
      expect(
        clonedExpect.diff(new Set(['a', 'b']), new Set(['b', 'c'])).toString(),
        'to equal',
        "'a', // should be removed\n" + "'b'\n" + "// missing 'c'"
      );
    });

    it('should not render the indentation when an instance participates in a "to satisfy" diff', () => {
      expect(
        () => {
          clonedExpect(new Set(['aaa', 'bbb']), 'to satisfy', new Set(['foo']));
        },
        'to throw',
        "expected 'aaa', 'bbb' to satisfy 'foo'\n" +
          '\n' +
          "'aaa', // should be removed\n" +
          "'bbb' // should be removed\n" +
          "// missing 'foo'"
      );
    });
  });
});
