/*global expectWithUnexpectedMagicPen*/
describe('removedHighlight', () => {
  const expect = expectWithUnexpectedMagicPen;

  var text = 'foo\nbar';

  describe('in text mode', () => {
    it('escapes the newlines', () => {
      var pen = expect.createOutput('text').removedHighlight(text);
      expect(pen.toString(), 'to equal', 'foo\\n\n^^^^\nbar\n^^^');

      expect(
        pen,
        'to equal',
        expect
          .createOutput('text')
          .block(function() {
            this.text('foo')
              .nl()
              .text('^^^');
          })
          .block(function() {
            this.diffRemovedHighlight('\\n')
              .nl()
              .text('^');
          })
          .nl()
          .block(function() {
            this.text('bar')
              .nl()
              .text('^^^');
          })
      );
    });
  });

  describe('in ansi mode', () => {
    it('does not output leading + and -', () => {
      expect(
        expect.createOutput('ansi').removedHighlight(text),
        'to equal',
        expect
          .createOutput('ansi')
          .diffRemovedHighlight('foo\\n')
          .nl()
          .diffRemovedHighlight('bar')
      );
    });
  });
});
