/* global expectWithUnexpectedMagicPen */
describe('to begin with assertion', () => {
  const expect = expectWithUnexpectedMagicPen;

  it('should throw an error when the expected prefix is the empty string', () => {
    expect(function () {
      expect('foo').toBeginWith('');
    }).toThrow(
      "The 'to begin with' assertion does not support a prefix of the empty string"
    );
  });

  describe('without the "not" flag', () => {
    it('asserts equality with a string', () => {
      expect('hello').toBeginWith('hello');
      expect('hello world').toBeginWith('hello');
    });

    describe('when the assertion fails', () => {
      it('does not include a diff when there is no common prefix', () => {
        expect(function () {
          expect('hello world').toBeginWith('foo');
        }).toThrowException("expected 'hello world' to begin with 'foo'");
      });

      it('includes a diff when there is a common prefix', () => {
        expect(function () {
          expect('hello world').toBeginWith('hell yeah');
        }).toThrowException(
          expect
            .toHaveMessage(
              "expected 'hello world' to begin with 'hell yeah'\n" +
                '\n' +
                'hello world\n' +
                '^^^^'
            )
            .and('to have ansi diff', function () {
              this.text('hell', ['bgYellow', 'black']).text('o world');
            })
        );
      });

      it('builds the diff correctly when the partial match spans more than one line', () => {
        expect(function () {
          expect('f\no\nobar').toBeginWith('f\no\nop');
        }).toThrowException(
          "expected 'f\\no\\nobar' to begin with 'f\\no\\nop'\n" +
            '\n' +
            'f\n' +
            '^\n' +
            'o\n' +
            '^\n' +
            'obar\n' +
            '^'
        );
      });

      it('builds the diff correctly when the substring is longer than the subject', () => {
        expect(function () {
          expect('foo').toBeginWith('foobar');
        }).toThrowException(
          "expected 'foo' to begin with 'foobar'\n" + '\n' + 'foo\n' + '^^^'
        );
      });
    });

    it('builds the diff correctly when the string is truncated with no common prefix', () => {
      expect(function () {
        expect('foobarbaz-AtSomePointThisStringWillBeTruncated').toBeginWith(
          'barbazquux'
        );
      }).toThrowException(
        "expected 'foobarbaz-AtSomePointThisStringWill'... to begin with 'barbazquux'"
      );
    });

    it('builds the diff correctly when the string contains a space and is truncated', () => {
      expect(function () {
        expect('foobarbaz-StringTruncates AtTheSpace').toBeginWith(
          'barbazquux'
        );
      }).toThrowException(
        "expected 'foobarbaz-StringTruncates'... to begin with 'barbazquux'"
      );
    });

    it('builds the diff correctly when the string is truncated after a partial match', () => {
      expect(function () {
        expect('foobarbaz-ButAtSomePointThisStringWillBeTruncated').toBeginWith(
          'foobarquux'
        );
      }).toThrowException(
        "expected 'foobarbaz-ButAtSomePointThisStringW'... to begin with 'foobarquux'\n" +
          '\n' +
          'foobarbaz-ButAtSomePointThisStringW...\n' +
          '^^^^^^'
      );
    });
  });

  describe('with the "not" flag', () => {
    it('asserts inequality', () => {
      expect('hello').notToBeginWith('world');
      expect('hello world').notToBeginWith('world');
    });

    describe('when the assertion fails', () => {
      it('produces a diff', () => {
        expect(function () {
          expect('foobarquuxfoo').notToBeginWith('foo');
        }).toThrow(
          expect
            .toHaveMessage(
              "expected 'foobarquuxfoo' not to begin with 'foo'\n" +
                '\n' +
                'foobarquuxfoo\n' +
                '^^^'
            )
            .and('to have ansi diff', function () {
              this.text('foo', ['bgRed', 'black']).text('barquuxfoo');
            })
        );
      });

      it('builds the diff correctly when the prefix contains newlines', () => {
        expect(function () {
          expect('f\no\nobarquuxfoo').notToBeginWith('f\no\no');
        }).toThrow(
          "expected 'f\\no\\nobarquuxfoo' not to begin with 'f\\no\\no'\n" +
            '\n' +
            'f\\n\n' +
            '^^\n' +
            'o\\n\n' +
            '^^\n' +
            'obarquuxfoo\n' +
            '^'
        );
      });
    });
  });
});
