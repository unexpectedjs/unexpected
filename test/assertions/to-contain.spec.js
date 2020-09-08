/* global expectWithUnexpectedMagicPen */
describe('to contain assertion', () => {
  var expect = expectWithUnexpectedMagicPen;

  it('should throw an error when one of the arguments is the empty string', () => {
    expect(
      function () {
        expect('foo', 'to contain', 'bar', '');
      },
      'to throw',
      "The 'to contain' assertion does not support the empty string"
    );
  });

  it('asserts indexOf for a string', () => {
    expect('hello world', 'to contain', 'world');
  });

  it('asserts item equality for an array', () => {
    expect([1, 2], 'to contain', 1);
    expect([1, 2], 'to contain', 2, 1);
    expect([{ foo: 123 }], 'to contain', { foo: 123 });
  });

  it('throws when the assertion fails', () => {
    expect(
      function () {
        expect(null, 'not to contain', 'world');
      },
      'to throw',
      "expected null not to contain 'world'\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <null> not to contain <string>\n' +
        '  did you mean:\n' +
        '    <array-like> [not] to [only] contain <any+>\n' +
        '    <string> [not] to contain <string+>'
    );

    expect(
      function () {
        expect('hello world', 'to contain', 'foo');
      },
      'to throw exception',
      "expected 'hello world' to contain 'foo'\n\nhello world"
    );

    expect(
      function () {
        expect('hello world', 'to contain', 'hello', 'foo');
      },
      'to throw exception',
      "expected 'hello world' to contain 'hello', 'foo'\n" +
        '\n' +
        'hello world\n' +
        '^^^^^'
    );

    expect(
      function () {
        expect([1, 2], 'to contain', 2, 3);
      },
      'to throw exception',
      'expected [ 1, 2 ] to contain 2, 3'
    );

    expect(
      function () {
        expect([{ foo: 123 }], 'to contain', { foo: 123 }, { bar: 456 });
      },
      'to throw exception',
      'expected [ { foo: 123 } ] to contain { foo: 123 }, { bar: 456 }'
    );

    expect(
      function () {
        expect(1, 'to contain', 1);
      },
      'to throw exception',
      'expected 1 to contain 1\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <number> to contain <number>\n' +
        '  did you mean:\n' +
        '    <array-like> [not] to [only] contain <any+>\n' +
        '    <string> [not] to contain <string+>'
    );
  });

  it('produces a diff showing full and partial matches for each needle when the assertion fails', () => {
    expect(
      function () {
        expect('foo\nbarquux', 'to contain', 'foo\nb', 'quuux');
      },
      'to throw',
      expect
        .it(
          'to have message',
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
      expect(
        function () {
          expect('blahfoo\nbar\nquux', 'not to contain', 'foo\nbar\nq');
        },
        'to throw',
        expect.it(function (err) {
          expect(
            err,
            'to have message',
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
      expect(
        function () {
          expect([1, 2, 3], 'not to contain', 2);
        },
        'to throw',
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
      expect(
        function () {
          expect('foobarquuxfoo', 'not to contain', 'foo');
        },
        'to throw',
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
        expect(
          [{ bar: 456 }, { foo: 123 }],
          'to only contain',
          { foo: 123 },
          { bar: 456 }
        );
      }, 'not to throw');
    });

    it('should throw when all items are not included in the subject', () => {
      expect(
        function () {
          expect([{ bar: 456 }], 'to only contain', { foo: 123 }, { bar: 456 });
        },
        'to throw exception',
        'expected [ { bar: 456 } ] to only contain { foo: 123 }, { bar: 456 }\n' +
          '\n' +
          '[\n' +
          '  { bar: 456 }\n' +
          '  // missing { foo: 123 }\n' +
          ']'
      );
    });

    it('should throw when all items are included in the subject but subject has other items as well', () => {
      expect(
        function () {
          expect(
            [{ bar: 456 }, { foo: 123 }, { baz: 789 }],
            'to only contain',
            { foo: 123 },
            { bar: 456 }
          );
        },
        'to throw exception',
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
      expect(
        function () {
          expect([{ foo: 123 }], 'not to only contain', { foo: 123 });
        },
        'to throw exception',
        'The "not" flag cannot be used together with "to only contain".'
      );
    });
  });

  it('should not highlight overlapping partial matches', () => {
    expect(
      function () {
        expect('foobarquux', 'not to contain', 'foob', 'barq');
      },
      'to throw',
      "expected 'foobarquux' not to contain 'foob', 'barq'\n" +
        '\n' +
        'foobarquux\n' +
        '^^^^'
    );
  });

  it('should highlight all occurrences of the longest partial match', () => {
    expect(
      function () {
        expect('foobarquuxfoob', 'to contain', 'ooaaq', 'foobr');
      },
      'to throw',
      "expected 'foobarquuxfoob' to contain 'ooaaq', 'foobr'\n" +
        '\n' +
        'foobarquuxfoob\n' +
        '^^^^      ^^^^'
    );
  });
});
