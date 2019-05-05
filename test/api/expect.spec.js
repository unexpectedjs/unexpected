/*global expect*/
describe('expect', function() {
  it('should forward flags to assertion strings that are processed by the next assertion', function() {
    var clonedExpect = expect.clone();

    clonedExpect.addAssertion(
      '<number> [not] to have an absolute value of <number>',
      function(expect, subject, value) {
        expect.errorMode = 'nested';
        expect(
          subject,
          'when passed as parameter to',
          Math.abs,
          '[not] to equal',
          value
        );
      }
    );

    clonedExpect(-124, 'not to have an absolute value of', 0);
  });

  it('should forward flags to assertion strings that are processed by the next next assertion', function() {
    var clonedExpect = expect.clone();

    clonedExpect.addAssertion(
      '<number> [not] to have a floored absolute value of <number>',
      function(expect, subject, value) {
        expect.errorMode = 'nested';
        expect(
          subject,
          'when passed as parameter to',
          Math.abs,
          'when passed as parameter to',
          Math.floor,
          '[not] to equal',
          value
        );
      }
    );

    clonedExpect(-124, 'not to have a floored absolute value of', 0);
  });
});
