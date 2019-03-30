/* global expect */
const diff = require('diff');

const unifiedDiff = require('../lib/unifiedDiff');

describe('unifiedDiff', () => {
  it('should produce output with context', () => {
    const lhsString = ['foo', 'bar', 'baz', 'quux', 'xuuq', 'qxqx'].join('\n');
    const rhsString = ['foo', 'bar', 'baz', 'quuq', 'xuuq', 'qxqx'].join('\n');

    const changes = diff.diffLines(lhsString, rhsString);
    const output = [];
    unifiedDiff(changes, out => output.push(out));

    expect(output, 'to equal', [
      ['=', 'foo'],
      ['=', 'bar'],
      ['=', 'baz'],
      ['<', 'quux'],
      ['>', 'quuq'],
      ['=', 'xuuq'],
      ['=', 'qxqx']
    ]);
  });

  it('should allow ending on a change', () => {
    const lhsString = ['foo', 'bar', 'baz', 'quux'].join('\n');
    const rhsString = ['foo', 'bar', 'baz', 'quuq'].join('\n');

    const changes = diff.diffLines(lhsString, rhsString);
    const output = [];
    unifiedDiff(changes, out => output.push(out));

    expect(output, 'to equal', [
      ['=', 'foo'],
      ['=', 'bar'],
      ['=', 'baz'],
      ['<', 'quux'],
      ['>', 'quuq']
    ]);
  });

  it('should support multiple chunks', () => {
    const lhsString = [
      'foo',
      'bar',
      'baz',
      'quux',
      'xuuq',
      'qxqx',
      'foo',
      'bar',
      'baz',
      'quux',
      'xuuq',
      'qxqx'
    ].join('\n');
    const rhsString = [
      'foo',
      'bar',
      'baz',
      'quuq',
      'xuuq',
      'qxqx',
      'foo',
      'bar',
      'baz',
      'quuq',
      'xuuq',
      'qxqx'
    ].join('\n');

    const changes = diff.diffLines(lhsString, rhsString);
    const output = [];
    unifiedDiff(changes, out => output.push(out));

    expect(output, 'to equal', [
      ['=', 'foo'],
      ['=', 'bar'],
      ['=', 'baz'],
      ['<', 'quux'],
      ['>', 'quuq'],
      ['=', 'xuuq'],
      ['=', 'qxqx'],
      ['=', 'foo'],
      ['~'],
      ['=', 'foo'],
      ['=', 'bar'],
      ['=', 'baz'],
      ['<', 'quux'],
      ['>', 'quuq'],
      ['=', 'xuuq'],
      ['=', 'qxqx']
    ]);
  });

  it('should support input that immediately begins with a change', () => {
    var actual = 'abc\ndef\nghi\njkl\nmno';
    var expected = 'ghi\njkl\nmno\npqr\nstu\nvwx';

    const changes = diff.diffLines(actual, expected);
    const output = [];
    unifiedDiff(changes, out => output.push(out));

    expect(output, 'to equal', [
      ['-', 'abc'],
      ['-', 'def'],
      ['=', 'ghi'],
      ['=', 'jkl'],
      ['~'],
      ['<', 'mno'],
      ['>', 'mno'],
      ['>', 'pqr'],
      ['>', 'stu'],
      ['>', 'vwx']
    ]);
  });

  it('should support a newline being removed', () => {
    const actual = '\n';
    const expected = '';

    const changes = diff.diffLines(actual, expected);
    const output = [];
    unifiedDiff(changes, out => output.push(out));

    expect(output, 'to equal', [['-', '']]);
  });

  it('should not break when the ring buffer is partially filled', () => {
    const actual = 'foo  \nbar';
    const expected = 'foo  \nquux';

    const changes = diff.diffLines(actual, expected);
    const output = [];
    unifiedDiff(changes, out => output.push(out));

    expect(output, 'to equal', [['=', 'foo  '], ['<', 'bar'], ['>', 'quux']]);
  });

  describe('when the diff ends with unchanged lines', () => {
    it('should include a marker when there are more than context lines', () => {
      const actual = 'bbbbb\n' + 'aaaaaaa\n'.repeat(10);
      const expected = 'aaaaaaa\n'.repeat(10);

      const changes = diff.diffLines(actual, expected);
      const output = [];
      unifiedDiff(changes, out => output.push(out));

      expect(output, 'to equal', [
        ['-', 'bbbbb'],
        ['=', 'aaaaaaa'],
        ['=', 'aaaaaaa'],
        ['=', 'aaaaaaa'],
        ['~']
      ]);
    });

    it('should not include a marker when there are more than context lines', () => {
      const actual = 'bbbbb\n' + 'aaaaaaa\n'.repeat(3);
      const expected = 'aaaaaaa\n'.repeat(3);

      const changes = diff.diffLines(actual, expected);
      const output = [];
      unifiedDiff(changes, out => output.push(out));

      expect(output, 'to equal', [
        ['-', 'bbbbb'],
        ['=', 'aaaaaaa'],
        ['=', 'aaaaaaa'],
        ['=', 'aaaaaaa']
      ]);
    });
  });
});
