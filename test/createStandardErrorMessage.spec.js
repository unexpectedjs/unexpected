/* global unexpected */

const expect = unexpected.clone();

describe('createStandardErrorMessage', () => {
  // Regression test for a bug where the compactSubject of a MagicPen instance from
  // the prototype chain was picked up, causing the inner subject to be rendered as 'array'
  it('should not pick up the subject compaction code from a MagicPen instance in the prototype chain', () => {
    const clonedExpect = expect
      .clone()
      .addAssertion('<any> shifted <assertion>', function (expect, subject) {
        expect.errorMode = 'nested';
        return expect.shift();
      })
      .addAssertion(
        '<array> to be an array of one foo',
        function (expect, subject) {
          expect.errorMode = 'nested';
          expect(subject[0]).toEqual('foo');
        }
      );
    expect(function () {
      clonedExpect(
        ['foooooooooooooooooooooooooooooooooooo'],
        'shifted to be an array of one foo'
      );
    }).toThrow(
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
