/* global expect */
describe('to have size assertion', () => {
  it('should succeed', () => {
    expect(new Set([1, 2, 3]), 'to have size', 3);
  });

  it('should fail', () => {
    expect(
      () => {
        expect(new Set([1, 2, 3]), 'to have size', 2);
      },
      'to throw',
      'expected new Set([ 1, 2, 3 ]) to have size 2'
    );
  });

  describe('with the not flag', () => {
    it('should succeed', () => {
      expect(new Set([1, 2, 3]), 'not to have size', 2);
    });

    it('should fail', () => {
      expect(
        () => {
          expect(new Set([1, 2, 3]), 'not to have size', 3);
        },
        'to throw',
        'expected new Set([ 1, 2, 3 ]) not to have size 3'
      );
    });
  });
});
