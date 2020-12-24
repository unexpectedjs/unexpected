/* global expect */
describe('to be falsy assertion', () => {
  it('asserts that the value is falsy', () => {
    expect(true).notToBeFalsy();
    expect(0).toBeFalsy();
    expect(null).toBeFalsy();
    expect(undefined).toBeFalsy();
  });

  it('throws when the assertion fails', () => {
    expect(function () {
      expect(1).toBeFalsy();
    }).toThrowException('expected 1 to be falsy');
  });

  it('throws with message when the assertion fails', () => {
    expect(function () {
      expect(2 + 2 === 4).toBeFalsy('2 + 2 === 4');
    }).toThrowException("expected true to be falsy '2 + 2 === 4'");
  });
});
