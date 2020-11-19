/* global expect */
describe('fail assertion', () => {
  it('throws an error', () => {
    expect(
      function () {
        expect.fail();
      },
      'to throw exception',
      'Explicit failure'
    );
  });

  it('sets the error message', () => {
    let wasCaught = false;
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
      function () {
        expect.fail('fail with error message');
      },
      'to throw exception',
      'fail with error message'
    );
  });

  it('supports placeholders', () => {
    expect(
      function () {
        expect.fail('{0} was expected to be {1}', 0, 'zero');
      },
      'to throw exception',
      "0 was expected to be 'zero'"
    );

    expect(
      function () {
        const output = expect.output.clone().text('zero');
        expect.fail('{0} was expected to be {1}', 0, output);
      },
      'to throw exception',
      '0 was expected to be zero'
    );

    expect(
      function () {
        expect.fail('{0} was expected to be {1}', 0);
      },
      'to throw exception',
      '0 was expected to be {1}'
    );
  });

  describe('with an object', () => {
    it('should support specifying a message', () => {
      expect(
        function () {
          expect.fail({
            message: 'yadda',
          });
        },
        'to throw',
        {
          message: '\nyadda\n',
          errorMode: 'bubble',
        }
      );
    });

    it('should support specifying a label', () => {
      expect(
        function () {
          expect.fail({
            label: 'to yadda',
          });
        },
        'to throw',
        {
          errorMode: 'default',
          label: 'to yadda',
        }
      );
    });

    it('should set additional properties on the thrown error', () => {
      expect(
        function () {
          expect.fail({
            foobarquux: 123,
          });
        },
        'to throw',
        {
          foobarquux: 123,
        }
      );
    });

    it('should support message passed as a string', () => {
      expect(
        function () {
          expect.fail({
            message: 'hey',
          });
        },
        'to throw',
        {
          message: '\nhey\n',
        }
      );
    });

    it('should support message passed as a MagicPen instance', () => {
      expect(
        function () {
          expect.fail({
            message: expect.output.clone().text('hey'),
          });
        },
        'to throw',
        {
          message: '\nhey\n',
        }
      );
    });
  });

  describe('with a diff function', () => {
    it('should generate the diff', () => {
      const clonedExpect = expect.clone();
      clonedExpect.addAssertion('<any> to foo', function (expect, subject) {
        expect.fail({
          diff(output, diff, inspect, equal) {
            return output.text('custom');
          },
        });
      });
      expect(
        function () {
          clonedExpect('bar', 'to foo');
        },
        'to throw',
        "expected 'bar' to foo\n" + '\n' + 'custom'
      );
    });
  });
});
