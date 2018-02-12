/*global expect*/

describe('UnexpectedError', function() {
  describe('#stack', function() {
    it('should not mess up when the error message contains $&', function() {
      return expect(() => expect('$&', 'to equal', 'foo'), 'to error').then(
        err => {
          expect(err.stack, 'to contain', '$&');
        }
      );
    });
  });
});
