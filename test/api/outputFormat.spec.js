/* global expect */
describe('outputFormat', () => {
  describe('when given a format', () => {
    it('decides the output that will be used for serializing errors', () => {
      expect(
        function () {
          const clonedExpect = expect.clone().outputFormat('html');
          clonedExpect(42, 'to equal', 24);
        },
        'to throw',
        {
          htmlMessage:
            '<div style="font-family: monospace; white-space: nowrap">' +
            '<div><span style="color: red; font-weight: bold">expected</span>&nbsp;<span style="color: #0086b3">42</span>&nbsp;<span style="color: red; font-weight: bold">to&nbsp;equal</span>&nbsp;<span style="color: #0086b3">24</span></div>' +
            '</div>',
        }
      );

      expect(
        function () {
          const clonedExpect = expect.clone().outputFormat('ansi');
          clonedExpect(42, 'to equal', 24);
        },
        'to throw',
        {
          message:
            '\n\x1b[31m\x1b[1mexpected\x1b[22m\x1b[39m 42 \x1b[31m\x1b[1mto equal\x1b[22m\x1b[39m 24\n',
        }
      );
    });
  });
});
