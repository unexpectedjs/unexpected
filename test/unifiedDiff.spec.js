/* global expect */
const diff = require('diff');

const unifiedDiff = require('../lib/unifiedDiff');

describe('unifiedDiff', () => {
  it('should produce output with context', () => {
    const lhsString = ['foo', 'bar', 'baz', 'quux', 'xuuq', 'qxqx'].join('\n');
    const rhsString = ['foo', 'bar', 'baz', 'quuq', 'xuuq', 'qxqx'].join('\n');

    const changes = diff.diffLines(lhsString, rhsString);
    const output = [];
    unifiedDiff(changes, (...args) => output.push(args));

    expect(output, 'to equal', [
      ['=', 'foo'],
      ['=', 'bar'],
      ['=', 'baz'],
      [
        's',
        { replaced: true, oldValue: 'quux\n', newValue: 'quuq\n' },
        { isLastChange: false }
      ],
      ['=', 'xuuq', { isLastChange: true }],
      ['=', 'qxqx', { isLastChange: true }]
    ]);
  });

  it('should allow ending on a change', () => {
    const lhsString = ['foo', 'bar', 'baz', 'quux'].join('\n');
    const rhsString = ['foo', 'bar', 'baz', 'quuq'].join('\n');

    const changes = diff.diffLines(lhsString, rhsString);
    const output = [];
    unifiedDiff(changes, (...args) => output.push(args));

    expect(output, 'to equal', [
      ['=', 'foo'],
      ['=', 'bar'],
      ['=', 'baz'],
      [
        's',
        { replaced: true, oldValue: 'quux', newValue: 'quuq' },
        { isLastChange: true }
      ]
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
    unifiedDiff(changes, (...args) => output.push(args));

    expect(output, 'to equal', [
      ['=', 'foo'],
      ['=', 'bar'],
      ['=', 'baz'],
      [
        's',
        { replaced: true, oldValue: 'quux\n', newValue: 'quuq\n' },
        { isLastChange: false }
      ],
      ['=', 'xuuq', { isLastChange: false }],
      ['=', 'qxqx', { isLastChange: false }],
      ['=', 'foo', { isLastChange: false }],
      ['~'],
      ['=', 'foo'],
      ['=', 'bar'],
      ['=', 'baz'],
      [
        's',
        { replaced: true, oldValue: 'quux\n', newValue: 'quuq\n' },
        { isLastChange: false }
      ],
      ['=', 'xuuq', { isLastChange: true }],
      ['=', 'qxqx', { isLastChange: true }]
    ]);
  });

  it('should support input that immediately begins with a change', () => {
    var actual = 'abc\ndef\nghi\njkl\nmno';
    var expected = 'ghi\njkl\nmno\npqr\nstu\nvwx';

    const changes = diff.diffLines(actual, expected);
    const output = [];
    unifiedDiff(changes, (...args) => output.push(args));

    expect(output, 'to equal', [
      ['-', 'abc', { isLastChange: false }],
      ['-', 'def', { isLastChange: false }],
      ['=', 'ghi', { isLastChange: false }],
      ['=', 'jkl', { isLastChange: false }],
      ['~'],
      [
        's',
        { replaced: true, oldValue: 'mno', newValue: 'mno\npqr\nstu\nvwx' },
        { isLastChange: true }
      ]
    ]);
  });

  it('should support a newline being removed', () => {
    const actual = '\n';
    const expected = '';

    const changes = diff.diffLines(actual, expected);
    const output = [];
    unifiedDiff(changes, (...args) => output.push(args));

    expect(output, 'to equal', [['-', '\n', { isLastChange: true }]]);
  });

  it('should support a string ending with a newline', () => {
    const actual = 'foo\n';
    const expected = 'foo';

    const changes = diff.diffLines(actual, expected);
    const output = [];
    unifiedDiff(changes, (...args) => output.push(args));

    expect(output, 'to equal', [
      [
        's',
        { replaced: true, oldValue: 'foo\n', newValue: 'foo' },
        { isLastChange: true }
      ]
    ]);
  });

  it('should support an empty removed line', () => {
    const actual = 'foo\n\nbar';
    const expected = 'foo\nbar';

    const changes = diff.diffLines(actual, expected);
    const output = [];
    unifiedDiff(changes, (...args) => output.push(args));

    expect(output, 'to equal', [
      ['=', 'foo'],
      ['-', '', { isLastChange: false }],
      ['=', 'bar', { isLastChange: true }]
    ]);
  });

  it('should always output context after a marker', () => {
    const actual =
      'foo1\nfoo2\nfoo3\nfoo4\nfoo5\nfoo6\nfoo7\nfoo8\nfoo9\nfoo10';
    const expected =
      'bar1\nfoo2\nfoo3\nfoo4\nfoo5\nfoo6\nfoo7\nfoo8\nfoo9\nbar10';

    const changes = diff.diffLines(actual, expected);
    const output = [];
    unifiedDiff(changes, (...args) => output.push(args));

    expect(output, 'to equal', [
      [
        's',
        { replaced: true, oldValue: 'foo1\n', newValue: 'bar1\n' },
        { isLastChange: false }
      ],
      ['=', 'foo2', { isLastChange: false }],
      ['=', 'foo3', { isLastChange: false }],
      ['=', 'foo4', { isLastChange: false }],
      ['~'],
      ['=', 'foo7'],
      ['=', 'foo8'],
      ['=', 'foo9'],
      [
        's',
        { replaced: true, oldValue: 'foo10', newValue: 'bar10' },
        { isLastChange: true }
      ]
    ]);
  });

  it('should not break when the ring buffer is partially filled', () => {
    const actual = 'foo  \nbar';
    const expected = 'foo  \nquux';

    const changes = diff.diffLines(actual, expected);
    const output = [];
    unifiedDiff(changes, (...args) => output.push(args));

    expect(output, 'to equal', [
      ['=', 'foo  '],
      [
        's',
        { replaced: true, oldValue: 'bar', newValue: 'quux' },
        { isLastChange: true }
      ]
    ]);
  });

  describe('when the diff starts with unchanged lines', () => {
    it('should include a marker when there are more than context lines', () => {
      const actual = 'aaaaaaa\n'.repeat(10) + 'bbbbb';
      const expected = 'aaaaaaa\n'.repeat(10);

      const changes = diff.diffLines(actual, expected);
      const output = [];
      unifiedDiff(changes, (...args) => output.push(args));

      expect(output, 'to equal', [
        ['~'],
        ['=', 'aaaaaaa'],
        ['=', 'aaaaaaa'],
        ['=', 'aaaaaaa'],
        ['-', 'bbbbb', { isLastChange: true }]
      ]);
    });

    it('should not include a marker when there are more than context lines', () => {
      const actual = 'aaaaaaa\n'.repeat(3) + 'bbbbb';
      const expected = 'aaaaaaa\n'.repeat(3);

      const changes = diff.diffLines(actual, expected);
      const output = [];
      unifiedDiff(changes, (...args) => output.push(args));

      expect(output, 'to equal', [
        ['=', 'aaaaaaa'],
        ['=', 'aaaaaaa'],
        ['=', 'aaaaaaa'],
        ['-', 'bbbbb', { isLastChange: true }]
      ]);
    });
  });

  describe('when the diff ends with unchanged lines', () => {
    it('should include a marker when there are more than context lines', () => {
      const actual = 'bbbbb\n' + 'aaaaaaa\n'.repeat(10);
      const expected = 'aaaaaaa\n'.repeat(10);

      const changes = diff.diffLines(actual, expected);
      const output = [];
      unifiedDiff(changes, (...args) => output.push(args));

      expect(output, 'to equal', [
        ['-', 'bbbbb', { isLastChange: false }],
        ['=', 'aaaaaaa', { isLastChange: true }],
        ['=', 'aaaaaaa', { isLastChange: true }],
        ['=', 'aaaaaaa', { isLastChange: true }],
        ['~']
      ]);
    });

    it('should not include a marker when there are more than context lines', () => {
      const actual = 'bbbbb\n' + 'aaaaaaa\n'.repeat(3);
      const expected = 'aaaaaaa\n'.repeat(3);

      const changes = diff.diffLines(actual, expected);
      const output = [];
      unifiedDiff(changes, (...args) => output.push(args));

      expect(output, 'to equal', [
        ['-', 'bbbbb', { isLastChange: false }],
        ['=', 'aaaaaaa', { isLastChange: true }],
        ['=', 'aaaaaaa', { isLastChange: true }],
        ['=', 'aaaaaaa', { isLastChange: true }]
      ]);
    });
  });
});
