/* global expect */
if (typeof Buffer === 'function') {
  describe('Buffer type', () => {
    it('should consider an instance equal to itself', () => {
      var a = Buffer.from([1, 2]);
      expect(a, 'to equal', a);
    });
  });
}
