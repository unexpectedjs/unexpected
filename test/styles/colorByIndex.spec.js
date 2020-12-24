/* global expectWithUnexpectedMagicPen */
describe('colorByIndex', () => {
  const expect = expectWithUnexpectedMagicPen;

  describe('in a mode that has a palette', () => {
    it('should output colored text', () => {
      expect(expect.createOutput('ansi').colorByIndex('foo', 0)).toEqual(
        expect.createOutput('ansi').text('foo', '#FF1A53')
      );
    });
  });

  describe('in a mode without a palette', () => {
    it('should output uncolored text', () => {
      const output = expect.createOutput('text').colorByIndex('foo', 0);
      expect(output).toEqual(expect.createOutput('text').text('foo'));
      expect(output.output).toSatisfy({
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
