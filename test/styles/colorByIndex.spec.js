/* global expectWithUnexpectedMagicPen */
describe('colorByIndex', () => {
  var expect = expectWithUnexpectedMagicPen;

  describe('in a mode that has a palette', () => {
    it('should output colored text', () => {
      expect(
        expect.createOutput('ansi').colorByIndex('foo', 0),
        'to equal',
        expect.createOutput('ansi').text('foo', '#FF1A53')
      );
    });
  });

  describe('in a mode without a palette', () => {
    it('should output uncolored text', () => {
      var output = expect.createOutput('text').colorByIndex('foo', 0);
      expect(output, 'to equal', expect.createOutput('text').text('foo'));
      expect(output.output, 'to satisfy', {
        0: {
          0: {
            style: 'text',
            args: { content: 'foo', styles: [] },
          },
        },
      });
    });
  });
});
