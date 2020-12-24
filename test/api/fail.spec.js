/* global expect */
describe('fail assertion', () => {
  it('throws an error', () => {
    expect(function () {
      expect.fail();
    }).toThrowException('Explicit failure');
  });

  it('sets the error message', () => {
    let wasCaught = false;
    try {
      expect.fail('fail with error message');
    } catch (e) {
      wasCaught = true;
      expect(e.message).toContain('fail with error message');
    }
    expect(wasCaught).toBeTrue();
  });

  it('throws an error with a given message', () => {
    expect(function () {
      expect.fail('fail with error message');
    }).toThrowException('fail with error message');
  });

  it('supports placeholders', () => {
    expect(function () {
      expect.fail('{0} was expected to be {1}', 0, 'zero');
    }).toThrowException("0 was expected to be 'zero'");

    expect(function () {
      const output = expect.output.clone().text('zero');
      expect.fail('{0} was expected to be {1}', 0, output);
    }).toThrowException('0 was expected to be zero');

    expect(function () {
      expect.fail('{0} was expected to be {1}', 0);
    }).toThrowException('0 was expected to be {1}');
  });

  describe('with an object', () => {
    it('should support specifying a message', () => {
      expect(function () {
        expect.fail({
          message: 'yadda',
        });
      }).toThrow({
        message: '\nyadda\n',
        errorMode: 'bubble',
      });
    });

    it('should support specifying a label', () => {
      expect(function () {
        expect.fail({
          label: 'to yadda',
        });
      }).toThrow({
        errorMode: 'default',
        label: 'to yadda',
      });
    });

    it('should set additional properties on the thrown error', () => {
      expect(function () {
        expect.fail({
          foobarquux: 123,
        });
      }).toThrow({
        foobarquux: 123,
      });
    });

    it('should support message passed as a string', () => {
      expect(function () {
        expect.fail({
          message: 'hey',
        });
      }).toThrow({
        message: '\nhey\n',
      });
    });

    it('should support message passed as a MagicPen instance', () => {
      expect(function () {
        expect.fail({
          message: expect.output.clone().text('hey'),
        });
      }).toThrow({
        message: '\nhey\n',
      });
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
      expect(function () {
        clonedExpect('bar', 'to foo');
      }).toThrow("expected 'bar' to foo\n" + '\n' + 'custom');
    });
  });
});
