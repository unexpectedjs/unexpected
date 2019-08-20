/* global expect */
if (typeof Buffer !== 'undefined') {
  describe('when decoded as assertion', () => {
    it('should decode a Buffer instance to utf-8', () => {
      expect(
        Buffer.from('æøå', 'utf-8'),
        'when decoded as',
        'utf-8',
        'to equal',
        'æøå'
      );
    });

    it('should render a diff when the assertion fails', () => {
      expect(
        () => {
          expect(
            Buffer.from('abc', 'utf-8'),
            'when decoded as',
            'utf-8',
            expect.it('to equal', 'def')
          );
        },
        'to throw',
        'expected Buffer.from([0x61, 0x62, 0x63])\n' +
          "when decoded as 'utf-8', expect.it('to equal', 'def')\n" +
          '\n' +
          '-abc\n' +
          '+def'
      );
    });

    it('should should provide the result as the fulfillment value if no assertion is provided', () => {
      return expect(Buffer.from('æøå', 'utf-8'), 'decoded as', 'utf-8').then(
        function(result) {
          expect(result, 'to equal', 'æøå');
        }
      );
    });
  });
}
