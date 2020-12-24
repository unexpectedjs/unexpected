/* global expect */
describe('string type', () => {
  it('should suppress a diff when the actual value has a length greater than 64 KB', () => {
    const longString = new Array(65538).join('A');
    expect(function () {
      expect(longString).toEqual('foo');
    }).toThrow(
      `expected '${longString}'\nto equal 'foo'\n\nDiff suppressed due to size > 65536`
    );
  });

  it('should suppress a diff when the expected value has a length greater than 64 KB', () => {
    const longString = new Array(65538).join('A');
    expect(function () {
      expect('foo').toEqual(longString);
    }).toThrow(
      `expected 'foo'\nto equal '${longString}'\n\nDiff suppressed due to size > 65536`
    );
  });
});
