/* global expect */
describe('toString', () => {
  it('returns a string containing all the expanded assertions', () => {
    expect(expect.toString()).toContain().toBe();
    expect(expect.toString(), 'to contain', '[not] to be');
  });
});
