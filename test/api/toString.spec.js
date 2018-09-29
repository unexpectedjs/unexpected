/*global expect*/
describe('toString', () => {
  it('returns a string containing all the expanded assertions', () => {
    expect(expect.toString(), 'to contain', 'to be');
    expect(expect.toString(), 'to contain', '[not] to be');
  });
});
