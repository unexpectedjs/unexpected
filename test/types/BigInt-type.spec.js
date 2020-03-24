/* global expect, BigInt */

// Bogus test to prevent jest from failing with "Your test suite must contain at least one test"
// on node.js 9 and below, which don't have BigInt support:
it('should be registered as a type', function () {
  expect(expect.getType('BigInt'), 'to be truthy');
});

if (typeof BigInt === 'function') {
  describe('BigInt type', () => {
    it('should consider an instance equal to itself', () => {
      const a = BigInt(1);
      expect(a, 'to equal', a);
    });

    it('should not be considered equal to the equivalent number', () => {
      expect(
        () => expect(BigInt(1), 'to equal', 1),
        'to throw',
        'expected BigInt(1) to equal 1'
      );
    });

    it('should inspect as source code', () => {
      const a = BigInt(123);
      expect(a, 'to inspect as', 'BigInt(123)');
    });
  });
}
