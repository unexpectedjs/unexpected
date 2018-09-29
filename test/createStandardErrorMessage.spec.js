/*global unexpected*/

var expect = unexpected.clone();

describe('createStandardErrorMessage', () => {
  // Regression test for a bug where the compactSubject of a MagicPen instance from
  // the prototype chain was picked up, causing the inner subject to be rendered as 'array'
  it('should not pick up the subject compaction code from a MagicPen instance in the prototype chain', () => {
    var clonedExpect = expect
      .clone()
      .addAssertion('<any> shifted <assertion>', (expect, subject) => {
        expect.errorMode = 'nested';
        return expect.shift();
      })
      .addAssertion('<array> to be an array of one foo', (expect, subject) => {
        expect.errorMode = 'nested';
        expect(subject[0], 'to equal', 'foo');
      });
    expect(
      () => {
        clonedExpect(
          ['foooooooooooooooooooooooooooooooooooo'],
          'shifted to be an array of one foo'
        );
      },
      'to throw',
      "expected [ 'foooooooooooooooooooooooooooooooooooo' ]\n" +
        'shifted to be an array of one foo\n' +
        '  expected array to be an array of one foo\n' +
        "    expected 'foooooooooooooooooooooooooooooooooooo' to equal 'foo'\n" +
        '\n' +
        '    -foooooooooooooooooooooooooooooooooooo\n' +
        '    +foo'
    );
  });
});
