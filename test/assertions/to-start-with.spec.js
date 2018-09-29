/*global expect*/
describe('to start with assertion', () => {
  it('should throw an error when the expected prefix is the empty string', () => {
    expect(
      () => {
        expect('foo', 'to start with', '');
      },
      'to throw',
      "The 'to start with' assertion does not support a prefix of the empty string"
    );
  });

  describe('without the "not" flag', () => {
    it('asserts equality with a string', () => {
      expect('hello', 'to start with', 'hello');
      expect('hello world', 'to start with', 'hello');
    });
  });

  describe('when the assertion fails', () => {
    it('does not include a diff when there is no common prefix', () => {
      expect(
        () => {
          expect('hello world', 'to start with', 'foo');
        },
        'to throw exception',
        "expected 'hello world' to start with 'foo'"
      );
    });

    it('includes a diff when there is a common prefix', () => {
      expect(
        () => {
          expect('hello world', 'to start with', 'hell yeah');
        },
        'to throw exception',
        "expected 'hello world' to start with 'hell yeah'\n" +
          '\n' +
          'hello world\n' +
          '^^^^'
      );
    });
  });
});
