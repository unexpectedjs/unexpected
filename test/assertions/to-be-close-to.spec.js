/* global expect */
describe('to be close to assertion', () => {
  it('asserts that two numbers differ by at most 1e-9', () => {
    expect(1.5, 'to be close to', 1.49999999999);
    expect(1.5, 'to be close to', 1.5000000001);
    expect(1.5, 'not to be close to', 2);
  });

  it('fails when the assertion fails', () => {
    expect(
      function() {
        expect(1.5, 'to be close to', 1.4999);
      },
      'to throw exception',
      'expected 1.5 to be close to 1.4999 (epsilon: 1e-9)'
    );

    expect(
      function() {
        expect(1.5, 'to be close to', 1.5001);
      },
      'to throw exception',
      'expected 1.5 to be close to 1.5001 (epsilon: 1e-9)'
    );
  });

  it('accepts a custom epsilon', () => {
    expect(1.5, 'to be close to', 1.500001, 1e-3);

    expect(1.5, 'not to be close to', 1.51, 1e-3);

    expect(
      function() {
        expect(1.5, 'to be close to', 1.51, 1e-3);
      },
      'to throw exception',
      'expected 1.5 to be close to 1.51 (epsilon: 1e-3)'
    );
  });
});
