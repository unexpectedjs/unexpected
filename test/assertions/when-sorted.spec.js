/* global expect */
describe('when sorted assertion', () => {
  it('should sort an array using the default compare function', () => {
    expect(['c', 'a', 'b'], 'when sorted', 'to equal', ['a', 'b', 'c']);
  });

  it("should sort an array of numbers if the 'numerically' flag is included", () => {
    expect([5, 12, 20, 2], 'when sorted numerically', 'to equal', [
      2,
      5,
      12,
      20
    ]);
  });

  it('should provide the result as the fulfillment value if no assertion is provided', () => {
    return expect(['c', 'b', 'a'], 'when sorted').then(function(sortedArray) {
      expect(sortedArray, 'to equal', ['a', 'b', 'c']);
    });
  });

  it("should also work without the 'when'", () => {
    expect(['c', 'd', 'a'], 'sorted', 'to equal', ['a', 'c', 'd']);
  });
});
