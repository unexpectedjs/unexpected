/* global expectWithUnexpectedMagicPen */
describe('to contain assertion', () => {
  const expect = expectWithUnexpectedMagicPen;

  it('should throw an error when one of the arguments is the empty string', () => {
    expect(function () {
      expect('foo').toContain('bar', '');
    }).toThrow("The 'to contain' assertion does not support the empty string");
  });

  it('asserts indexOf for a string', () => {
    expect('hello world').toContain('world');
  });

  it('asserts item equality for an array', () => {
    expect([1, 2]).toContain(1);
    expect([1, 2]).toContain(2, 1);
    expect([{ foo: 123 }]).toContain({ foo: 123 });
  });

  it('throws when the assertion fails', () => {
    expect(function () {
      expect(null).notToContain('world');
    }).toThrow(
      "expected null not to contain 'world'\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <null> not to contain <string>\n' +
        '  did you mean:\n' +
        '    <array-like> [not] to contain <any+>\n' +
        '    <string> [not] to contain <string+>'
    );

    expect(function () {
      expect('hello world').toContain('foo');
    }).toThrowException(
      "expected 'hello world' to contain 'foo'\n\nhello world"
    );

    expect(function () {
      expect('hello world').toContain('hello', 'foo');
    }).toThrowException(
      "expected 'hello world' to contain 'hello', 'foo'\n" +
        '\n' +
        'hello world\n' +
        '^^^^^'
    );

    expect(function () {
      expect([1, 2]).toContain(2, 3);
    }).toThrowException('expected [ 1, 2 ] to contain 2, 3');

    expect(function () {
      expect([{ foo: 123 }]).toContain({ foo: 123 }, { bar: 456 });
    }).toThrowException(
      'expected [ { foo: 123 } ] to contain { foo: 123 }, { bar: 456 }'
    );

    expect(function () {
      expect(1).toContain(1);
    }).toThrowException(
      'expected 1 to contain 1\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <number> to contain <number>\n' +
        '  did you mean:\n' +
        '    <array-like> [not] to contain <any+>\n' +
        '    <array-like> to [only] contain <any+>\n' +
        '    <string> [not] to contain <string+>'
    );
  });

  it('produces a diff showing full and partial matches for each needle when the assertion fails', () => {
    expect(function () {
      expect('foo\nbarquux').toContain('foo\nb', 'quuux');
    }).toThrow(
      expect
        .toHaveMessage(
          "expected 'foo\\nbarquux' to contain 'foo\\nb', 'quuux'\n" +
            '\n' +
            'foo\n' +
            '^^^\n' +
            'barquux\n' +
            '^  ^^^'
        )
        .and('to have ansi diff', function () {
          this.text('foo', ['bgGreen', 'black'])
            .nl()
            .text('b', ['bgGreen', 'black'])
            .text('ar')
            .text('quu', ['bgYellow', 'black'])
            .text('x');
        })
    );
  });

  describe('with the not flag', () => {
    it('produces a useful diff in text mode when a match spans multiple lines', () => {
      expect(function () {
        expect('blahfoo\nbar\nquux').notToContain('foo\nbar\nq');
      }).toThrow(
        expect.it(function (err) {
          expect(err).toHaveMessage(
            "expected 'blahfoo\\nbar\\nquux' not to contain 'foo\\nbar\\nq'\n" +
              '\n' +
              'blahfoo\\n\n' +
              '    ^^^^\n' +
              'bar\\n\n' +
              '^^^^\n' +
              'quux\n' +
              '^'
          );
        })
      );
    });

    it('produces a diff when the array case fails', () => {
      expect(function () {
        expect([1, 2, 3]).notToContain(2);
      }).toThrow(
        'expected [ 1, 2, 3 ] not to contain 2\n' +
          '\n' +
          '[\n' +
          '  1,\n' +
          '  2, // should be removed\n' +
          '  3\n' +
          ']'
      );
    });

    it('produces a diff when the string case fails', () => {
      expect(function () {
        expect('foobarquuxfoo').notToContain('foo');
      }).toThrow(
        "expected 'foobarquuxfoo' not to contain 'foo'\n" +
          '\n' +
          'foobarquuxfoo\n' +
          '^^^       ^^^'
      );
    });
  });

  describe('with the only flag', () => {
    it('should not throw when all items are included in the subject', () => {
      expect(function () {
        expect([{ bar: 456 }, { foo: 123 }]).toOnlyContain(
          { foo: 123 },
          { bar: 456 }
        );
      }).notToThrow();
    });

    it('should not throw when all items are included in the subject and some multiple times', () => {
      expect(function () {
        expect([{ bar: 456 }, { foo: 123 }, { bar: 456 }]).toOnlyContain(
          { foo: 123 },
          { bar: 456 }
        );
      }).notToThrow();
    });

    it('should throw when all items are not included in the subject', () => {
      expect(function () {
        expect([{ bar: 456 }]).toOnlyContain({ foo: 123 }, { bar: 456 });
      }).toThrowException(
        'expected [ { bar: 456 } ] to only contain { foo: 123 }, { bar: 456 }\n' +
          '\n' +
          '[\n' +
          '  { bar: 456 }\n' +
          '  // missing { foo: 123 }\n' +
          ']'
      );
    });

    it('should throw when all items are included in the subject but subject has other items as well', () => {
      expect(function () {
        expect([{ bar: 456 }, { foo: 123 }, { baz: 789 }]).toOnlyContain(
          { foo: 123 },
          { bar: 456 }
        );
      }).toThrowException(
        'expected [ { bar: 456 }, { foo: 123 }, { baz: 789 } ]\n' +
          'to only contain { foo: 123 }, { bar: 456 }\n' +
          '\n' +
          '[\n' +
          '  { bar: 456 },\n' +
          '  { foo: 123 },\n' +
          '  { baz: 789 } // should be removed\n' +
          ']'
      );
    });

    it('should throw when combining the not and only flags', () => {
      expect(function () {
        expect([{ foo: 123 }], 'not to only contain', { foo: 123 });
      }).toThrowException(
        "Unknown assertion 'not to only contain', did you mean: 'to only contain'"
      );
    });
  });

  it('should not highlight overlapping partial matches', () => {
    expect(function () {
      expect('foobarquux').notToContain('foob', 'barq');
    }).toThrow(
      "expected 'foobarquux' not to contain 'foob', 'barq'\n" +
        '\n' +
        'foobarquux\n' +
        '^^^^'
    );
  });

  it('should highlight all occurrences of the longest partial match', () => {
    expect(function () {
      expect('foobarquuxfoob').toContain('ooaaq', 'foobr');
    }).toThrow(
      "expected 'foobarquuxfoob' to contain 'ooaaq', 'foobr'\n" +
        '\n' +
        'foobarquuxfoob\n' +
        '^^^^      ^^^^'
    );
  });
});
