/* global expectWithUnexpectedMagicPen */
describe('stringDiff', () => {
  var expect = expectWithUnexpectedMagicPen;

  var actual = 'abc\ndef\nghi\njkl\nmno';
  var expected = 'ghi\njkl\nmno\npqr\nstu\nvwx';

  describe('in text mode', () => {
    it('outputs leading + and - in text mode', () => {
      var pen = expect.createOutput('text').stringDiff(actual, expected);
      expect(
        pen.toString(),
        'to equal',
        '-abc\n' +
          '-def\n' +
          ' ghi\n' +
          ' jkl\n' +
          '-mno\n' +
          '+mno\n' +
          '+pqr\n' +
          '+stu\n' +
          '+vwx'
      );

      expect(
        pen,
        'to equal',
        expect
          .createOutput('text')
          .block(function() {
            this.diffRemovedLine('-')
              .nl()
              .diffRemovedLine('-');
          })
          .block(function() {
            this.diffRemovedLine('abc')
              .nl()
              .diffRemovedLine('def');
          })
          .nl()
          .text(' ghi')
          .nl()
          .text(' jkl')
          .nl()
          .block(function() {
            this.diffRemovedLine('-');
          })
          .block(function() {
            this.diffRemovedLine('mno');
          })
          .nl()
          .block(function() {
            this.diffAddedLine('+')
              .nl()
              .diffAddedLine('+')
              .nl()
              .diffAddedLine('+')
              .nl()
              .diffAddedLine('+');
          })
          .block(function() {
            this.diffAddedLine('mno')
              .nl()
              .diffAddedHighlight('pqr')
              .nl()
              .diffAddedHighlight('stu')
              .nl()
              .diffAddedHighlight('vwx');
          })
      );
    });
  });

  describe('in ansi mode', () => {
    it('does not output leading + and -', () => {
      expect(
        expect.createOutput('ansi').stringDiff(actual, expected),
        'to equal',
        expect
          .createOutput('ansi')
          .diffRemovedLine('abc')
          .nl()
          .diffRemovedLine('def')
          .nl()
          .text('ghi')
          .nl()
          .text('jkl')
          .nl()
          .diffRemovedLine('mno')
          .nl()
          .diffAddedLine('mno')
          .nl()
          .diffAddedHighlight('pqr')
          .nl()
          .diffAddedHighlight('stu')
          .nl()
          .diffAddedHighlight('vwx')
      );
    });

    it('renders escaped newlines when a line has been removed', () => {
      expect(
        expect.createOutput('ansi').stringDiff('\n', ''),
        'to equal',
        expect
          .createOutput('ansi')
          .diffRemovedSpecialChar('\\n')
          .nl()
      );
    });

    it('renders escaped newlines when a line has been added', () => {
      expect(
        expect.createOutput('ansi').stringDiff('', '\n'),
        'to equal',
        expect
          .createOutput('ansi')
          .diffAddedSpecialChar('\\n')
          .nl()
      );
    });

    it('highlights trailing whitespace in an added line', () => {
      expect(
        expect.createOutput('ansi').stringDiff('  \n', ''),
        'to equal',
        expect
          .createOutput('ansi')
          .diffRemovedHighlight('  ')
          .nl()
      );
    });

    it('highlights trailing whitespace in a removed line', () => {
      expect(
        expect.createOutput('ansi').stringDiff('', '  \n'),
        'to equal',
        expect
          .createOutput('ansi')
          .diffAddedHighlight('  ')
          .nl()
      );
    });

    it('does not highlight "trailing" whitespace in removed and added chunks within a line', () => {
      expect(
        expect
          .createOutput('ansi')
          .stringDiff('foo bar quux baz', 'foo quux bar baz'),
        'to equal',
        expect
          .createOutput('ansi')
          .diffRemovedLine('foo bar ')
          .diffRemovedHighlight('quux ')
          .diffRemovedLine('baz')
          .nl()
          .diffAddedLine('foo ')
          .diffAddedHighlight('quux ')
          .diffAddedLine('bar baz')
      );
    });

    it('does not highlight trailing whitespace in an unchanged line', () => {
      expect(
        expect.createOutput('ansi').stringDiff('foo  \nbar', 'foo  \nquux'),
        'to equal',
        expect
          .createOutput('ansi')
          .text('foo  ')
          .nl()
          .diffRemovedHighlight('bar')
          .nl()
          .diffAddedHighlight('quux')
      );
    });

    it('should escape an added newline immediately following a replaced chunk', () => {
      expect(
        expect.createOutput('ansi').stringDiff('aa );', '\n);'),
        'to equal',
        expect
          .createOutput('ansi')
          .diffRemovedHighlight('aa ')
          .diffRemovedLine(');')
          .nl()
          .diffAddedSpecialChar('\\n')
          .nl()
          .diffAddedLine(');')
      );
    });
  });

  describe('stringDiffFragment', () => {
    // This case is not directly exercised by the stringDiff style as special chars
    // are not marked up in unchanged chunks:
    it('should render a special char in an unchanged string', () => {
      expect(
        expect
          .createOutput('text')
          .stringDiffFragment(' ', '\ufffd', 'text', true),
        'to equal',
        expect
          .createOutput('text')
          .raw(' ')
          .text('\ufffd')
      );
    });
  });
});
