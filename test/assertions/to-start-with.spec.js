/*global expect*/
describe('to start with assertion', function() {
  it('should throw an error when the expected prefix is the empty string', function() {
    expect(
      function() {
        expect('foo', 'to start with', '');
      },
      'to throw',
      "The 'to start with' assertion does not support a prefix of the empty string"
    );
  });

  describe('without the "not" flag', function() {
    it('asserts equality with a string', function() {
      expect('hello', 'to start with', 'hello');
      expect('hello world', 'to start with', 'hello');
    });
  });

  describe('when the assertion fails', function() {
    it('does not include a diff when there is no common prefix', function() {
      expect(
        function() {
          expect('hello world', 'to start with', 'foo');
        },
        'to throw exception',
        "expected 'hello world' to start with 'foo'"
      );
    });

    it('includes a diff when there is a common prefix', function() {
      expect(
        function() {
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
