/*global expect*/
describe('string type', function() {
  it('should suppress a diff when the actual value has a length greater than 1 KB', function() {
    var longString = new Array(4098).join('A');
    expect(
      function() {
        expect(longString, 'to equal', 'foo');
      },
      'to throw',
      `expected '${longString}'\nto equal 'foo'\n\nDiff suppressed due to size > 4096`
    );
  });

  it('should suppress a diff when the expected value has a length greater than 4 KB', function() {
    var longString = new Array(4098).join('A');
    expect(
      function() {
        expect('foo', 'to equal', longString);
      },
      'to throw',
      `expected 'foo'\nto equal '${longString}'\n\nDiff suppressed due to size > 4096`
    );
  });
});
