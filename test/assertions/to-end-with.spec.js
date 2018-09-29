/*global expectWithUnexpectedMagicPen*/
describe('to end with assertion', () => {
  var expect = expectWithUnexpectedMagicPen;

  it('should throw an error when the expected suffix is the empty string', () => {
    expect(
      () => {
        expect('foo', 'to end with', '');
      },
      'to throw',
      "The 'to end with' assertion does not support a suffix of the empty string"
    );
  });

  describe('without the "not" flag', () => {
    it('asserts equality with a string', () => {
      expect('hello', 'to end with', 'hello');
      expect('hello world', 'to end with', 'world');
    });

    describe('when the assertion fails', () => {
      it('does not include a diff when there is no common suffix', () => {
        expect(
          () => {
            expect('hello world', 'to end with', 'foo');
          },
          'to throw exception',
          "expected 'hello world' to end with 'foo'"
        );
      });

      it('includes a diff when there is a common suffix', () => {
        expect(
          () => {
            expect('hello world', 'to end with', 'wonderful world');
          },
          'to throw exception',
          expect
            .it(
              'to have message',
              "expected 'hello world' to end with 'wonderful world'\n" +
                '\n' +
                'hello world\n' +
                '     ^^^^^^'
            )
            .and('to have ansi diff', function() {
              this.text('hello').text(' world', ['bgYellow', 'black']);
            })
        );
      });

      it('builds the diff correctly when the partial match spans more than one line', () => {
        expect(
          () => {
            expect('foob\na\nr', 'to end with', 'quuxb\na\nr');
          },
          'to throw exception',
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
        expect(
          () => {
            expect('foo', 'to end with', 'doublefoo');
          },
          'to throw exception',
          "expected 'foo' to end with 'doublefoo'\n" + '\n' + 'foo\n' + '^^^'
        );
      });
    });

    it('builds the diff correctly when the string is truncated with no common prefix', () => {
      expect(
        () => {
          expect(
            'AtSomePointThisStringWillBeTruncated-foobarbaz',
            'to end with',
            'barbazquux'
          );
        },
        'to throw exception',
        "expected ...'ThisStringWillBeTruncated-foobarbaz' to end with 'barbazquux'"
      );
    });

    it('builds the diff correctly when the string contains a space and is truncated', () => {
      expect(
        () => {
          expect(
            'a ThenPleaseTruncateString-foobarbaz',
            'to end with',
            'barbazquux'
          );
        },
        'to throw exception',
        "expected ...'ThenPleaseTruncateString-foobarbaz' to end with 'barbazquux'"
      );
    });

    it('builds the diff correctly when the string is truncated after a partial match', () => {
      expect(
        () => {
          expect(
            'ButAtSomePointThisStringWillBeTruncated-bazbarfoo',
            'to end with',
            'quuxbarfoo'
          );
        },
        'to throw exception',
        "expected ...'ThisStringWillBeTruncated-bazbarfoo' to end with 'quuxbarfoo'\n" +
          '\n' +
          '...ThisStringWillBeTruncated-bazbarfoo\n' +
          '                                ^^^^^^'
      );
    });
  });

  describe('with the "not" flag', () => {
    it('asserts inequality', () => {
      expect('hello', 'not to end with', 'world');
      expect('hello worldly', 'not to end with', 'world');
    });

    it('produces a diff when the string case fails', () => {
      expect(
        () => {
          expect('foobarquuxfoo', 'not to end with', 'foo');
        },
        'to throw',
        expect
          .it(
            'to have message',
            "expected 'foobarquuxfoo' not to end with 'foo'\n" +
              '\n' +
              'foobarquuxfoo\n' +
              '          ^^^'
          )
          .and('to have ansi diff', function() {
            this.text('foobarquux').text('foo', ['bgRed', 'black']);
          })
      );
    });

    it('builds the diff correctly when the suffix contains newlines', () => {
      expect(
        () => {
          expect('foobarquuxf\no\no', 'not to end with', 'f\no\no');
        },
        'to throw',
        "expected 'foobarquuxf\\no\\no' not to end with 'f\\no\\no'\n" +
          '\n' +
          'foobarquuxf\n' +
          '          ^\n' +
          'o\n' +
          '^\n' +
          'o\n' +
          '^'
      );
    });
  });
});
