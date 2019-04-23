/* global expect */
describe('string type', () => {
  it('should suppress a diff when the actual value has a length greater than 40 KB', () => {
    var longString = new Array(40980).join('A');
    expect(
      function() {
        expect(longString, 'to equal', 'foo');
      },
      'to throw',
      `expected '${longString}'\nto equal 'foo'\n\nDiff suppressed due to size > 40960`
    );
  });

  it('should suppress a diff when the expected value has a length greater than 40 KB', () => {
    var longString = new Array(40980).join('A');
    expect(
      function() {
        expect('foo', 'to equal', longString);
      },
      'to throw',
      `expected 'foo'\nto equal '${longString}'\n\nDiff suppressed due to size > 40960`
    );
  });
});
