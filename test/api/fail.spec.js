/*global expect*/
describe('fail assertion', () => {
  it('throws an error', () => {
    expect(
      () => {
        expect.fail();
      },
      'to throw exception',
      'Explicit failure'
    );
  });

  it('sets the error message', () => {
    var wasCaught = false;
    try {
      expect.fail('fail with error message');
    } catch (e) {
      wasCaught = true;
      expect(e.message, 'to contain', 'fail with error message');
    }
    expect(wasCaught, 'to be true');
  });

  it('throws an error with a given message', () => {
    expect(
      () => {
        expect.fail('fail with error message');
      },
      'to throw exception',
      'fail with error message'
    );
  });

  it('supports placeholders', () => {
    expect(
      () => {
        expect.fail('{0} was expected to be {1}', 0, 'zero');
      },
      'to throw exception',
      "0 was expected to be 'zero'"
    );

    expect(
      () => {
        var output = expect.output.clone().text('zero');
        expect.fail('{0} was expected to be {1}', 0, output);
      },
      'to throw exception',
      '0 was expected to be zero'
    );

    expect(
      () => {
        expect.fail('{0} was expected to be {1}', 0);
      },
      'to throw exception',
      '0 was expected to be {1}'
    );
  });

  describe('with an object', () => {
    it('should support specifying a message', () => {
      expect(
        () => {
          expect.fail({
            message: 'yadda'
          });
        },
        'to throw',
        {
          message: '\nyadda\n',
          errorMode: 'bubble'
        }
      );
    });

    it('should support specifying a label', () => {
      expect(
        () => {
          expect.fail({
            label: 'to yadda'
          });
        },
        'to throw',
        {
          errorMode: 'default',
          label: 'to yadda'
        }
      );
    });

    it('should set additional properties on the thrown error', () => {
      expect(
        () => {
          expect.fail({
            foobarquux: 123
          });
        },
        'to throw',
        {
          foobarquux: 123
        }
      );
    });

    it('should support message passed as a string', () => {
      expect(
        () => {
          expect.fail({
            message: 'hey'
          });
        },
        'to throw',
        {
          message: '\nhey\n'
        }
      );
    });

    it('should support message passed as a MagicPen instance', () => {
      expect(
        () => {
          expect.fail({
            message: expect.output.clone().text('hey')
          });
        },
        'to throw',
        {
          message: '\nhey\n'
        }
      );
    });
  });

  describe('with a diff function', () => {
    it('should generate the diff', () => {
      var clonedExpect = expect.clone();
      clonedExpect.addAssertion('<any> to foo', (expect, subject) => {
        expect.fail({
          diff(output, diff, inspect, equal) {
            return output.text('custom');
          }
        });
      });
      expect(
        () => {
          clonedExpect('bar', 'to foo');
        },
        'to throw',
        "expected 'bar' to foo\n" + '\n' + 'custom'
      );
    });

    it('should support a diff function that uses the old API', () => {
      var clonedExpect = expect.clone();
      clonedExpect.addAssertion('<any> to foo', (expect, subject) => {
        expect.fail({
          diff(output, diff, inspect, equal) {
            return {
              inline: false,
              diff: output.text('custom')
            };
          }
        });
      });
      expect(
        () => {
          clonedExpect('bar', 'to foo');
        },
        'to throw',
        "expected 'bar' to foo\n" + '\n' + 'custom'
      );
    });
  });
});
