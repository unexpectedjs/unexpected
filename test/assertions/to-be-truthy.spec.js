/* global expect */
describe('to be ok/truthy assertion', () => {
  it('asserts that the value is truthy', () => {
    expect(1).toBeOk();
    expect(true).toBeOk();
    expect({}).toBeTruthy();
    expect(0).notToBeOk();
  });

  it('throws when the assertion fails', () => {
    expect(function () {
      expect(0).toBeOk();
    }).toThrowException('expected 0 to be ok');
  });

  it('throws with message when the assertion fails', () => {
    expect(function () {
      expect(2 < 1).toBeTruthy('2 < 1');
    }).toThrowException("expected false to be truthy '2 < 1'");
  });
});
