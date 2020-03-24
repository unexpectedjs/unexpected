/* global expect */
describe('to be one of', () => {
  it('asserts booleans can be true or false', () => {
    expect(true, 'to be one of', [true, false]);
    expect(NaN, 'to be one of', [NaN]);

    expect(true, 'not to be one of', [false]);
    expect(-0, 'not to be one of', [0]);
    expect(2, 'not to be one of', [0, 1]);
  });

  it('throws when assertions fail', () => {
    expect(
      function () {
        expect(1, 'to be one of', [0, 2]);
      },
      'to throw exception',
      'expected 1 to be one of [ 0, 2 ]'
    );

    expect(
      function () {
        expect(1, 'not to be one of', [0, 1]);
      },
      'to throw exception',
      'expected 1 not to be one of [ 0, 1 ]'
    );
  });
});
