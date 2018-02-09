/*global expect*/
describe('toString', function() {
  it('returns a string containing all the expanded assertions', function() {
    expect(expect.toString(), 'to contain', 'to be');
    expect(expect.toString(), 'to contain', '[not] to be');
  });
});
