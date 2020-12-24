/* global expectWithUnexpectedMagicPen */
describe('removedHighlight', () => {
  const expect = expectWithUnexpectedMagicPen;

  const text = 'foo\nbar';

  describe('in text mode', () => {
    it('escapes the newlines', () => {
      const pen = expect.createOutput('text').removedHighlight(text);
      expect(pen.toString()).toEqual('foo\\n\n^^^^\nbar\n^^^');

      expect(pen).toEqual(
        expect
          .createOutput('text')
          .block(function () {
            this.text('foo').nl().text('^^^');
          })
          .block(function () {
            this.diffRemovedHighlight('\\n').nl().text('^');
          })
          .nl()
          .block(function () {
            this.text('bar').nl().text('^^^');
          })
      );
    });
  });

  describe('in ansi mode', () => {
    it('does not output leading + and -', () => {
      expect(expect.createOutput('ansi').removedHighlight(text)).toEqual(
        expect
          .createOutput('ansi')
          .diffRemovedHighlight('foo')
          .diffRemovedSpecialChar('\\n')
          .nl()
          .diffRemovedHighlight('bar')
      );
    });
  });
});
