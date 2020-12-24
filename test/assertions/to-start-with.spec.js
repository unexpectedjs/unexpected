/* global expect */
describe('to start with assertion', () => {
  it('should throw an error when the expected prefix is the empty string', () => {
    expect(function () {
      expect('foo').toStartWith('');
    }).toThrow(
      "The 'to start with' assertion does not support a prefix of the empty string"
    );
  });

  describe('without the "not" flag', () => {
    it('asserts equality with a string', () => {
      expect('hello').toStartWith('hello');
      expect('hello world').toStartWith('hello');
    });
  });

  describe('when the assertion fails', () => {
    it('does not include a diff when there is no common prefix', () => {
      expect(function () {
        expect('hello world').toStartWith('foo');
      }).toThrowException("expected 'hello world' to start with 'foo'");
    });

    it('includes a diff when there is a common prefix', () => {
      expect(function () {
        expect('hello world').toStartWith('hell yeah');
      }).toThrowException(
        "expected 'hello world' to start with 'hell yeah'\n" +
          '\n' +
          'hello world\n' +
          '^^^^'
      );
    });
  });
});
