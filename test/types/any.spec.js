/* global unexpected */
var expect = unexpected.clone();

describe('any type', () => {
  var anyType = expect.getType('any');
  describe('when invoked with 3 arguments', () => {
    it('should inspect a value', () => {
      var output = expect.createOutput('text');
      anyType.inspect(123, 1, output);
      expect(output.toString(), 'to equal', '123');
    });
  });

  describe('when invoked with no arguments', () => {
    it('should return the type name for require("util").inspect', () => {
      expect(anyType.inspect(), 'to equal', 'type: any');
    });
  });
});
