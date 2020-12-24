/* global expectWithUnexpectedMagicPen */
describe('to end with assertion', () => {
  const expect = expectWithUnexpectedMagicPen;

  it('should throw an error when the expected suffix is the empty string', () => {
    expect(function () {
      expect('foo').toEndWith('');
    }).toThrow(
      "The 'to end with' assertion does not support a suffix of the empty string"
    );
  });

  describe('without the "not" flag', () => {
    it('asserts equality with a string', () => {
      expect('hello').toEndWith('hello');
      expect('hello world').toEndWith('world');
    });

    describe('when the assertion fails', () => {
      it('does not include a diff when there is no common suffix', () => {
        expect(function () {
          expect('hello world').toEndWith('foo');
        }).toThrowException("expected 'hello world' to end with 'foo'");
      });

      it('includes a diff when there is a common suffix', () => {
        expect(function () {
          expect('hello world').toEndWith('wonderful world');
        }).toThrowException(
          expect
            .toHaveMessage(
              "expected 'hello world' to end with 'wonderful world'\n" +
                '\n' +
                'hello world\n' +
                '     ^^^^^^'
            )
            .and('to have ansi diff', function () {
              this.text('hello').text(' world', ['bgYellow', 'black']);
            })
        );
      });

      it('builds the diff correctly when the partial match spans more than one line', () => {
        expect(function () {
          expect('foob\na\nr').toEndWith('quuxb\na\nr');
        }).toThrowException(
          "expected 'foob\\na\\nr' to end with 'quuxb\\na\\nr'\n" +
            '\n' +
            'foob\n' +
            '   ^\n' +
            'a\n' +
            '^\n' +
            'r\n' +
            '^'
        );
      });

      it('builds the diff correctly when the substring is longer than the subject', () => {
        expect(function () {
          expect('foo').toEndWith('doublefoo');
        }).toThrowException(
          "expected 'foo' to end with 'doublefoo'\n" + '\n' + 'foo\n' + '^^^'
        );
      });
    });

    it('builds the diff correctly when the string is truncated with no common prefix', () => {
      expect(function () {
        expect('AtSomePointThisStringWillBeTruncated-foobarbaz').toEndWith(
          'barbazquux'
        );
      }).toThrowException(
        "expected ...'ThisStringWillBeTruncated-foobarbaz' to end with 'barbazquux'"
      );
    });

    it('builds the diff correctly when the string contains a space and is truncated', () => {
      expect(function () {
        expect('a ThenPleaseTruncateString-foobarbaz').toEndWith('barbazquux');
      }).toThrowException(
        "expected ...'ThenPleaseTruncateString-foobarbaz' to end with 'barbazquux'"
      );
    });

    it('builds the diff correctly when the string is truncated after a partial match', () => {
      expect(function () {
        expect('ButAtSomePointThisStringWillBeTruncated-bazbarfoo').toEndWith(
          'quuxbarfoo'
        );
      }).toThrowException(
        "expected ...'ThisStringWillBeTruncated-bazbarfoo' to end with 'quuxbarfoo'\n" +
          '\n' +
          '...ThisStringWillBeTruncated-bazbarfoo\n' +
          '                                ^^^^^^'
      );
    });
  });

  describe('with the "not" flag', () => {
    it('asserts inequality', () => {
      expect('hello').notToEndWith('world');
      expect('hello worldly').notToEndWith('world');
    });

    it('produces a diff when the string case fails', () => {
      expect(function () {
        expect('foobarquuxfoo').notToEndWith('foo');
      }).toThrow(
        expect
          .toHaveMessage(
            "expected 'foobarquuxfoo' not to end with 'foo'\n" +
              '\n' +
              'foobarquuxfoo\n' +
              '          ^^^'
          )
          .and('to have ansi diff', function () {
            this.text('foobarquux').text('foo', ['bgRed', 'black']);
          })
      );
    });

    it('builds the diff correctly when the suffix contains newlines', () => {
      expect(function () {
        expect('foobarquuxf\no\no').notToEndWith('f\no\no');
      }).toThrow(
        "expected 'foobarquuxf\\no\\no' not to end with 'f\\no\\no'\n" +
          '\n' +
          'foobarquuxf\\n\n' +
          '          ^^\n' +
          'o\\n\n' +
          '^^\n' +
          'o\n' +
          '^'
      );
    });
  });
});
