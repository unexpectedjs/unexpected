/* global expect */
describe('to be one of', () => {
  it('asserts booleans can be true or false', () => {
    expect(true).toBeOneOf([true, false]);
    expect(NaN).toBeOneOf([NaN]);

    expect(true).notToBeOneOf([false]);
    expect(-0).notToBeOneOf([0]);
    expect(2).notToBeOneOf([0, 1]);
  });

  it('throws when assertions fail', () => {
    expect(function () {
      expect(1).toBeOneOf([0, 2]);
    }).toThrowException('expected 1 to be one of [ 0, 2 ]');

    expect(function () {
      expect(1).notToBeOneOf([0, 1]);
    }).toThrowException('expected 1 not to be one of [ 0, 1 ]');
  });
});
